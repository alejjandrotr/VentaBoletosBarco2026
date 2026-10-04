import { EmailNotificationPort } from '@ports/outbound/email-notification.port.js';
import {
  FiscalInvoiceRequest,
  FiscalInvoiceResponse,
} from '@ports/outbound/fiscal-invoice-provider.port.js';

export interface SentEmailLog {
  recipientEmail: string;
  recipientName: string;
  invoiceNumber: string;
  totalAmount: number;
  sentAt: Date;
}

export class InMemoryEmailNotificationAdapter
  implements EmailNotificationPort
{
  private readonly sentEmails: SentEmailLog[] = [];

  public async sendInvoiceEmail(
    recipientEmail: string,
    recipientName: string,
    invoiceData: FiscalInvoiceResponse,
    orderDetails: FiscalInvoiceRequest,
  ): Promise<boolean> {
    this.sentEmails.push({
      recipientEmail,
      recipientName,
      invoiceNumber: invoiceData.fiscalInvoiceNumber,
      totalAmount: orderDetails.totalAmount,
      sentAt: new Date(),
    });

    return true;
  }

  public getSentEmails(): SentEmailLog[] {
    return [...this.sentEmails];
  }
}
