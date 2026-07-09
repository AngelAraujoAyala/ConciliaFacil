import React from "react";

interface FieldErrorProps {
  message?: string;
}

/** Mensaje de error rojo para mostrar bajo un input cuando la validación falla. */
export const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 dark:text-red-400" role="alert">
      <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </p>
  );
};

/** Etiqueta de campo de formulario estándar. */
export const FieldLabel: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({
  htmlFor,
  children,
}) => (
  <label htmlFor={htmlFor} className="ui-label">
    {children}
  </label>
);

/** Input estilizado alineado con el diseño de ConciliaFácil. */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(({ hasError, className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`ui-input ${hasError ? "ui-input-error" : ""} ${className}`}
    {...props}
  />
));
Input.displayName = "Input";

/** Wrapper para cada grupo label + input + error. */
export const FormField: React.FC<{
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ id, label, error, children }) => (
  <div className="space-y-1.5">
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    {children}
    <FieldError message={error} />
  </div>
);
