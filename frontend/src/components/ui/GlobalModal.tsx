import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";
import { useModalStore } from "../../store/modalStore";

const TYPE_CONFIG = {
  success: {
    icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
    iconBg: "bg-emerald-50 border-emerald-100",
    confirmBtn: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
  },
  danger: {
    icon: <AlertTriangle className="h-6 w-6 text-rose-600" />,
    iconBg: "bg-rose-50 border-rose-100",
    confirmBtn: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
  },
  warning: {
    icon: <AlertCircle className="h-6 w-6 text-amber-600" />,
    iconBg: "bg-amber-50 border-amber-100",
    confirmBtn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
  },
  info: {
    icon: <Info className="h-6 w-6 text-blue-600" />,
    iconBg: "bg-blue-50 border-blue-100",
    confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  },
};

export const GlobalModal: React.FC = () => {
  const { isOpen, title, message, type, isConfirm, onConfirm, onCancel, closeModal } =
    useModalStore();

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const config = TYPE_CONFIG[type];

  const handleConfirm = async () => {
    if (onConfirm) {
      try {
        setIsLoading(true);
        await onConfirm();
      } catch (error) {
        console.error("Error executing modal action:", error);
      } finally {
        setIsLoading(false);
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      try {
        onCancel();
      } catch (error) {
        console.error("Error executing modal cancel action:", error);
      }
    }
    closeModal();
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={isConfirm ? () => {} : handleCancel}>
        {/* Backdrop blur overlay */}
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 border border-slate-100">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${config.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                    {config.icon}
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" className="text-base font-bold leading-6 text-slate-900">
                      {title}
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`inline-flex w-full justify-center items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs focus:outline-hidden focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer sm:w-auto ${config.confirmBtn}`}
                  >
                    {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                    {isConfirm ? "Confirmar" : "Entendido"}
                  </button>

                  {isConfirm && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer sm:mt-0 sm:w-auto"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
