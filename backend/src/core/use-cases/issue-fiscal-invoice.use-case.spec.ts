import { describe, it, expect, beforeEach } from 'vitest';
import { IssueFiscalInvoiceUseCase } from '@core/use-cases/issue-fiscal-invoice.use-case.js';
import { SandboxFiscalInvoiceAdapter } from '@adapters/outbound/fiscal/sandbox-fiscal-invoice.adapter.js';
import { InMemoryEmailNotificationAdapter } from '@adapters/outbound/notification/in-memory-email-notification.adapter.js';
import { InvalidEmailException } from '@core/domain/exceptions/invalid-email.exception.js';

describe('SPEC-005: BDD Acceptance Scenarios (IssueFiscalInvoiceUseCase)', () => {
  let fiscalAdapter: SandboxFiscalInvoiceAdapter;
  let emailAdapter: InMemoryEmailNotificationAdapter;
  let useCase: IssueFiscalInvoiceUseCase;

  beforeEach(() => {
    fiscalAdapter = new SandboxFiscalInvoiceAdapter();
    emailAdapter = new InMemoryEmailNotificationAdapter();
    useCase = new IssueFiscalInvoiceUseCase(fiscalAdapter, emailAdapter);
  });

  describe('Escenario 1: Emisión fiscal exitosa y envío de correo', () => {
    it('Given una orden de venta de 20.00 USD con correo viajero@example.com, Then emite número de factura SENIAT y envía correo', async () => {
      const result = await useCase.execute({
        orderId: 'ORD-555',
        clientDocumentId: 'V-12345678',
        clientName: 'Cliente Viajero',
        clientEmail: 'viajero@example.com',
        items: [
          {
            description: 'Boleto Caracas - Valencia',
            quantity: 2,
            unitPrice: 10.0,
            total: 20.0,
          },
        ],
        totalAmount: 20.0,
      });

      expect(result.status).toBe('INVOICED_AND_DELIVERED');
      expect(result.invoice.fiscalInvoiceNumber).toContain('FACT-SENIAT');
      expect(result.invoice.fiscalControlNumber).toContain('CTRL-00');
      expect(result.emailSent).toBe(true);

      const emails = emailAdapter.getSentEmails();
      expect(emails).toHaveLength(1);
      expect(emails[0].recipientEmail).toBe('viajero@example.com');
    });
  });

  describe('Escenario 2: Falla temporal del servicio fiscal (Fallback)', () => {
    it('Given un fallo en el servidor fiscal, Then la orden se registra en PENDING_FISCAL_RETRY', async () => {
      const failingFiscalAdapter = {
        issueElectronicInvoice: async () => {
          throw new Error('Timeout SENIAT Sandbox');
        },
      };

      const failingUseCase = new IssueFiscalInvoiceUseCase(
        failingFiscalAdapter,
        emailAdapter,
      );

      const result = await failingUseCase.execute({
        orderId: 'ORD-999',
        clientDocumentId: 'V-11111111',
        clientName: 'Cliente Contingencia',
        clientEmail: 'contingencia@example.com',
        items: [],
        totalAmount: 15.0,
      });

      expect(result.status).toBe('PENDING_FISCAL_RETRY');
      expect(result.invoice.status).toBe('PENDING');
      expect(result.emailSent).toBe(false);
    });
  });

  describe('Escenario 3: Rechazo por correo electrónico inválido', () => {
    it('Given un comprador con correo invalido-sin-arroba, Then arroja InvalidEmailException', async () => {
      await expect(
        useCase.execute({
          orderId: 'ORD-ERR',
          clientDocumentId: 'V-22222222',
          clientName: 'Cliente Correo Malo',
          clientEmail: 'correo-invalido-sin-arroba',
          items: [],
          totalAmount: 10.0,
        }),
      ).rejects.toThrow(InvalidEmailException);
    });
  });
});
