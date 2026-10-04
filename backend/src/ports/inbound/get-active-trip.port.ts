import { TripStatus } from '@core/domain/trip.js';

export interface ActiveTripDto {
  tripId: string;
  origin: string;
  destination: string;
  departureTime: Date;
  status: TripStatus;
  basePrice: number;
  totalCapacity: number;
  availableSeats: number;
  busPlate: string;
  unitName: string;
}

export interface IGetActiveTripUseCase {
  execute(): Promise<ActiveTripDto | null>;
}

export const GET_ACTIVE_TRIP_USE_CASE = Symbol('IGetActiveTripUseCase');
