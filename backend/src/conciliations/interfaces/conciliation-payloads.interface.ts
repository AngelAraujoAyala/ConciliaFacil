export interface InvoiceXML {
  uuid: string;
  rfcEmisor: string;
  rfcReceptor: string;
  fecha: string;
  monto: number;
  concepto: string;
}

export interface BankMovement {
  id: string;
  fecha: string;
  descripcion: string;
  retiro: number;
  deposito: number;
  saldo: number;
}

/** Grupo M:N persistido en el campo JSONB `matches`. */
export interface ConciliationGroup {
  id: string;
  bankMovementIds: string[];
  invoiceIds: string[];
  status: 'TOTAL_MATCH' | 'PARTIAL_MATCH' | 'MANUAL_MATCH' | 'PENDING';
  source: 'AUTO' | 'MANUAL';
  observations?: string;
  bankTotal: number;
  invoiceTotal: number;
  amountDelta: number;
  createdAt: string;
}
