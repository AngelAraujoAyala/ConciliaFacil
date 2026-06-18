import * as XLSX from "xlsx";
import type { BankMovement, MovementType } from "../../../types";

/**
 * Normaliza las fechas comunes de bancos (DD/MM/YYYY o YYYY-MM-DD) a formato ISO estándar YYYY-MM-DD
 */
const parseBankDate = (rawDate: string): string => {
  const cleanDate = rawDate.trim();

  const dmyRegex = new RegExp("^(\\d{1,2})[/-](\\d{1,2})[/-](\\d{4})");
  const dmyMatch = cleanDate.match(dmyRegex);

  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(cleanDate)) {
    return cleanDate.substring(0, 10);
  }

  try {
    const parsed = new Date(cleanDate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  } catch {
    // Fallback
  }

  return cleanDate;
};

/**
 * Procesa el texto plano en formato CSV (venga de un archivo nativo o convertido desde Excel)
 */
const processCsvText = (text: string): BankMovement[] => {
  const movements: BankMovement[] = [];
  const lines = text.split(/\r?\n/);

  // 1. Encontrar la fila de encabezados
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (
      lineLower.includes("fecha") &&
      (lineLower.includes("concepto") || lineLower.includes("descripc"))
    ) {
      headerIndex = i;
      break;
    }
  }

  const startRow = headerIndex !== -1 ? headerIndex + 1 : 0;
  const colIndices = {
    date: 0,
    desc: 1,
    amount: -1,
    withdrawal: -1,
    deposit: -1,
  };

  if (headerIndex !== -1) {
    const headers = lines[headerIndex]
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());

    colIndices.date = headers.findIndex((h) => h.includes("fecha"));
    colIndices.desc = headers.findIndex(
      (h) =>
        h.includes("concepto") ||
        h.includes("descripc") ||
        h.includes("detalle") ||
        h.includes("motivo"),
    );
    colIndices.amount = headers.findIndex(
      (h) => h === "importe" || h === "monto" || h === "monto del movimiento",
    );
    colIndices.withdrawal = headers.findIndex(
      (h) =>
        h.includes("cargo") || h.includes("retiro") || h.includes("debito"),
    );
    colIndices.deposit = headers.findIndex(
      (h) =>
        h.includes("abono") || h.includes("deposito") || h.includes("credito"),
    );
  }

  // 2. Procesar las filas de datos
  for (let i = startRow; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((c) => c.replace(/^"|"$/g, "").trim());

    if (columns.length <= 1 || !columns[colIndices.date]) continue;

    const rawDate = columns[colIndices.date];
    const description = columns[colIndices.desc] || "Sin descripción";

    let amount = 0;
    let type: MovementType = "INGRESO";

    if (colIndices.withdrawal !== -1 && colIndices.deposit !== -1) {
      const withdrawalStr =
        columns[colIndices.withdrawal]?.replace(/[^0-9.-]/g, "") || "";
      const depositStr =
        columns[colIndices.deposit]?.replace(/[^0-9.-]/g, "") || "";

      const withdrawal = withdrawalStr ? parseFloat(withdrawalStr) : 0;
      const deposit = depositStr ? parseFloat(depositStr) : 0;

      if (withdrawal > 0) {
        amount = withdrawal;
        type = "EGRESO";
      } else if (deposit > 0) {
        amount = deposit;
        type = "INGRESO";
      } else {
        continue;
      }
    } else if (colIndices.amount !== -1) {
      const amountStr =
        columns[colIndices.amount]?.replace(/[^0-9.-]/g, "") || "0";
      const parsedAmount = parseFloat(amountStr);

      amount = Math.abs(parsedAmount);
      type = parsedAmount < 0 ? "EGRESO" : "INGRESO";
    }

    if (isNaN(amount) || amount === 0) continue;

    movements.push({
      id: crypto.randomUUID(),
      date: parseBankDate(rawDate),
      description,
      amount,
      type,
      status: "UNMATCHED",
    });
  }

  return movements;
};

/**
 * Parsea un archivo de estado de cuenta (bancario) soportando tanto CSV como Excel (.xlsx, .xls)
 */
export const extractBankMovements = (file: File): Promise<BankMovement[]> => {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const isExcel = fileExtension === "xlsx" || fileExtension === "xls";

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let csvText = "";

        if (isExcel) {
          // Leer el archivo binario de Excel
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          // Tomar la primera pestaña/hoja del libro de Excel
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Transformarla a formato CSV en memoria string
          csvText = XLSX.utils.sheet_to_csv(worksheet);
        } else {
          // Si ya es un CSV nativo, se lee el texto directamente
          csvText = e.target?.result as string;
        }

        if (!csvText) {
          resolve([]);
          return;
        }

        // Ejecutar el extractor unificado
        const movements = processCsvText(csvText);
        resolve(movements);
      } catch {
        reject(
          new Error("Error al procesar la estructura del archivo bancario."),
        );
      }
    };

    reader.onerror = () =>
      reject(new Error("Error al leer el archivo desde el dispositivo."));

    // Ejecutar el método de lectura correcto según el formato
    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, "UTF-8");
    }
  });
};
