import {
  TripCapacityProps,
  TripCapacitySnapshot,
} from '@core/domain/trip-capacity.js';

export interface ReserveSeatsInput {
  tripCapacityProps: TripCapacityProps;
  seatsToReserve: number;
}

export interface IReserveTripSeatsUseCase {
  execute(input: ReserveSeatsInput): TripCapacitySnapshot;
}

export const RESERVE_TRIP_SEATS_USE_CASE = Symbol('IReserveTripSeatsUseCase');
