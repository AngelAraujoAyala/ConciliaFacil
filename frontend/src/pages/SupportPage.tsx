import { useState, useRef, useEffect } from 'react';
import { HelpCircle, Mail, MessageSquare, ChevronDown, ChevronUp, FileSpreadsheet, X } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Estado para controlar qué modal de contacto está abierto ('mail', 'whatsapp' o null)
  const [activeModal, setActiveModal] = useState<'mail' | 'whatsapp' | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar el modal si el usuario da clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setActiveModal(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const faqs: FAQItem[] = [
    {
      question: "¿Qué formatos de estados de cuenta soporta ConciliaFácil?",
      answer: "Actualmente soportamos archivos en formato CSV y Excel (.xlsx). Asegúrate de que las columnas de Fecha, Concepto y Monto estén claramente definidas."
    },
    {
      question: "Mi banco exporta las fechas en formato DD/MM/AAAA, ¿el sistema lo reconoce?",
      answer: "Sí, nuestro motor de conciliación inteligente detecta automáticamente los formatos de fecha más comunes en México."
    },
    {
      question: "¿Cómo se manejan las diferencias de centavos?",
      answer: "En la configuración de tu perfil puedes definir un umbral de tolerancia para que el sistema apruebe automáticamente variaciones menores por redondeo bancario."
    }
  ];

  // Función para manejar el clic y prevenir el comportamiento por defecto de los enlaces <a>
  const handleContactClick = (e: React.MouseEvent, type: 'mail' | 'whatsapp') => {
    e.preventDefault();
    setActiveModal(activeModal === type ? null : type);
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Centro de Soporte</h1>
        <p className="text-slate-500 dark:text-slate-400">¿Tienes dudas o encontraste un problema? Estamos aquí para ayudarte a resolverlo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: FAQ */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <HelpCircle size={20} className="text-emerald-500" /> Preguntas Frecuentes
          </h2>
          
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="border-b border-slate-100 last:border-none dark:border-slate-800">
                  <button
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

        {/* Columna Derecha: Canales de contacto */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Contacto Directo</h2>
          
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase dark:text-slate-500">Vías de atención</p>
            
            {/* Contenedor relativo para posicionar el modal pegado a este botón */}
            <div className="relative">
              <button 
                onClick={(e) => handleContactClick(e, 'mail')}
                className="w-full flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-left group dark:border-slate-800 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/20"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">soporte@conciliafacil.com</p>
                </div>
              </button>

              {/* Popover / Modal pegadito a Email */}
              {activeModal === 'mail' && (
                <div 
                  ref={modalRef}
                  className="absolute right-0 bottom-full mb-2 lg:right-full lg:bottom-auto lg:top-0 lg:mr-2 z-50 w-72 bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-800 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-200 dark:bg-slate-950 dark:border-slate-800"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-semibold text-emerald-400">Atención por Correo</span>
                    <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Manda mensaje a este correo y en un instante nos pondremos en contacto.
                  </p>
                </div>
              )}
            </div>

            {/* Contenedor relativo para posicionar el modal pegado a WhatsApp */}
            <div className="relative">
              <button 
                onClick={(e) => handleContactClick(e, 'whatsapp')}
                className="w-full flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-left group dark:border-slate-800 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/20"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-400">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Soporte por WhatsApp</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Respuesta inmediata</p>
                </div>
              </button>

              {/* Popover / Modal pegadito a WhatsApp */}
              {activeModal === 'whatsapp' && (
                <div 
                  ref={modalRef}
                  className="absolute right-0 bottom-full mb-2 lg:right-full lg:bottom-auto lg:top-0 lg:mr-2 z-50 w-72 bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-800 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-200 dark:bg-slate-950 dark:border-slate-800"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-semibold text-emerald-400">Atención por WhatsApp</span>
                    <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Manda mensaje a este correo y en un instante nos pondremos en contacto.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recursos adicionales */}
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm space-y-3 dark:bg-slate-950 dark:border dark:border-slate-800">
            <FileSpreadsheet size={24} className="text-emerald-400" />
            <h3 className="font-semibold text-sm">¿Problemas con tus archivos?</h3>
            <p className="text-xs text-slate-400 leading-relaxed dark:text-slate-500">
              Descarga nuestra plantilla oficial en Excel estructurada correctamente para evitar errores.
            </p>
            <button className="w-full mt-2 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
              Descargar Plantilla Base
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}