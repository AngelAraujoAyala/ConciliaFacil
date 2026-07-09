import { useState } from "react";
import { ShieldAlert, Tag, StickyNote, X, CheckCircle } from "lucide-react";
import type { BankMovement, ExceptionType } from "../../../types";
import { useClassifyMovement } from "../hooks/useClassifyMovement";
import { useConciliationStore } from "../../../store/useConciliationStore";

interface ExceptionPanelProps {
  pendingMovements: BankMovement[];
  exceptionMovements: BankMovement[];
  conciliationId: string | null;
}

const EXCEPTION_OPTIONS: {
  value: NonNullable<ExceptionType>;
  label: string;
  icon: string;
  color: string;
}[] = [
  { value: "TRASPASO",        label: "Traspaso entre cuentas", icon: "🔄", color: "blue" },
  { value: "RETIRO_EFECTIVO", label: "Retiro de efectivo",     icon: "🏧", color: "orange" },
  { value: "COMISION_GLOBAL", label: "Comisión bancaria",      icon: "🏦", color: "purple" },
];

const SELECTED_COLOR: Record<string, string> = {
  blue:   "border-blue-400 bg-blue-50 text-blue-700 font-bold",
  orange: "border-orange-400 bg-orange-50 text-orange-700 font-bold",
  purple: "border-purple-400 bg-purple-50 text-purple-700 font-bold",
};

const EXCEPTION_COLOR: Record<NonNullable<ExceptionType>, string> = {
  TRASPASO:        "text-blue-600 bg-blue-50 border-blue-200",
  RETIRO_EFECTIVO: "text-orange-600 bg-orange-50 border-orange-200",
  COMISION_GLOBAL: "text-purple-600 bg-purple-50 border-purple-200",
  MANUAL_MATCH:    "text-emerald-600 bg-emerald-50 border-emerald-200",
};

const EXCEPTION_LABEL: Record<NonNullable<ExceptionType>, string> = {
  TRASPASO:        "Traspaso",
  RETIRO_EFECTIVO: "Retiro",
  COMISION_GLOBAL: "Comisión",
  MANUAL_MATCH:    "Match Manual",
};

interface DrawerState {
  movementId: string;
  selectedType: NonNullable<ExceptionType> | null;
  notes: string;
}

export default function ExceptionPanel({
  pendingMovements,
  exceptionMovements,
  conciliationId,
}: ExceptionPanelProps) {
  const [drawer, setDrawer] = useState<DrawerState | null>(null);

  // Acción local en el store de Zustand (siempre disponible)
  const classifyMovement = useConciliationStore((s) => s.classifyMovement);

  // Mutación a la API (solo cuando hay una conciliación guardada)
  const { mutate: classifyRemote, isPending } = useClassifyMovement();

  const handleOpenDrawer = (movementId: string) => {
    setDrawer({ movementId, selectedType: null, notes: "" });
  };

  const handleConfirmClassify = () => {
    if (!drawer || !drawer.selectedType) return;

    // 1. Aplicar inmediatamente en el estado local (Zustand) para feedback instantáneo
    classifyMovement({
      movementId: drawer.movementId,
      isException: true,
      exceptionType: drawer.selectedType,
      notes: drawer.notes,
    });

    // 2. Si hay un ID de conciliación guardado en el backend, persistir también ahí
    if (conciliationId) {
      classifyRemote({
        conciliationId,
        movementId: drawer.movementId,
        dto: {
          isException: true,
          exceptionType: drawer.selectedType,
          notes: drawer.notes,
          matchedManualWith: [],
        },
      });
    }

    setDrawer(null);
  };

  const handleRemoveException = (movementId: string) => {
    // 1. Remover excepción en el estado local
    classifyMovement({ movementId, isException: false });

    // 2. Si hay un ID de backend, persistir la reversión
    if (conciliationId) {
      classifyRemote({
        conciliationId,
        movementId,
        dto: { isException: false, exceptionType: null, notes: "", matchedManualWith: [] },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── SECCIÓN: Pendientes Reales (Focos Rojos) ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={16} className="text-red-500" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200">Pendientes Reales</h3>
          <span className="ml-auto text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 px-2 py-0.5 rounded-full">
            {pendingMovements.length} sin resolver
          </span>
        </div>

        {pendingMovements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-slate-500 gap-2">
            <CheckCircle size={28} className="text-emerald-400" />
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
              ¡Sin pendientes reales! Todo está resuelto.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingMovements.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950/60 rounded-xl shadow-xs hover:border-red-200 dark:hover:border-red-800/60 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-100 truncate">
                    {m.description}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    {m.date} ·{" "}
                    <span
                      className={
                        m.type === "EGRESO"
                          ? "text-red-500 font-bold"
                          : "text-emerald-600 font-bold"
                      }
                    >
                      {m.type === "EGRESO" ? "−" : "+"}$
                      {m.amount?.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                </div>

                {/* El botón siempre aparece — usa el store local */}
                <button
                  onClick={() => handleOpenDrawer(m.id)}
                  className="shrink-0 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 dark:border-indigo-800/50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Tag size={11} />
                  Clasificar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECCIÓN: Excepciones ya clasificadas ── */}
      {exceptionMovements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <StickyNote size={16} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200">
              Excepciones Clasificadas
            </h3>
            <span className="ml-auto text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 px-2 py-0.5 rounded-full">
              {exceptionMovements.length} excepcionados
            </span>
          </div>

          <div className="space-y-2">
            {exceptionMovements.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-xs hover:border-gray-200 dark:hover:border-slate-700 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-gray-800 dark:text-slate-100 truncate">
                      {m.description}
                    </p>
                    {m.exceptionType && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${EXCEPTION_COLOR[m.exceptionType]}`}
                      >
                        {EXCEPTION_LABEL[m.exceptionType]}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    {m.date} · $
                    {m.amount?.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  {m.notes && (
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 italic">
                      "{m.notes}"
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveException(m.id)}
                  disabled={isPending}
                  title="Quitar excepción"
                  className="shrink-0 text-gray-300 hover:text-red-500 transition-colors mt-0.5 cursor-pointer disabled:opacity-40"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DRAWER: Modal de clasificación ── */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Tag size={15} className="text-indigo-500" />
                Clasificar como Excepción
              </h4>
              <button
                onClick={() => setDrawer(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              Selecciona el tipo para que este movimiento deje de contar como
              pendiente y limpie tu pantalla.
            </p>

            {/* Selector de tipo */}
            <div className="grid grid-cols-1 gap-2 mb-4">
              {EXCEPTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setDrawer((d) =>
                      d ? { ...d, selectedType: opt.value } : d,
                    )
                  }
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    drawer.selectedType === opt.value
                      ? SELECTED_COLOR[opt.color]
                      : "border-gray-100 hover:border-gray-200 text-gray-600 dark:border-slate-700 dark:hover:border-slate-600 dark:text-slate-300"
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Nota del contador */}
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Nota del contador (opcional)
              </label>
              <textarea
                value={drawer.notes}
                onChange={(e) =>
                  setDrawer((d) => (d ? { ...d, notes: e.target.value } : d))
                }
                placeholder="Ej. Traspaso a cuenta BBVA terminación 4821 del periodo..."
                rows={2}
                className="w-full px-3 py-2 text-xs text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDrawer(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmClassify}
                disabled={!drawer.selectedType}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:bg-gray-300 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Confirmar Excepción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
