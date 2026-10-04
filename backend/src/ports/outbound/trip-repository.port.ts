import { Trip } from '@core/domain/trip.js';

export interface ITripRepository {
  findEarliestActiveTrip(): Promise<Trip | null>;
  findById(tripId: string): Promise<Trip | null>;
  findByDate(fechaISO: string): Promise<Trip[]>;
  save(trip: Trip): Promise<void>;
  saveMany(trips: Trip[]): Promise<void>;
}

export const TRIP_REPOSITORY_PORT = Symbol('ITripRepository');
