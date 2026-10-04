export interface SellTicketsCommand {
  tripId: string;
  buyerDocumentId: string;
  buyerFullName: string;
  buyerEmail: string;
  passengers: {
    documentId?: string;
    fullName: string;
    birthDate: string; // ISO format YYYY-MM-DD
    isTravelingWithRepresentative: boolean;
    representativeDocumentId?: string;
    hasTravelAuthorizationPresented?: boolean;
  }[];
}

export interface IssuedTicket {
  ticketId: string;
  seatNumber: number;
  passengerName: string;
  passengerDocumentId?: string;
  passengerCategory: string;
  finalPrice: number;
  reusableCardToken: string; // Identificador de la tarjeta reusable
}

export interface SaleOrderResult {
  orderId: string;
  tripId: string;
  buyerDocumentId: string;
  buyerEmail: string;
  issuedTickets: IssuedTicket[];
  totalAmount: number;
  status: 'CONFIRMED';
  createdAt: Date;
}

export interface ISellTicketsUseCase {
  execute(
    command: SellTicketsCommand,
    evaluationDate?: Date,
  ): Promise<SaleOrderResult>;
}

export const SELL_TICKETS_USE_CASE = Symbol('ISellTicketsUseCase');
