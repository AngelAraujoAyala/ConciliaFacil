import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";
import { useModalStore } from "../../store/modalStore";

const TYPE_CONFIG = {
  success: {
    icon: <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    iconBg: "ui-modal-icon-success",
    confirmBtn: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
  },
  danger: {
    icon: <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
    iconBg: "ui-modal-icon-danger",
    confirmBtn: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
  },
  warning: {
    icon: <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
    iconBg: "ui-modal-icon-warning",
    confirmBtn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
  },
  info: {
    icon: <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
    iconBg: "ui-modal-icon-info",
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
              <DialogPanel className="ui-modal-panel">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center sm:mx-0 sm:h-10 sm:w-10 ${config.iconBg}`}>
                    {config.icon}
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" className="text-base font-bold leading-6 text-slate-900 dark:text-slate-100">
                      {title}
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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
                      className="ui-modal-cancel"
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
