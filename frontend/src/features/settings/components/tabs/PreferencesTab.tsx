import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw, Save } from "lucide-react";

import { PreferencesSchema, type PreferencesFormData } from "../../validationSchemas";
import { useGetProfile } from "../../hooks/useGetProfile";
import {
  useGetPreferences,
  useUpdatePreferences,
} from "../../hooks/useUpdatePreferences";
import { FieldError } from "../ui/FormComponents";
import { DEFAULT_USER_PREFERENCES } from "../../constants/defaultPreferences";
import { applyTheme } from "../../../../utils/theme";

const TIMEZONES = [
  "America/Mexico_City",
  "America/Monterrey",
  "America/Cancun",
  "America/Tijuana",
  "America/Chicago",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

const THEME_OPTIONS: { value: PreferencesFormData["theme"]; label: string; emoji: string }[] = [
  { value: "light", label: "Claro", emoji: "☀️" },
  { value: "dark", label: "Oscuro", emoji: "🌙" },
  { value: "system", label: "Sistema", emoji: "💻" },
];

export const PreferencesTab: React.FC = () => {
  const { data: preferences, isLoading, isError, refetch, isFetching } = useGetPreferences();
  const { data: profile } = useGetProfile();
  const { mutateAsync: updatePreferences, isPending } = useUpdatePreferences();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: {
      theme: DEFAULT_USER_PREFERENCES.theme,
      timezone: DEFAULT_USER_PREFERENCES.timezone,
      emailNotifications: DEFAULT_USER_PREFERENCES.emailNotifications,
      defaultRfc: DEFAULT_USER_PREFERENCES.defaultRfc ?? "",
    },
  });

  useEffect(() => {
    if (!preferences) return;

    reset({
      theme: preferences.theme,
      timezone: preferences.timezone,
      emailNotifications: preferences.emailNotifications,
      defaultRfc: preferences.defaultRfc ?? "",
    });
  }, [preferences, reset]);

  const onSubmit = async (data: PreferencesFormData) => {
    await updatePreferences({
      theme: data.theme,
      timezone: data.timezone,
      emailNotifications: data.emailNotifications,
      defaultRfc: data.defaultRfc?.trim() ? data.defaultRfc.trim() : null,
    });
    reset(data);
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="space-y-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        <p>No se pudieron cargar tus preferencias. Intenta recargar la página.</p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
        >
          {isFetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Reintentar
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Preferencias
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personaliza la apariencia y los ajustes de notificación de la aplicación.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tema de la interfaz
          </label>
          <Controller
            control={control}
            name="theme"
            render={({ field }) => (
              <div className="flex gap-3">
                {THEME_OPTIONS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      field.onChange(value);
                      applyTheme(value);
                    }}
                    className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-sm font-medium transition-all
                      ${
                        field.value === value
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          />
          <FieldError message={errors.theme?.message} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="timezone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Zona horaria
          </label>
          <select
            id="timezone"
            {...register("timezone")}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs outline-none transition-all dark:bg-slate-900 dark:text-slate-100
              ${
                errors.timezone
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700"
              }`}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <FieldError message={errors.timezone?.message} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="defaultRfc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            RFC por defecto
          </label>
          <select
            id="defaultRfc"
            {...register("defaultRfc")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Sin RFC por defecto</option>
            {profile?.empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.rfc}>
                {empresa.rfc} — {empresa.razonSocial}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Se usará como sugerencia al iniciar nuevas conciliaciones.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-slate-700 dark:bg-slate-900/60">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Notificaciones por correo
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recibe resúmenes y alertas de conciliación.
            </p>
          </div>
          <Controller
            control={control}
            name="emailNotifications"
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                  ${field.value ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`}
              >
                <span
                  className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform ${
                    field.value ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            )}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar preferencias
          </button>
        </div>
      </form>
    </section>
  );
};
