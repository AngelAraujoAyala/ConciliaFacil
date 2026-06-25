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

export interface ConciliationMatch {
  id: string;
  invoice: InvoiceXML;
  bankMovement: BankMovement;
  matchType: 'EXACT' | 'APPROXIMATE' | 'MANUAL';
  score: number;
}
