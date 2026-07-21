import type { UserPlan } from "./index";

/** Estado de suscripción según Stripe (u otros proveedores). */
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | (string & {});

/** Empresa resumida incluida en GET /users/me. */
export interface EmpresaSummary {
  id: string;
  rfc: string;
  razonSocial: string;
  createdAt: string;
}

/** Perfil de negocio del usuario — alineado con el modelo Prisma / GET /users/me. */
export interface UserProfile {
  id: string;
  email: string;
  plan: UserPlan;
  isSubscribed: boolean;
  freeConciliationsLeft: number;
  monthlyConciliations: number;
  monthlyRfcs: number;
  nextResetDate: string;
  createdAt: string;
  updatedAt?: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  pendingPriceId: string | null;
  empresas: EmpresaSummary[];
  _count: {
    conciliations: number;
  };
}

/** Preferencias de aplicación — contrato para GET/PATCH /users/preferences. */
export interface UserPreferencesPayload {
  theme: "light" | "dark";
}

/** Payload para actualizar perfil en Supabase Auth. */
export interface UpdateAuthProfileInput {
  firstName: string;
  lastName: string;
  phone?: string;
}

/** Respuesta de POST /billing/create-portal-session. */
export interface BillingPortalSession {
  url: string;
}
