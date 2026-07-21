import axios from 'axios';
import { apiClient } from '../../../api/apiClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export async function changePlanRequest(priceId: string | null, token: string) {
  const { data } = await api.post(
    '/billing/change-plan',
    { priceId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
}

/**
 * Consulta la prorrata estimada antes de ejecutar el upgrade.
 * El token es inyectado automáticamente por el interceptor de apiClient.
 *
 * @returns { amountDue: number, currency: string }
 */
export async function previewUpgradeRequest(priceId: string): Promise<{ amountDue: number; currency: string }> {
  const { data } = await apiClient.get<{ amountDue: number; currency: string }>(
    '/billing/upgrade-preview',
    { params: { priceId } },
  );
  return data;
}

/**
 * Cancela la suscripción al final del ciclo actual.
 * El token es inyectado automáticamente por el interceptor de apiClient.
 */
export async function cancelSubscriptionRequest(): Promise<{ action: string; message: string }> {
  const { data } = await apiClient.post<{ action: string; message: string }>(
    '/billing/cancel-subscription',
  );
  return data;
}
