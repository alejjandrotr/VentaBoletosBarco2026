export interface FiscalInvoiceRequest {
  orderId: string;
  clientDocumentId: string;
  clientName: string;
  clientEmail: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
}

export interface FiscalInvoiceResponse {
  fiscalInvoiceNumber: string;
  fiscalControlNumber: string;
  fiscalDate: Date;
  digitalSignature: string;
  status: 'AUTHORIZED' | 'PENDING' | 'REJECTED';
}

export interface FiscalInvoiceProviderPort {
  issueElectronicInvoice(
    request: FiscalInvoiceRequest,
  ): Promise<FiscalInvoiceResponse>;
}

export const FISCAL_INVOICE_PROVIDER_PORT = Symbol(
  'FiscalInvoiceProviderPort',
);
