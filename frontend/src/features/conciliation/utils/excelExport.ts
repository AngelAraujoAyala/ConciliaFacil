import ExcelJS from "exceljs";
import type { BankMovement, InvoiceXML } from "../../../types";
import type { ConciliationDetail } from "../types/history.types";

/** Cuentas contables predeterminadas para el layout de partida doble */
const ACCOUNT_CODES = {
  BANCOS: "1102-001-0001 (Bancos Nacionales)",
  CLIENTES: "1105-001-0000 (Clientes Nacionales)",
  GASTOS: "6101-000-0000 (Gastos Generales / Proveedores)",
  AJUSTE_GASTOS: "6102-000-0000 (Otros Gastos / Ajuste por Centavos)",
  AJUSTE_INGRESOS: "7101-000-0000 (Otros Ingresos / Ajuste por Centavos)",
} as const;

const LAYOUT_AMOUNT_FORMAT = "#,##0.00";
const CURRENCY_FORMAT = "$#,##0.00";
const CENT_TOLERANCE = 0.0001;

interface ExcelStyles {
  fontHeader: Partial<ExcelJS.Font>;
  fontData: Partial<ExcelJS.Font>;
  fillHeader: ExcelJS.Fill;
  borderThin: Partial<ExcelJS.Borders>;
}

interface ResolvedMovement {
  movement: BankMovement;
  isResolved: boolean;
  estado: string;
  matchedInvoices: InvoiceXML[];
  montoXml: number;
  rfc: string;
  razonSocial: string;
  uuid: string;
  notas: string;
}

interface LayoutEntryRow {
  fecha: string;
  cuentaContable: string;
  cargo: number;
  abono: number;
  concepto: string;
  uuid: string;
}

function createExcelStyles(): ExcelStyles {
  return {
    fontHeader: { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
    fontData: { name: "Arial", size: 10 },
    fillHeader: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1B365D" },
    },
    borderThin: {
      top: { style: "thin", color: { argb: "FFD3D3D3" } },
      left: { style: "thin", color: { argb: "FFD3D3D3" } },
      bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
      right: { style: "thin", color: { argb: "FFD3D3D3" } },
    },
  };
}

function isMovementResolved(movement: BankMovement): boolean {
  return (
    movement.status === "MATCHED" ||
    !!movement.isException ||
    (movement.matchedInvoiceIds?.length ?? 0) > 0
  );
}

function getMatchedInvoices(
  movement: BankMovement,
  invoices: InvoiceXML[],
): InvoiceXML[] {
  return invoices.filter((invoice) => movement.matchedInvoiceIds?.includes(invoice.id));
}

function resolveMovement(
  movement: BankMovement,
  invoices: InvoiceXML[],
): ResolvedMovement {
  const isResolved = isMovementResolved(movement);
  const matchedInvoices = getMatchedInvoices(movement, invoices);
  const montoXml = matchedInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

  let estado = "SIN XML";
  let rfc = "-";
  let razonSocial = "-";
  let uuid = "-";
  const notas = movement.notes || "";

  if (movement.isException) {
    estado = movement.exceptionType || "EXCEPCIÓN";
  } else if (isResolved) {
    estado = "CONCILIADO";
    if (matchedInvoices.length > 0) {
      rfc = matchedInvoices[0].rfcEmisor || matchedInvoices[0].rfcReceptor || "-";
      razonSocial = matchedInvoices[0].nameEmisor || matchedInvoices[0].nameReceptor || "-";
      uuid =
        matchedInvoices.length > 1
          ? matchedInvoices.map((invoice) => invoice.uuid).filter(Boolean).join(", ")
          : matchedInvoices[0].uuid || "-";
    }
  }

  return {
    movement,
    isResolved,
    estado,
    matchedInvoices,
    montoXml,
    rfc,
    razonSocial,
    uuid,
    notas,
  };
}

/** Expande movimientos M:N duplicando la fila bancaria por cada XML asociado */
function expandConciliationRows(resolved: ResolvedMovement): ResolvedMovement[] {
  if (resolved.estado !== "CONCILIADO" || resolved.matchedInvoices.length <= 1) {
    return [resolved];
  }

  return resolved.matchedInvoices.map((invoice) => ({
    ...resolved,
    montoXml: invoice.total || 0,
    rfc: invoice.rfcEmisor || invoice.rfcReceptor || "-",
    razonSocial: invoice.nameEmisor || invoice.nameReceptor || "-",
    uuid: invoice.uuid || "-",
  }));
}

