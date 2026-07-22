import React from "react";
import { FileSpreadsheet } from "lucide-react";

export const ResourcesSection: React.FC = () => {
  const handleDownloadTemplate = () => {
    // Generar plantilla estructurada limpia para el extractor
    const csvRows = [
      ["Detalle de Movimientos - Cuenta ************1234"],
      ["Periodo: Del DD/MM/AAAA al DD/MM/AAAA"],
      [], // Fila en blanco de estructura de cabecera
      ["FECHA", "CONCEPTO", "REFERENCIA", "CARGO", "ABONO", "SALDO"],
      ["01/07/2026", "TRANSFERENCIA RECIBIDA SPEI", "1234567", "", "5000.00", "15000.00"],
      ["02/07/2026", "PAGO DE SERVICIOS ONLINE", "9876543", "899.00", "", "14101.00"],
      ["03/07/2026", "RETIRO CAJERO AUTOMATICO", "1112223", "1000.00", "", "13101.00"]
    ];
    
    const csvContent = csvRows
      .map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
      .join("\n");
      
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_movimientos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm space-y-3 dark:bg-slate-950 dark:border dark:border-slate-800">
      <FileSpreadsheet size={24} className="text-emerald-400" />
      <h3 className="font-semibold text-sm">¿Problemas con tus archivos?</h3>
      <p className="text-xs text-slate-400 leading-relaxed dark:text-slate-500">
        Descarga una plantilla estructurada correctamente para comprender el formato compatible con nuestro extractor.
      </p>
      <button 
        type="button"
        onClick={handleDownloadTemplate}
        className="w-full mt-2 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
      >
        Descargar Plantilla (.csv)
      </button>
    </div>
  );
};
