import type { InvoiceXML } from "../../../types";

export interface ExtractInvoicesXmlResult {
  invoices: InvoiceXML[];
  rfcEmpresaDetectado: string | null;
  hasMixedRfcs: boolean;
}

interface RfcAnalysis {
  rfcEmpresaDetectado: string | null;
  hasMixedRfcs: boolean;
}

/**
 * Cuenta frecuencias de RFC emisor/receptor para deducir el RFC del cliente
 * y valida que todas las facturas pertenezcan al mismo contribuyente.
 */
function analizarYValidarRfcs(invoices: InvoiceXML[]): RfcAnalysis {
  if (invoices.length === 0) {
    return { rfcEmpresaDetectado: null, hasMixedRfcs: false };
  }

  const frequency = new Map<string, number>();
  const receptorFrequency = new Map<string, number>();

  for (const invoice of invoices) {
    if (invoice.rfcEmisor) {
      frequency.set(invoice.rfcEmisor, (frequency.get(invoice.rfcEmisor) ?? 0) + 1);
    }
    if (invoice.rfcReceptor) {
      frequency.set(
        invoice.rfcReceptor,
        (frequency.get(invoice.rfcReceptor) ?? 0) + 1,
      );
      receptorFrequency.set(
        invoice.rfcReceptor,
        (receptorFrequency.get(invoice.rfcReceptor) ?? 0) + 1,
      );
    }
  }

  let rfcEmpresaDetectado: string | null = null;
  let maxFrequency = 0;

  for (const [rfc, count] of frequency) {
    if (count > maxFrequency) {
      maxFrequency = count;
      rfcEmpresaDetectado = rfc;
      continue;
    }

    if (count === maxFrequency && rfcEmpresaDetectado) {
      const currentReceptorCount = receptorFrequency.get(rfcEmpresaDetectado) ?? 0;
      const candidateReceptorCount = receptorFrequency.get(rfc) ?? 0;
      if (candidateReceptorCount > currentReceptorCount) {
        rfcEmpresaDetectado = rfc;
      }
    }
  }

  const hasMixedRfcs =
    rfcEmpresaDetectado !== null &&
    invoices.some(
      (invoice) =>
        invoice.rfcEmisor !== rfcEmpresaDetectado &&
        invoice.rfcReceptor !== rfcEmpresaDetectado,
    );

  return { rfcEmpresaDetectado, hasMixedRfcs };
}

/**
 * Helper para obtener un atributo de un elemento XML soportando prefijos de namespace
 * (ej. busca tanto 'cfdi:Emisor' como 'Emisor' por seguridad entre navegadores)
 */
const getElementAttribute = (
  xmlDoc: Document,
  tagName: string,
  attrName: string,
): string => {
  let element = xmlDoc.getElementsByTagName(`cfdi:${tagName}`)[0];

  if (!element) {
    element = xmlDoc.getElementsByTagName(tagName)[0];
  }

  if (!element && tagName === "TimbreFiscalDigital") {
    element = xmlDoc.getElementsByTagName(`tfd:${tagName}`)[0];
  }

  return element?.getAttribute(attrName) || "";
};

/**
 * Procesa un único archivo XML y extrae la información relevante del CFDI
 */
const parseSingleXml = (xmlText: string): InvoiceXML | null => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  const parseError = xmlDoc.getElementsByTagName("parsererror")[0];
  if (parseError) return null;

  let comprobante = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
  if (!comprobante) {
    comprobante = xmlDoc.getElementsByTagName("Comprobante")[0];
  }

  if (!comprobante) return null;

  const fechaRaw = comprobante.getAttribute("Fecha") || "";
  const fecha = fechaRaw.split("T")[0];
  const tipoComprobanteSat = comprobante.getAttribute("TipoDeComprobante") || "I";
  const type =
    tipoComprobanteSat === "E"
      ? "EGRESO"
      : tipoComprobanteSat === "P"
        ? "INGRESO"
        : "INGRESO";

  const rfcEmisor = getElementAttribute(xmlDoc, "Emisor", "Rfc");
  const nameEmisor =
    getElementAttribute(xmlDoc, "Emisor", "Nombre") || "Emisor Desconocido";
  const rfcReceptor = getElementAttribute(xmlDoc, "Receptor", "Rfc");
  const nameReceptor =
    getElementAttribute(xmlDoc, "Receptor", "Nombre") || "Receptor Desconocido";

  const uuid = getElementAttribute(xmlDoc, "TimbreFiscalDigital", "UUID");
  if (!uuid) return null;

  let totalStr: string;
  if (tipoComprobanteSat === "P") {
    let pagoElement = xmlDoc.getElementsByTagName("pago20:Pago")[0];
    if (!pagoElement) pagoElement = xmlDoc.getElementsByTagName("Pago")[0];

    totalStr = pagoElement?.getAttribute("Monto") || "0";
  } else {
    totalStr = comprobante.getAttribute("Total") || "0";
  }

  const total = parseFloat(totalStr);

  return {
    id: uuid,
    uuid,
    date: fecha,
    total,
    type,
    rfcEmisor,
    nameEmisor,
    rfcReceptor,
    nameReceptor,
    matchedMovementIds: [],
    isComplemento: tipoComprobanteSat === "P",
  };
};

/**
 * Lee y extrae la información de una lista (o carpeta) de archivos XML de facturas,
 * detectando el RFC de la empresa y validando consistencia del lote.
 */
export const extractInvoicesXml = (files: File[]): Promise<ExtractInvoicesXmlResult> => {
  return new Promise((resolve) => {
    const xmlFiles = files.filter((f) => f.name.toLowerCase().endsWith(".xml"));

    if (xmlFiles.length === 0) {
      resolve({
        invoices: [],
        rfcEmpresaDetectado: null,
        hasMixedRfcs: false,
      });
      return;
    }

    const invoices: InvoiceXML[] = [];
    let processedCount = 0;

    const finalize = () => {
      const { rfcEmpresaDetectado, hasMixedRfcs } = analizarYValidarRfcs(invoices);
      resolve({ invoices, rfcEmpresaDetectado, hasMixedRfcs });
    };

    xmlFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const invoice = parseSingleXml(text);
          if (invoice) {
            invoices.push(invoice);
          }
        }

        processedCount++;
        if (processedCount === xmlFiles.length) {
          finalize();
        }
      };

      reader.onerror = () => {
        processedCount++;
        if (processedCount === xmlFiles.length) {
          finalize();
        }
      };

      reader.readAsText(file, "UTF-8");
    });
  });
};
