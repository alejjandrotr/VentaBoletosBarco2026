import React from 'react';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

export interface IssuedTicketData {
  ticketId: string;
  seatNumber: number;
  passengerName: string;
  passengerCategory: string;
  finalPrice: number;
  reusableCardToken: string;
}

export interface SaleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  buyerEmail: string;
  totalAmount: number;
  tickets: IssuedTicketData[];
  fiscalInvoiceNumber?: string;
  fiscalControlNumber?: string;
}

export const SaleSuccessModal: React.FC<SaleSuccessModalProps> = ({
  isOpen,
  onClose,
  orderId,
  buyerEmail,
  totalAmount,
  tickets,
  fiscalInvoiceNumber = 'FACT-SENIAT-00001001',
  fiscalControlNumber = 'CTRL-00-00001001',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#ACBCBF] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-[#243C4C] relative">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#5289AD]/15 border border-[#5289AD]/40 text-[#5289AD] text-3xl mx-auto shadow-inner">
            ✓
          </div>
          <h2 className="text-2xl font-black text-[#243C4C] tracking-tight">¡Venta Confirmada con Éxito!</h2>
          <p className="text-xs text-[#698696]">
            Orden de Compra: <strong className="text-[#243C4C] font-mono">{orderId}</strong>
          </p>
        </div>

        <div className="bg-[#F4FCFB] p-4 rounded-2xl border border-[#ACBCBF] space-y-2 text-xs">
          <div className="flex justify-between items-center text-[#243C4C]">
            <span>Comprobante Fiscal SENIAT:</span>
            <span className="font-mono text-[#5289AD] font-bold">{fiscalInvoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center text-[#243C4C]">
            <span>Número de Control Fiscal:</span>
            <span className="font-mono text-[#698696] font-semibold">{fiscalControlNumber}</span>
          </div>
          <div className="flex justify-between items-center text-[#243C4C] pt-1 border-t border-[#ACBCBF]/60">
            <span>Factura Digital Despachada a:</span>
            <strong className="text-[#243C4C]">{buyerEmail}</strong>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#243C4C]">
            Asignación de Asientos &amp; Tarjetas Reusables ({tickets.length})
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticketId}
                className="bg-[#F4FCFB] border border-[#ACBCBF]/70 p-3 rounded-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-[#243C4C]">{ticket.passengerName}</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-xs text-[#698696] font-medium">Asiento #{ticket.seatNumber}</span>
                    <Badge variant="neutral" size="sm">
                      {ticket.passengerCategory}
                    </Badge>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-[#243C4C] text-[#F4FCFB] text-xs font-mono font-bold px-2 py-1 rounded">
                    💳 {ticket.reusableCardToken}
                  </span>
                  <p className="text-xs font-mono text-[#5289AD] font-bold mt-0.5">
                    ${ticket.finalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-[#ACBCBF]/60">
          <div>
            <span className="text-xs text-[#698696]">Monto Total Cobrado:</span>
            <p className="text-xl font-black text-[#5289AD] font-mono">${totalAmount.toFixed(2)} USD</p>
          </div>

          <Button variant="primary" size="md" onClick={onClose} className="font-bold">
            Aceptar &amp; Nueva Venta
          </Button>
        </div>
      </div>
    </div>
  );
};