function buildLayoutConcepto(resolved: ResolvedMovement): string {
  const { movement, matchedInvoices, rfc, razonSocial } = resolved;

  if (movement.isException) {
    const typeLabel = movement.exceptionType
      ? movement.exceptionType.replace("_", " ")
      : "EXCEPCIÓN";
    return `Clasificación manual [${typeLabel}] - ${movement.description}`;
  }

  if (matchedInvoices.length > 0) {
    return `Cruce auto/manual RFC: ${rfc} - ${razonSocial}`;
  }

  return `Conciliado - ${movement.description}`;
}

/**
 * Genera renglones de partida doble (2 obligatorios + 1 opcional de ajuste)
 * para cada movimiento conciliado o exceptuado.
 */
function buildLayoutEntryRows(resolved: ResolvedMovement): LayoutEntryRow[] {
  if (!resolved.isResolved) {
    return [];
  }

  const { movement, montoXml, uuid } = resolved;
  const bankAmount = movement.amount || 0;
  const bankAbs = Math.abs(bankAmount);
  const xmlAbs = montoXml > 0 ? montoXml : bankAbs;
  const isIngreso = bankAmount > 0;
  const concepto = buildLayoutConcepto(resolved);
  const fecha = movement.date;
  const sharedFields = { fecha, concepto, uuid: uuid === "-" ? "" : uuid };

  const rows: LayoutEntryRow[] = isIngreso
    ? [
        {
          ...sharedFields,
          cuentaContable: ACCOUNT_CODES.BANCOS,
          cargo: bankAbs,
          abono: 0,
        },
        {
          ...sharedFields,
          cuentaContable: ACCOUNT_CODES.CLIENTES,
          cargo: 0,
          abono: xmlAbs,
        },
      ]
    : [
        {
          ...sharedFields,
          cuentaContable: ACCOUNT_CODES.GASTOS,
          cargo: xmlAbs,
          abono: 0,
        },
        {
          ...sharedFields,
          cuentaContable: ACCOUNT_CODES.BANCOS,
          cargo: 0,
          abono: bankAbs,
        },
      ];

  const totalCargo = rows.reduce((sum, row) => sum + row.cargo, 0);
  const totalAbono = rows.reduce((sum, row) => sum + row.abono, 0);
  const centDifference = bankAbs - xmlAbs;

  if (Math.abs(centDifference) <= CENT_TOLERANCE) {
    return rows;
  }

  if (totalCargo > totalAbono) {
    rows.push({
      ...sharedFields,
      cuentaContable: ACCOUNT_CODES.AJUSTE_INGRESOS,
      cargo: 0,
      abono: totalCargo - totalAbono,
    });
  } else if (totalAbono > totalCargo) {
    rows.push({
      ...sharedFields,
      cuentaContable: ACCOUNT_CODES.AJUSTE_GASTOS,
      cargo: totalAbono - totalCargo,
      abono: 0,
    });
  }

  return rows;
}

function writeWorksheetHeaders(
  worksheet: ExcelJS.Worksheet,
  headers: string[],
  styles: ExcelStyles,
): void {
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = styles.fontHeader;
    cell.fill = styles.fillHeader;
    cell.border = styles.borderThin;
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
  worksheet.getRow(1).height = 24;
}

function applyRowFill(
  worksheet: ExcelJS.Worksheet,
  rowIdx: number,
  columnCount: number,
  fill: ExcelJS.Fill,
): void {
  for (let column = 1; column <= columnCount; column++) {
    worksheet.getCell(rowIdx, column).fill = fill;
  }
}

function autoFitWorksheetColumns(worksheet: ExcelJS.Worksheet): void {
  worksheet.columns.forEach((column) => {
    let maxLength = 10;

    column.eachCell({ includeEmpty: false }, (cell) => {
      const cellValue = cell.value;
      if (!cellValue) return;

      let text = "";
      if (typeof cellValue === "object" && cellValue !== null && "formula" in cellValue) {
        text = String(cellValue.result ?? "");
      } else {
        text = String(cellValue);
      }

      if (text.length > maxLength) {
        maxLength = text.length;
      }
    });

    column.width = Math.min(maxLength + 4, 40);
  });
}

