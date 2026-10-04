import {
  FiscalInvoiceProviderPort,
  FiscalInvoiceRequest,
  FiscalInvoiceResponse,
} from '@ports/outbound/fiscal-invoice-provider.port.js';

export class SandboxFiscalInvoiceAdapter implements FiscalInvoiceProviderPort {
  private invoiceCounter = 1001;

  public async issueElectronicInvoice(
    request: FiscalInvoiceRequest,
  ): Promise<FiscalInvoiceResponse> {
    const currentNum = this.invoiceCounter++;
    const fiscalInvoiceNumber = `FACT-SENIAT-${String(currentNum).padStart(8, '0')}`;
    const fiscalControlNumber = `CTRL-00-${String(currentNum).padStart(8, '0')}`;

    return {
      fiscalInvoiceNumber,
      fiscalControlNumber,
      fiscalDate: new Date(),
      digitalSignature: `SIG-SENIAT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: 'AUTHORIZED',
    };
  }
}
