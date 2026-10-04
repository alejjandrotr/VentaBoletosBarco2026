import {
  ISellTicketsUseCase,
  IssuedTicket,
  SaleOrderResult,
  SellTicketsCommand,
} from '@ports/inbound/sell-tickets.port.js';
import { ITripRepository } from '@ports/outbound/trip-repository.port.js';
import { TripNotAvailableForSaleException } from '@core/domain/exceptions/trip-not-available-for-sale.exception.js';
import { MinorPassengerValidator } from '@core/domain/minor-passenger-validator.js';
import { FareCalculator } from '@core/domain/fare-calculator.js';

export class SellTicketsUseCase implements ISellTicketsUseCase {
  private readonly minorValidator: MinorPassengerValidator;
  private readonly fareCalculator: FareCalculator;

  constructor(private readonly tripRepository: ITripRepository) {
    this.minorValidator = new MinorPassengerValidator();
    this.fareCalculator = new FareCalculator();
  }

  public async execute(
    command: SellTicketsCommand,
    evaluationDate: Date = new Date(),
  ): Promise<SaleOrderResult> {
    const trip = await this.tripRepository.findById(command.tripId);
    if (!trip) {
      throw new TripNotAvailableForSaleException(
        `El viaje con ID '${command.tripId}' no existe o no se encuentra activo.`,
      );
    }

    trip.validateForSale();

    if (!command.passengers || command.passengers.length === 0) {
      throw new Error('Debe incluir al menos un pasajero en la orden de venta.');
    }

    // 1. Validar reglas de resguardo legal para menores (SPEC-002)
    for (const p of command.passengers) {
      this.minorValidator.validate(
        {
          birthDate: p.birthDate,
          passengerDocumentId: p.documentId,
          isTravelingWithRepresentative: p.isTravelingWithRepresentative,
          representativeDocumentId: p.representativeDocumentId,
          hasTravelAuthorizationPresented: p.hasTravelAuthorizationPresented,
        },
        evaluationDate,
      );
    }

    // 2. Obtener número de asiento inicial antes de reservar (SPEC-003)
    const initialSnapshot = trip.getCapacity().getSnapshot();
    const startSeatNumber = initialSnapshot.soldSeats + 1;

    // 3. Reservar aforo (SPEC-003)
    trip.getCapacity().reserveSeats(command.passengers.length);

    // 4. Calcular tarifas y descuentos por categoría (SPEC-001)
    const fareResult = this.fareCalculator.calculate({
      basePrice: trip.getBasePrice(),
      evaluationDate,
      passengers: command.passengers.map((p) => ({
        documentId: p.documentId || '',
        fullName: p.fullName,
        birthDate: p.birthDate,
      })),
    });

    // 5. Emitir pasajes con tokens de tarjeta reusable (sin impresión en papel)
    const issuedTickets: IssuedTicket[] = fareResult.items.map(
      (fareItem, index) => {
        const seatNumber = startSeatNumber + index;
        const ticketId = `TICKET-${trip.getTripId()}-${seatNumber}-${Date.now()}`;
        const reusableCardToken = `CARD-${String(seatNumber).padStart(2, '0')}`;

        return {
          ticketId,
          seatNumber,
          passengerName: fareItem.passenger.fullName,
          passengerDocumentId: fareItem.passenger.documentId || undefined,
          passengerCategory: fareItem.category,
          finalPrice: fareItem.finalPrice,
          reusableCardToken,
        };
      },
    );

    // 6. Guardar viaje actualizado con el aforo descontado
    await this.tripRepository.save(trip);

    const orderId = `ORD-${Date.now()}`;

    return {
      orderId,
      tripId: trip.getTripId(),
      buyerDocumentId: command.buyerDocumentId,
      buyerEmail: command.buyerEmail,
      issuedTickets,
      totalAmount: fareResult.totalToPay,
      status: 'CONFIRMED',
      createdAt: new Date(),
    };
  }
}