function writeLayoutRow(
  worksheet: ExcelJS.Worksheet,
  rowIdx: number,
  entry: LayoutEntryRow,
  styles: ExcelStyles,
): void {
  worksheet.getCell(rowIdx, 1).value = entry.fecha;
  worksheet.getCell(rowIdx, 1).font = styles.fontData;
  worksheet.getCell(rowIdx, 1).border = styles.borderThin;

  const cuentaCell = worksheet.getCell(rowIdx, 2);
  cuentaCell.value = entry.cuentaContable;
  cuentaCell.numFmt = "@";
  cuentaCell.font = styles.fontData;
  cuentaCell.border = styles.borderThin;

  const cargoCell = worksheet.getCell(rowIdx, 3);
  cargoCell.value = entry.cargo;
  cargoCell.numFmt = LAYOUT_AMOUNT_FORMAT;
  cargoCell.alignment = { horizontal: "right" };
  cargoCell.font = styles.fontData;
  cargoCell.border = styles.borderThin;

  const abonoCell = worksheet.getCell(rowIdx, 4);
  abonoCell.value = entry.abono;
  abonoCell.numFmt = LAYOUT_AMOUNT_FORMAT;
  abonoCell.alignment = { horizontal: "right" };
  abonoCell.font = styles.fontData;
  abonoCell.border = styles.borderThin;

  worksheet.getCell(rowIdx, 5).value = entry.concepto;
  worksheet.getCell(rowIdx, 5).font = styles.fontData;
  worksheet.getCell(rowIdx, 5).border = styles.borderThin;

  const uuidCell = worksheet.getCell(rowIdx, 6);
  uuidCell.value = entry.uuid;
  uuidCell.numFmt = "@";
  uuidCell.font = styles.fontData;
  uuidCell.border = styles.borderThin;
}

function buildSummaryWorksheet(
  workbook: ExcelJS.Workbook,
  detail: ConciliationDetail,
  movements: BankMovement[],
  styles: ExcelStyles,
): void {
  const worksheet = workbook.addWorksheet("Resumen", {
    views: [{ showGridLines: true }],
  });

  worksheet.getCell("A1").value = `Resumen Ejecutivo de Auditoría - ${detail.title}`;
  worksheet.getCell("A1").font = {
    name: "Arial",
    size: 14,
    bold: true,
    color: { argb: "FF1B365D" },
  };
  worksheet.getRow(1).height = 25;

  worksheet.getCell("A3").value = "Concepto";
  worksheet.getCell("B3").value = "Monto";
  worksheet.getCell("A3").font = styles.fontHeader;
  worksheet.getCell("B3").font = styles.fontHeader;
  worksheet.getCell("A3").fill = styles.fillHeader;
  worksheet.getCell("B3").fill = styles.fillHeader;
  worksheet.getCell("A3").border = styles.borderThin;
  worksheet.getCell("B3").border = styles.borderThin;

  let totalBancoValue = 0;
  let totalConciliadoValue = 0;
  let totalSinXmlValue = 0;

  movements.forEach((movement) => {
    const amount = movement.amount || 0;
    totalBancoValue += amount;

    if (isMovementResolved(movement)) {
      totalConciliadoValue += amount;
    } else {
      totalSinXmlValue += amount;
    }
  });

  worksheet.getCell("A4").value = "Total banco";
  worksheet.getCell("B4").value = totalBancoValue;
  worksheet.getCell("A5").value = "Total conciliado (Matched + Excepciones)";
  worksheet.getCell("B5").value = totalConciliadoValue;
  worksheet.getCell("A6").value = "Total sin XML (Pendientes reales)";
  worksheet.getCell("B6").value = totalSinXmlValue;

  ["A4", "A5", "A6", "B4", "B5", "B6"].forEach((cellRef) => {
    const cell = worksheet.getCell(cellRef);
    cell.font = styles.fontData;
    cell.border = styles.borderThin;

    if (cellRef.startsWith("B")) {
      cell.numFmt = CURRENCY_FORMAT;
      cell.alignment = { horizontal: "right" };
    }
  });

  worksheet.getCell("A8").value = "Total Control Calculado (Fórmula SUM)";
  worksheet.getCell("A8").font = { name: "Arial", size: 10, bold: true };
  worksheet.getCell("A8").border = styles.borderThin;

  const totalFormulaCell = worksheet.getCell("B8");
  totalFormulaCell.value = {
    formula: "SUM(B5:B6)",
    result: totalConciliadoValue + totalSinXmlValue,
  };
  totalFormulaCell.font = { name: "Arial", size: 10, bold: true };
  totalFormulaCell.border = styles.borderThin;
  totalFormulaCell.numFmt = CURRENCY_FORMAT;
  totalFormulaCell.alignment = { horizontal: "right" };
}

