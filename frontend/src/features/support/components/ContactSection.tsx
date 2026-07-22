import React, { useState, useRef, useEffect } from "react";
import { Mail, MessageSquare, X, ExternalLink } from "lucide-react";
import { EmailModal } from "./EmailModal";

export const ContactSection: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'whatsapp' | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setActiveModal(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenWhatsapp = () => {
    window.open("https://wa.me/526625376924?text=Hola,%20necesito%20soporte%20con%20la%20plataforma%20de%20ConciliaF%C3%A1cil", "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Contacto Directo</h2>
        
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase dark:text-slate-500">Vías de atención</p>
          
          {/* Email */}
          <div>
            <button 
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              className="w-full flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-left group dark:border-slate-800 dark:hover:border-indigo-850/50 dark:hover:bg-indigo-950/10"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-400">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">concilia.facil.ass@gmail.com</p>
              </div>
            </button>
          </div>

          {/* WhatsApp */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setActiveModal(activeModal === "whatsapp" ? null : "whatsapp")}
              className="w-full flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-left group dark:border-slate-800 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/20"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-400">
                <MessageSquare size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Soporte por WhatsApp</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Respuesta inmediata</p>
              </div>
            </button>

            {activeModal === "whatsapp" && (
              <div 
                ref={modalRef}
                className="absolute right-0 bottom-full mb-2 lg:right-full lg:bottom-auto lg:top-0 lg:mr-2 z-50 w-72 bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-800 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-200 dark:bg-slate-950 dark:border-slate-800"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="font-semibold text-emerald-400">Atención por WhatsApp</span>
                  <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed mb-3 text-xs">
                  Chatea con nosotros para resolver tus dudas de manera ágil.
                </p>
                <button
                  type="button"
                  onClick={handleOpenWhatsapp}
                  className="w-full py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  Abrir chat <ExternalLink size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
      />
    </>
  );
};

