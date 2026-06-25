export interface CreateConciliationDto {
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