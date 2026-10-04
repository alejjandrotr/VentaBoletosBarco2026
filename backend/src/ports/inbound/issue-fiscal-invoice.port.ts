import {
  FiscalInvoiceRequest,
  FiscalInvoiceResponse,
} from '@ports/outbound/fiscal-invoice-provider.port.js';

export interface IssueFiscalInvoiceResult {
  invoice: FiscalInvoiceResponse;
  emailSent: boolean;
  status: 'INVOICED_AND_DELIVERED' | 'PENDING_FISCAL_RETRY';
}

export interface IIssueFiscalInvoiceUseCase {
  execute(request: FiscalInvoiceRequest): Promise<IssueFiscalInvoiceResult>;
}

export const ISSUE_FISCAL_INVOICE_USE_CASE = Symbol(
  'IIssueFiscalInvoiceUseCase',
);
