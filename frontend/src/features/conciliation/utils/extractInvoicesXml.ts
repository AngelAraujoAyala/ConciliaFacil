import type { InvoiceXML } from "../../../types";

/**
 * Helper para obtener un atributo de un elemento XML soportando prefijos de namespace
 * (ej. busca tanto 'cfdi:Emisor' como 'Emisor' por seguridad entre navegadores)
 */
const getElementAttribute = (
  xmlDoc: Document,
  tagName: string,
  attrName: string,
): string => {
  // Intentar con el prefijo estándar del SAT
  let element = xmlDoc.getElementsByTagName(`cfdi:${tagName}`)[0];

  // Fallback por si el navegador limpia los prefijos al parsear
  if (!element) {
    element = xmlDoc.getElementsByTagName(tagName)[0];
  }

  // Si es el Timbre Fiscal Digital (UUID) suele tener el prefijo tfd
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

  // Validar si el XML tiene errores de parseo básicos
  const parseError = xmlDoc.getElementsByTagName("parsererror")[0];
  if (parseError) return null;

  // 1. Datos del comprobante raíz (cfdi:Comprobante)
  let comprobante = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
  if (!comprobante) {
    comprobante = xmlDoc.getElementsByTagName("Comprobante")[0];
  }

  if (!comprobante) return null;

  const fechaRaw = comprobante.getAttribute("Fecha") || ""; // Formato SAT: YYYY-MM-DDTHH:mm:ss
  const fecha = fechaRaw.split("T")[0]; // Nos quedamos solo con YYYY-MM-DD
  const totalStr = comprobante.getAttribute("Total") || "0";
  const total = parseFloat(totalStr);

  // TipoDeComprobante: 'I' = Ingreso, 'E' = Egreso
  const tipoComprobanteSat =
    comprobante.getAttribute("TipoDeComprobante") || "I";
  const type = tipoComprobanteSat === "E" ? "EGRESO" : "INGRESO";

  // 2. Datos de Emisor y Receptor
  const rfcEmisor = getElementAttribute(xmlDoc, "Emisor", "Rfc");
  const nameEmisor =
    getElementAttribute(xmlDoc, "Emisor", "Nombre") || "Emisor Desconocido";
  const rfcReceptor = getElementAttribute(xmlDoc, "Receptor", "Rfc");
  const nameReceptor =
    getElementAttribute(xmlDoc, "Receptor", "Nombre") || "Receptor Desconocido";

  // 3. Folio Fiscal Unico (UUID) del Timbre Fiscal Digital
  const uuid = getElementAttribute(xmlDoc, "TimbreFiscalDigital", "UUID");

  // Si no tiene UUID, no es una factura timbrada válida para conciliar
  if (!uuid) return null;

  return {
    id: uuid, // Usamos el propio UUID del SAT como ID único en nuestra app
    uuid,
    date: fecha,
    total,
    type,
    rfcEmisor,
    nameEmisor,
    rfcReceptor,
    nameReceptor,
  };
};

/**
 * Lee y extrae la información de una lista (o carpeta) de archivos XML de facturas
 */
export const extractInvoicesXml = (files: File[]): Promise<InvoiceXML[]> => {
  return new Promise((resolve) => {
    // Filtrar para asegurarnos de procesar solo archivos .xml
    const xmlFiles = files.filter((f) => f.name.toLowerCase().endsWith(".xml"));

    if (xmlFiles.length === 0) {
      resolve([]);
      return;
    }

    const invoices: InvoiceXML[] = [];
    let processedCount = 0;

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
        // Cuando todos los archivos terminen de leerse (exitosos o fallidos), resolvemos
        if (processedCount === xmlFiles.length) {
          resolve(invoices);
        }
      };

      reader.onerror = () => {
        processedCount++;
        if (processedCount === xmlFiles.length) {
          resolve(invoices);
        }
      };

      reader.readAsText(file, "UTF-8");
    });
  });
};
