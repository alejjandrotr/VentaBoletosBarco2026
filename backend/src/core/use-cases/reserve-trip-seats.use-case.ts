import {
  IReserveTripSeatsUseCase,
  ReserveSeatsInput,
} from '@ports/inbound/reserve-trip-seats.port.js';
import {
  TripCapacity,
  TripCapacitySnapshot,
} from '@core/domain/trip-capacity.js';

export class ReserveTripSeatsUseCase implements IReserveTripSeatsUseCase {
  public execute(input: ReserveSeatsInput): TripCapacitySnapshot {
    const trip = TripCapacity.create(input.tripCapacityProps);
    return trip.reserveSeats(input.seatsToReserve);
  }
}