function buildConciliationWorksheet(
  workbook: ExcelJS.Workbook,
  detail: ConciliationDetail,
  movements: BankMovement[],
  styles: ExcelStyles,
): void {
  const worksheet = workbook.addWorksheet("Conciliación Bancaria", {
    views: [{ showGridLines: true }],
  });

  const headers = [
    "Estado",
    "Fecha Banco",
    "Concepto",
    "Monto Banco",
    "RFC",
    "Razón Social",
    "UUID",
    "Monto XML",
    "Diferencia",
    "Notas",
  ];

  writeWorksheetHeaders(worksheet, headers, styles);

  const exportRows = movements
    .map((movement) => resolveMovement(movement, detail.invoices))
    .flatMap(expandConciliationRows);

  exportRows.forEach((resolved, index) => {
    const rowIdx = index + 2;
    const { movement, estado, rfc, razonSocial, uuid, montoXml, notas } = resolved;
    const rowValues: Array<string | number | null> = [
      estado,
      movement.date,
      movement.description,
      movement.amount,
      rfc,
      razonSocial,
      uuid,
      montoXml,
      null,
      notas,
    ];

    rowValues.forEach((value, columnIdx) => {
      const cell = worksheet.getCell(rowIdx, columnIdx + 1);

      if (columnIdx === 8) {
        cell.value = {
          formula: `D${rowIdx}-H${rowIdx}`,
          result: (movement.amount || 0) - montoXml,
        };
      } else {
        cell.value = value;
      }

      cell.font = styles.fontData;
      cell.border = styles.borderThin;

      if (columnIdx === 6) {
        cell.numFmt = "@";
      }

      if (columnIdx === 3 || columnIdx === 7 || columnIdx === 8) {
        cell.numFmt = CURRENCY_FORMAT;
        cell.alignment = { horizontal: "right" };
      }
    });

    if (estado === "CONCILIADO") {
      applyRowFill(worksheet, rowIdx, headers.length, {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE2EFDA" },
      });
    } else if (estado === "SIN XML") {
      applyRowFill(worksheet, rowIdx, headers.length, {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFCE4D6" },
      });
    }
  });

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, exportRows.length + 1), column: headers.length },
  };
}

function buildOrphansWorksheet(
  workbook: ExcelJS.Workbook,
  detail: ConciliationDetail,
  styles: ExcelStyles,
): void {
  const worksheet = workbook.addWorksheet("XMLs Huérfanos", {
    views: [{ showGridLines: true }],
  });

  const headers = [
    "UUID",
    "RFC Emisor",
    "Nombre Emisor",
    "RFC Receptor",
    "Nombre Receptor",
    "Fecha",
    "Monto",
  ];

  writeWorksheetHeaders(worksheet, headers, styles);

  (detail.remainingInvoices || []).forEach((invoice, index) => {
    const rowIdx = index + 2;
    const rowValues = [
      invoice.uuid,
      invoice.rfcEmisor || "-",
      invoice.nameEmisor || "-",
      invoice.rfcReceptor || "-",
      invoice.nameReceptor || "-",
      invoice.date || "-",
      invoice.total || 0,
    ];

    rowValues.forEach((value, columnIdx) => {
      const cell = worksheet.getCell(rowIdx, columnIdx + 1);
      cell.value = value;
      cell.font = styles.fontData;
      cell.border = styles.borderThin;

      if (columnIdx === 0) {
        cell.numFmt = "@";
      }

      if (columnIdx === 6) {
        cell.numFmt = CURRENCY_FORMAT;
        cell.alignment = { horizontal: "right" };
      }
    });
  });
}

function buildLayoutWorksheet(
  workbook: ExcelJS.Workbook,
  detail: ConciliationDetail,
  movements: BankMovement[],
  styles: ExcelStyles,
): void {
  const worksheet = workbook.addWorksheet("Layout Contable", {
    views: [{ showGridLines: true }],
  });

  const headers = ["Fecha", "Cuenta Contable", "Cargo", "Abono", "Concepto", "UUID"];
  writeWorksheetHeaders(worksheet, headers, styles);

  let layoutRowIdx = 2;

  movements.forEach((movement) => {
    const resolved = resolveMovement(movement, detail.invoices);
    const layoutRows = buildLayoutEntryRows(resolved);

    layoutRows.forEach((entry) => {
      writeLayoutRow(worksheet, layoutRowIdx, entry, styles);
      layoutRowIdx += 1;
    });
  });
}

export async function exportConciliationToExcel(detail: ConciliationDetail): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ConciliaFácil";
  workbook.lastModifiedBy = "ConciliaFácil";
  workbook.created = new Date();
  workbook.modified = new Date();

  const styles = createExcelStyles();
  const movements = detail.movements || [];

  buildSummaryWorksheet(workbook, detail, movements, styles);
  buildConciliationWorksheet(workbook, detail, movements, styles);
  buildOrphansWorksheet(workbook, detail, styles);
  buildLayoutWorksheet(workbook, detail, movements, styles);

  workbook.worksheets.forEach(autoFitWorksheetColumns);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;

  const fileName = `Auditoria_${detail.title.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
