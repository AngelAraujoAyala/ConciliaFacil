import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, ShieldCheck, Lock } from "lucide-react";

import { SecuritySchema, type SecurityFormData } from "../../validationSchemas";
import { supabase } from "../../../../api/supabase";
import { FormField } from "../ui/FormComponents";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(({ hasError, ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? "text" : "password"}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-xs outline-none transition-all placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500
          ${
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/40"
              : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
          }`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        tabIndex={-1}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

/** Indicador de fortaleza de contraseña */
const StrengthBar: React.FC<{ value: string }> = ({ value }) => {
  const checks = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const colors = ["", "bg-red-500", "bg-amber-500", "bg-indigo-500", "bg-emerald-500"];
  const textColors = ["", "text-red-500", "text-amber-500", "text-indigo-600", "text-emerald-600"];

  if (!value) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= score ? colors[score] : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
};

export const SecurityTab: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  /** true = cuenta Google/OAuth (sin contraseña), false = cuenta email+password */
  const [isOAuthUser, setIsOAuthUser] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const provider = data.session?.user?.app_metadata?.provider;
      // Solo los usuarios con proveedor "email" tienen contraseña propia
      setIsOAuthUser(provider !== "email");
    });
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SecurityFormData>({
    resolver: zodResolver(SecuritySchema),
  });

  const newPassword = useWatch({ control, name: "newPassword", defaultValue: "" });

  const onSubmit = async (data: SecurityFormData) => {
    setServerError(null);
    setSuccess(false);

    // Verificamos la contraseña actual intentando un re-login con signInWithPassword
    const emailResult = await supabase.auth.getUser();
    const email = emailResult.data.user?.email;

    if (!email) {
      setServerError("No se pudo obtener tu sesión. Vuelve a iniciar sesión.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: data.currentPassword,
    });

    if (signInError) {
      setServerError("La contraseña actual es incorrecta.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (updateError) {
      setServerError(updateError.message);
      return;
    }

    setSuccess(true);
    reset();
  };

  return (
    <section className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Seguridad</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cambia tu contraseña de acceso. Usa una combinación robusta.
        </p>
      </div>

      {/* Banner informativo para cuentas Google — solo visible mientras se carga o si es OAuth */}
      {isOAuthUser === true && (
        <div
          role="status"
          className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-700/60 dark:bg-slate-800/40"
        >
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
            <Lock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Contraseña administrada por Google
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Tu cuenta fue creada con <strong className="font-semibold text-slate-700 dark:text-slate-300">Google</strong>.
              La contraseña es gestionada directamente por Google y no puede modificarse desde aquí.
              Si deseas cambiarla, visita{" "}
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                myaccount.google.com
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Formulario — solo visible para cuentas email+password */}
      {isOAuthUser === false && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            id="currentPassword"
            label="Contraseña actual"
            error={errors.currentPassword?.message}
          >
            <PasswordInput
              id="currentPassword"
              placeholder="••••••••"
              hasError={!!errors.currentPassword}
              {...register("currentPassword")}
            />
          </FormField>

          <FormField
            id="newPassword"
            label="Nueva contraseña"
            error={errors.newPassword?.message}
          >
            <>
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                hasError={!!errors.newPassword}
                {...register("newPassword")}
              />
              <StrengthBar value={newPassword} />
            </>
          </FormField>

          <FormField
            id="confirmPassword"
            label="Confirmar contraseña"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              hasError={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </FormField>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">{serverError}</p>
          )}
          {success && (
            <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Contraseña actualizada exitosamente.
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Actualizar contraseña
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

