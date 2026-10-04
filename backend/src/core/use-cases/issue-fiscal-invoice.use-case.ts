import {
  IIssueFiscalInvoiceUseCase,
  IssueFiscalInvoiceResult,
} from '@ports/inbound/issue-fiscal-invoice.port.js';
import {
  FiscalInvoiceProviderPort,
  FiscalInvoiceRequest,
  FiscalInvoiceResponse,
} from '@ports/outbound/fiscal-invoice-provider.port.js';
import { EmailNotificationPort } from '@ports/outbound/email-notification.port.js';
import { InvalidEmailException } from '@core/domain/exceptions/invalid-email.exception.js';

export class IssueFiscalInvoiceUseCase implements IIssueFiscalInvoiceUseCase {
  constructor(
    private readonly fiscalProvider: FiscalInvoiceProviderPort,
    private readonly emailNotification: EmailNotificationPort,
  ) {}

  public async execute(
    request: FiscalInvoiceRequest,
  ): Promise<IssueFiscalInvoiceResult> {
    this.validateEmailFormat(request.clientEmail);

    let invoiceResponse: FiscalInvoiceResponse;
    try {
      invoiceResponse =
        await this.fiscalProvider.issueElectronicInvoice(request);
    } catch {
      return {
        invoice: {
          fiscalInvoiceNumber: 'PENDING',
          fiscalControlNumber: 'PENDING',
          fiscalDate: new Date(),
          digitalSignature: '',
          status: 'PENDING',
        },
        emailSent: false,
        status: 'PENDING_FISCAL_RETRY',
      };
    }

    let emailSent = false;
    if (invoiceResponse.status === 'AUTHORIZED') {
      try {
        emailSent = await this.emailNotification.sendInvoiceEmail(
          request.clientEmail,
          request.clientName,
          invoiceResponse,
          request,
        );
      } catch {
        emailSent = false;
      }
    }

    return {
      invoice: invoiceResponse,
      emailSent,
      status: 'INVOICED_AND_DELIVERED',
    };
  }

  private validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new InvalidEmailException(email);
    }
  }
}
