import React from "react";
import { FeatureBullet } from "./FeatureBullet";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos exportados — se reutilizan en PricingPage y en cualquier test
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contrato de datos de un plan de suscripcion.
 * El campo `stripePriceId` es null en el plan FREE (sin cargo).
 */
export interface SubscriptionPlan {
  /** Identificador unico interno (no de Stripe). */
  id: string;
  /** Nombre del plan que se muestra en la UI. */
  name: string;
  /** Precio en formato string para flexibilidad de moneda. Ej: "$299 MXN" */
  price: string;
  /** Periodo de facturacion. Ej: "/ mes" */
  priceSuffix: string;
  /** Tagline o descripcion corta del plan. */
  description: string;
  /** Lista de caracteristicas que se renderizan como bullets. */
  features: string[];
  /** Price ID de Stripe (price_xxx). null en planes gratuitos. */
  stripePriceId: string | null;
  /** Si es true, la tarjeta recibe estilos destacados y un badge "Recomendado". */
  isPopular: boolean;
  /** Si es true, el boton de accion queda deshabilitado (ej. plan actual). */
  isDisabled?: boolean;
  /** Texto personalizado para el boton CTA. */
  ctaLabel: string;
  /** Variante visual del botón de llamada a la acción. */
  buttonVariant?: "primary" | "secondary" | "outline";
  /** Si es el plan activo actual del usuario en sesión. */
  isCurrent?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Props del componente
// ─────────────────────────────────────────────────────────────────────────────

interface PriceCardProps {
  plan: SubscriptionPlan;
  /** true cuando el store de billing esta procesando UNA peticion activa. */
  isLoading: boolean;
  /**
   * El id del plan que el usuario activo (priceId que esta siendo procesado).
   * Permite mostrar el spinner solo en el boton correcto.
   */
  activePriceId: string | null;
  /**
   * Notifica al padre con el objeto completo del plan seleccionado,
   * evitando lookups inversos por priceId en PricingPage.
   */
  onCheckout: (plan: SubscriptionPlan) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Spinner SVG atomico (evita dependencia de libreria de iconos)
// ─────────────────────────────────────────────────────────────────────────────

const Spinner: React.FC = () => (
  <svg
    className="h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export const PriceCard: React.FC<PriceCardProps> = ({
  plan,
  isLoading,
  activePriceId,
  onCheckout,
}) => {
  const isThisCardLoading =
    isLoading && activePriceId === plan.stripePriceId;

  const isButtonDisabled = plan.isDisabled === true || isLoading;

  const handleClick = () => {
    if (!isButtonDisabled) {
      onCheckout(plan);
    }
  };

  const variant = plan.buttonVariant || (plan.isPopular ? "primary" : "outline");

  const buttonClasses = plan.isCurrent
    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
    : {
        primary:
          "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-500 disabled:bg-indigo-300 disabled:shadow-none disabled:cursor-not-allowed",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:active:bg-slate-600 focus-visible:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed",
        outline:
          "border border-indigo-600 text-indigo-600 bg-transparent hover:bg-indigo-50 active:bg-indigo-100 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950/30 dark:active:bg-indigo-950/50 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed",
      }[variant];

  return (
    <article
      className={`relative flex flex-col h-full rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 dark:bg-slate-900 ${
        plan.isCurrent
          ? "border-indigo-600 shadow-indigo-100 dark:shadow-indigo-950/30 shadow-lg ring-1 ring-indigo-600 scale-[1.02]"
          : "border-slate-200 hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
      }`}
      aria-label={`Plan ${plan.name}`}
    >
      {/* Badge de Plan Actual */}
      {plan.isCurrent && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
            Plan Actual
          </span>
        </div>
      )}
 
      {/* Badge "Recomendado" — solo visible en el plan popular si no es el actual */}
      {!plan.isCurrent && plan.isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
            <svg
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292Z" />
            </svg>
            Recomendado
          </span>
        </div>
      )}
 
      {/* Cabecera del plan */}
      <div className="mb-6">
        <h3
          className={`text-sm font-bold uppercase tracking-widest ${
            plan.isCurrent ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {plan.name}
        </h3>
        <div className="mt-3 flex items-end gap-1">
          <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {plan.price}
          </span>
          <span className="mb-1 text-sm font-medium text-slate-400 dark:text-slate-500">
            {plan.priceSuffix}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {plan.description}
        </p>
      </div>
 
      {/* Divisor */}
      <div
        className={`mb-6 h-px w-full ${
          plan.isCurrent ? "bg-indigo-100 dark:bg-indigo-900/50" : "bg-slate-100 dark:bg-slate-800"
        }`}
      />

      {/* Lista de caracteristicas */}
      <ul className="mb-8 flex flex-col gap-3.5">
        {plan.features.map((feature) => (
          <FeatureBullet key={feature} text={feature} variant="included" />
        ))}
      </ul>

      {/* CTA boton — crece para pegar al fondo de la tarjeta */}
      <div className="mt-auto">
        <button
          type="button"
          onClick={handleClick}
          disabled={isButtonDisabled}
          aria-busy={isThisCardLoading}
          aria-label={
            isThisCardLoading
              ? "Redirigiendo a Stripe..."
              : plan.ctaLabel
          }
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${buttonClasses}`}
        >
          {isThisCardLoading ? (
            <>
              <Spinner />
              <span>Redirigiendo...</span>
            </>
          ) : plan.isCurrent ? (
            <>
              <span>✓ Plan actual</span>
            </>
          ) : (
            plan.ctaLabel
          )}
        </button>
      </div>
    </article>
  );
};
