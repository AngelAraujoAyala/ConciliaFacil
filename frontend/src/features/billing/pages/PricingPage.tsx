import React, { useEffect, useRef, useState, useMemo } from "react";
import { useBillingStore } from "../../../store/useBillingStore";
import { PriceCard } from "../components/PriceCard";
import type { SubscriptionPlan } from "../components/PriceCard";
import { useGetProfile } from "../../dashboard/hooks/useGetProfile";

// ─────────────────────────────────────────────────────────────────────────────
// Datos de planes
//
// INSTRUCCION: Reemplaza el valor de `stripePriceId` en el plan BASIC con
// tu price_xxx real de Stripe (Dashboard > Products > tu precio mensual).
// ─────────────────────────────────────────────────────────────────────────────

const PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceSuffix: "/ mes",
    description: "Plan básico para uso personal o pruebas de bajo volumen.",
    features: [
      "Hasta 3 conciliaciones por mes",
      "Hasta 1 RFC de cliente distinto",
      "Soporte por correo (48 h)",
    ],
    stripePriceId: null,
    isPopular: false,
    isDisabled: true,
    ctaLabel: "Plan actual",
  },
  {
    id: "basic",
    name: "Basic",
    price: "$349 MXN",
    priceSuffix: "/ mes",
    description: "Ideal para contadores independientes y despachos medianos.",
    features: [
      "Conciliaciones ILIMITADAS",
      "Hasta 5 RFCs de clientes distintos",
      "Soporte prioritario por WhatsApp",
    ],
    stripePriceId: "price_1TpCWFRk8JjGytDbEsAY9wVo",
    isPopular: false,
    ctaLabel: "Suscribirse ahora",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$899 MXN",
    priceSuffix: "/ mes",
    description: "Capacidad total para despachos contables de alta carga transaccional.",
    features: [
      "Conciliaciones ILIMITADAS",
      "RFCs ILIMITADOS de clientes distintos",
      "Soporte prioritario por WhatsApp",
    ],
    stripePriceId: "price_1TqgASRk8JjGytDb5oegIhB0",
    isPopular: true,
    ctaLabel: "Obtener Plan Pro",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Componente de alerta de error
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => (
  <div
    role="alert"
    aria-live="assertive"
    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm"
  >
    {/* Icono de advertencia */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>

    <div className="flex-1">
      <p className="font-semibold">Error al iniciar el pago</p>
      <p className="mt-0.5 font-normal text-red-700">{message}</p>
    </div>

    {/* Boton de cierre */}
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Cerrar alerta de error"
      className="shrink-0 rounded-md p-1 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
      </svg>
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Pagina principal
// ─────────────────────────────────────────────────────────────────────────────

export const PricingPage: React.FC = () => {
  const { isLoading, error, checkoutPlan, clearError } = useBillingStore();
  const { data: profile } = useGetProfile();

  /**
   * `activePriceId` rastrea cual boton especifico disparo la carga.
   * Permite que solo el boton del plan seleccionado muestre el spinner,
   * no todos los botones de la pagina.
   */
  const [activePriceId, setActivePriceId] = useState<string | null>(null);

  // Cálculo dinámico y escalable de los estados de cada plan basado en el plan actual del usuario
  const dynamicPlans = useMemo<SubscriptionPlan[]>(() => {
    const currentPlan = profile?.plan || "FREE"; // "FREE" | "BASIC" | "PRO"

    return PLANS.map((plan) => {
      const planIdUpper = plan.id.toUpperCase();
      const isCurrent = planIdUpper === currentPlan;

      // 1. Si es el plan actual del usuario
      if (isCurrent) {
        return {
          ...plan,
          isDisabled: true,
          isCurrent: true,
          ctaLabel: "✓ Plan actual",
          buttonVariant: plan.id === "pro" ? "primary" : "secondary",
          isPopular: plan.id === "pro",
        };
      }

      // 2. Si el usuario ya tiene PRO (los demás planes son downgrades)
      if (currentPlan === "PRO") {
        if (plan.id === "free") {
          return {
            ...plan,
            isDisabled: true,
            isCurrent: false,
            ctaLabel: "Plan base",
            buttonVariant: "secondary",
            isPopular: false,
          };
        }
        return {
          ...plan,
          isDisabled: false,
          isCurrent: false,
          ctaLabel: "Cambiar a este plan",
          buttonVariant: "outline",
          isPopular: false,
        };
      }

      // 3. Si el usuario tiene BASIC
      if (currentPlan === "BASIC") {
        if (plan.id === "free") {
          return {
            ...plan,
            isDisabled: true,
            isCurrent: false,
            ctaLabel: "Plan base",
            buttonVariant: "secondary",
            isPopular: false,
          };
        }
        // Este caso debe ser el plan PRO (upgrade)
        return {
          ...plan,
          isDisabled: false,
          isCurrent: false,
          ctaLabel: "Contratar Plan Pro",
          buttonVariant: "primary",
          isPopular: true,
        };
      }

      // 4. Si el usuario tiene FREE (puede adquirir BASIC o PRO)
      return {
        ...plan,
        isDisabled: false,
        isCurrent: false,
        ctaLabel: plan.id === "basic" ? "Contratar Plan Basic" : "Contratar Plan Pro",
        buttonVariant: plan.id === "pro" ? "primary" : "outline",
        isPopular: plan.id === "pro",
      };
    });
  }, [profile?.plan]);

  // Ref para hacer scroll automatico al error cuando aparece
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  // Limpia el priceId activo cuando la carga termina (con exito o con error)
  useEffect(() => {
    if (!isLoading) {
      setActivePriceId(null);
    }
  }, [isLoading]);

  // Limpia el error del store al desmontar la pagina
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleCheckout = (priceId: string | null) => {
    if (!priceId) {
      alert(
        "Para gestionar la cancelación de tu suscripción y volver al Plan Gratis, por favor contáctanos en soporte@conciliafacil.com y te ayudaremos de inmediato."
      );
      return;
    }
    setActivePriceId(priceId);
    void checkoutPlan(priceId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* ── Encabezado de la seccion ───────────────────────────────────── */}
        <header className="mb-14 text-center">
          <span className="inline-block rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Planes y Precios
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            Elige el plan{" "}
            <span className="text-indigo-600 dark:text-indigo-450">perfecto para ti</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400">
            Sin costos ocultos. Cancela cuando quieras. Procesamiento local
            garantizado en todos los planes.
          </p>

          {/* Indicador de garantia */}
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-emerald-500 dark:text-emerald-455"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                clipRule="evenodd"
              />
            </svg>
            <span>Pago seguro procesado por Stripe. RFC y datos protegidos.</span>
          </div>
        </header>

        {/* ── Alerta de error — visible solo si el store tiene un error ─── */}
        {error && (
          <div ref={errorRef} className="mb-10">
            <ErrorAlert message={error} onDismiss={clearError} />
          </div>
        )}

        {/* ── Grid de tarjetas de planes ────────────────────────────────── */}
        <section
          aria-label="Planes de suscripcion disponibles"
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {dynamicPlans.map((plan) => (
            <PriceCard
              key={plan.id}
              plan={plan}
              isLoading={isLoading}
              activePriceId={activePriceId}
              onCheckout={handleCheckout}
            />
          ))}
        </section>


        {/* ── Características comunes a todos los planes ───────────────── */}
        <div className="mt-12 text-center bg-slate-100/50 border border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-800 rounded-2xl p-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Todos los planes incluyen:
          </p>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Cruce automático de movimientos vs XMLs, carga masiva, clasificación de excepciones, exportación a Excel e historial de sesiones.
          </p>
        </div>

        {/* ── Nota de pie — refuerza la confianza del usuario ───────────── */}
        <footer className="mt-14 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>
            Al suscribirte aceptas nuestros{" "}
            <a
              href="/terminos"
              className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
            >
              Terminos de Servicio
            </a>{" "}
            y{" "}
            <a
              href="/privacidad"
              className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
            >
              Politica de Privacidad
            </a>
            . Puedes cancelar tu suscripcion en cualquier momento desde tu
            perfil. Los cargos son en MXN e incluyen IVA.
          </p>
        </footer>
      </div>
    </div>
  );
};
