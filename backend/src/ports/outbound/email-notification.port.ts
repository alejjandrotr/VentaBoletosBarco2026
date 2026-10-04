import {
  FiscalInvoiceRequest,
  FiscalInvoiceResponse,
} from '@ports/outbound/fiscal-invoice-provider.port.js';

export interface EmailNotificationPort {
  sendInvoiceEmail(
    recipientEmail: string,
    recipientName: string,
    invoiceData: FiscalInvoiceResponse,
    orderDetails: FiscalInvoiceRequest,
  ): Promise<boolean>;
}

export const EMAIL_NOTIFICATION_PORT = Symbol('EmailNotificationPort');
