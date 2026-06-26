export interface CreateConciliationDto {
  id?: string;                   // Opcional: presente solo en el flujo "Reanudar" (upsert → PATCH)
  title: string;
  status: string;
  userId: string;
  successRate: number;
  totalInvoices: number;
  totalBankMovements: number;
  matchedCount: number;
  matches: unknown[];            // Cambiamos 'any' por 'unknown' para hacer feliz a ESLint
  remainingInvoices: unknown[];
  remainingBankMovements: unknown[];
}