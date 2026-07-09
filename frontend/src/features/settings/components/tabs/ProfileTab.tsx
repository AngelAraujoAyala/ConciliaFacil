import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import { ProfileSchema, type ProfileFormData } from "../../validationSchemas";
import { useSettingsStore } from "../../../../store/useSettingsStore";
import { useAuthStore } from "../../../../store/authStore";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { FormField, Input } from "../ui/FormComponents";
import { getProfileFormValues } from "../../../../utils/profileIdentity";

export const ProfileTab: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { profileDraft, initializeProfile, setProfileDraft } = useSettingsStore();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    initializeProfile(user);
    reset(getProfileFormValues(user));
    // Solo re-sincronizar cuando cambia el usuario autenticado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onSubmit = async (data: ProfileFormData) => {
    const payload = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone?.trim() || undefined,
    };

    setProfileDraft(payload);
    await updateProfile(payload);
    reset(payload);
  };

  return (
    <section className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Perfil</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Actualiza tu información personal visible en la aplicación.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="firstName" label="Nombre" error={errors.firstName?.message}>
            <Input
              id="firstName"
              placeholder="Angel"
              hasError={!!errors.firstName}
              autoComplete="given-name"
              {...register("firstName")}
            />
          </FormField>

          <FormField id="lastName" label="Apellido" error={errors.lastName?.message}>
            <Input
              id="lastName"
              placeholder="Araujo"
              hasError={!!errors.lastName}
              autoComplete="family-name"
              {...register("lastName")}
            />
          </FormField>
        </div>

        <FormField id="phone" label="Teléfono (opcional)" error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            placeholder="+52 55 1234 5678"
            hasError={!!errors.phone}
            autoComplete="tel"
            {...register("phone")}
          />
        </FormField>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={profileDraft.email || user?.email || ""}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-400 shadow-xs dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500">
            El correo se gestiona a través de tu proveedor de autenticación.
          </p>
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
            Guardar cambios
          </button>
        </div>
      </form>
    </section>
  );
};
