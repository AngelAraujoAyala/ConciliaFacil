import React, { useState } from "react";
import { Download, Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { useExportData } from "../../hooks/useExportData";
import { useDeleteAccount } from "../../hooks/useDeleteAccount";

const DeleteConfirmModal: React.FC<{
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ onCancel, onConfirm, isDeleting }) => {
  const [typed, setTyped] = useState("");
  const CONFIRM_TEXT = "ELIMINAR";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl dark:border-red-900/40 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Eliminar cuenta</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Esta acción es <span className="font-semibold text-red-600 dark:text-red-450">permanente e irreversible</span>.
          Se eliminarán todos tus datos: conciliaciones, empresas e historial.
        </p>

        <div className="mt-4 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Escribe <span className="font-mono font-bold text-red-600 dark:text-red-400">{CONFIRM_TEXT}</span> para confirmar:
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value.toUpperCase())}
            placeholder={CONFIRM_TEXT}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-red-400 dark:focus:ring-red-900/40"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={typed !== CONFIRM_TEXT || isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Eliminar permanentemente
          </button>
        </div>
      </div>
    </div>
  );
};

export const DangerTab: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { mutate: exportData, isPending: isExporting } = useExportData();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const handleDeleteConfirm = () => {
    deleteAccount(undefined, {
      onSettled: () => setShowModal(false),
    });
  };

  return (
    <>
      {showModal && (
        <DeleteConfirmModal
          onCancel={() => setShowModal(false)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}

      <section className="space-y-6">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-red-650 dark:text-red-500">Zona de Peligro</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acciones irreversibles relacionadas con tu cuenta. Procede con cuidado.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Exportar datos de la cuenta</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Descarga un archivo JSON con tu perfil, empresas y conciliaciones.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportData()}
            disabled={isExporting}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exportar datos
          </button>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-red-950/40 dark:bg-red-950/20">
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-400">Eliminar cuenta permanentemente</p>
            <p className="text-xs text-red-650 dark:text-red-400/90">
              Esta acción eliminará todos tus datos y no puede deshacerse.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar cuenta
          </button>
        </div>
      </section>
    </>
  );
};
