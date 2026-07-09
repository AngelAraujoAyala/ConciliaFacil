import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface FeatureBulletProps {
  /** Texto de la caracteristica a mostrar. */
  text: string;
  /** Variante visual: 'included' (check verde) o 'excluded' (cruz gris). */
  variant?: "included" | "excluded";
}

// ─────────────────────────────────────────────────────────────────────────────
// Iconos SVG atomicos — evita dependencias de iconografia externas
// ─────────────────────────────────────────────────────────────────────────────

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
      clipRule="evenodd"
    />
  </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export const FeatureBullet: React.FC<FeatureBulletProps> = ({
  text,
  variant = "included",
}) => {
  const isIncluded = variant === "included";

  return (
    <li className="flex items-start gap-3">
      {/* Icono con circulo de fondo */}
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          isIncluded
            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
        }`}
        aria-label={isIncluded ? "Incluido" : "No incluido"}
      >
        {isIncluded ? (
          <CheckIcon className="h-3 w-3" />
        ) : (
          <XMarkIcon className="h-3 w-3" />
        )}
      </span>

      {/* Texto de la caracteristica */}
      <span
        className={`text-sm leading-relaxed ${
          isIncluded ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500 line-through"
        }`}
      >
        {text}
      </span>
    </li>
  );
};
