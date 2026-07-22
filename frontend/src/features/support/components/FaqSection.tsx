import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "¿Qué es ConciliaFácil y para qué sirve?",
      answer: "ConciliaFácil es una plataforma web que te permite conciliar automáticamente el estado de cuenta de tu banco contra tus registros contables o de facturación. Sube ambos archivos y el sistema identifica qué movimientos coinciden, cuáles tienen diferencias y cuáles no tienen contraparte."
    },
    {
      question: "¿Qué formatos de archivo puedo subir para conciliar?",
      answer: "Soportamos CSV y Excel (.xlsx). Asegúrate de que tus columnas contengan al menos Fecha, Concepto y Monto. El sistema detecta automáticamente los formatos de fecha más comunes en México (DD/MM/AAAA, YYYY-MM-DD, etc.)."
    },
    {
      question: "¿Cuántas conciliaciones puedo hacer al mes?",
      answer: "Depende de tu plan: Gratuito incluye 3 conciliaciones mensuales, Básico y Pro incluyen conciliaciones ilimitadas, BASIC te permite conciliar 5 RFCs distintos, PRO son RFCs ilimitados. El contador se reinicia automáticamente el primer día de cada mes."
    },
    {
      question: "¿Qué pasa si llego al límite de RFCs de mi plan?",
      answer: "Cuando alcanzas el límite mensual, el botón de nueva conciliación se desactiva hasta que el contador se reinicie o hagas un upgrade. Puedes ver tu uso actual en el Dashboard principal."
    },
    {
      question: "¿Cómo puedo cambiar o cancelar mi suscripción?",
      answer: "Desde Configuración → Facturación puedes hacer upgrade, downgrade o cancelar en cualquier momento. Los cambios de plan entran en vigor al inicio del siguiente período, por lo que siempre aprovecharás el tiempo ya pagado."
    },
    {
      question: "¿Puedo gestionar varias empresas con una sola cuenta?",
      answer: "Sí. Puedes registrar múltiples empresas (RFC) dentro de tu cuenta. El plan Gratuito permite 1 empresa, el Básico hasta 3 y el Pro empresas ilimitadas."
    },
    {
      question: "¿Mis archivos y datos están seguros?",
      answer: "Sí. Toda la comunicación está cifrada. Los archivos que subes se procesan en memoria durante la conciliación y no se almacenan de forma directa en nuestros servidores."
    },
    {
      question: "¿Puedo consultar mis conciliaciones anteriores?",
      answer: "Sí. Desde la sección Historial puedes revisar todas tus conciliaciones pasadas, ver los resultados detallados y descargar los reportes correspondientes."
    }
  ];


  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <HelpCircle size={20} className="text-emerald-500" /> Preguntas Frecuentes
      </h2>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="border-b border-slate-100 last:border-none dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-850/50"
              >
                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm sm:text-base">{faq.question}</span>
                {isOpen ? <ChevronUp size={18} className="text-slate-400 dark:text-slate-500" /> : <ChevronDown size={18} className="text-slate-400 dark:text-slate-500" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-slate-600 bg-slate-50/30 dark:text-slate-400 dark:bg-slate-950/40">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
