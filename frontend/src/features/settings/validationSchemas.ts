import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// ProfileSchema
// ─────────────────────────────────────────────────────────────────────────────

export const ProfileSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres."),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || value.length >= 10,
      "El teléfono debe tener al menos 10 dígitos.",
    ),
});

export type ProfileFormData = z.infer<typeof ProfileSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SecuritySchema
// ─────────────────────────────────────────────────────────────────────────────

export const SecuritySchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "La contraseña actual debe tener al menos 6 caracteres."),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula.")
      .regex(/[0-9]/, "Debe contener al menos un número.")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type SecurityFormData = z.infer<typeof SecuritySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// PreferencesSchema
// ─────────────────────────────────────────────────────────────────────────────

export const PreferencesSchema = z.object({
  theme: z.enum(["light", "dark"], {
    message: "Selecciona un tema válido.",
  }),
});

export type PreferencesFormData = z.infer<typeof PreferencesSchema>;
