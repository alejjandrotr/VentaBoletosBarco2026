import { ITripRepository } from '@ports/outbound/trip-repository.port.js';
import { Trip } from '@core/domain/trip.js';

export class InMemoryTripRepository implements ITripRepository {
  private readonly trips: Map<string, Trip> = new Map();

  constructor(initialTrips: Trip[] = []) {
    for (const trip of initialTrips) {
      this.trips.set(trip.getTripId(), trip);
    }
  }

  public async findEarliestActiveTrip(): Promise<Trip | null> {
    const activeTrips = Array.from(this.trips.values()).filter((trip) =>
      trip.canAcceptSales(),
    );

    if (activeTrips.length === 0) {
      return null;
    }

    // Sort by departureTime ascending (earliest first)
    activeTrips.sort(
      (a, b) =>
        a.getDepartureTime().getTime() - b.getDepartureTime().getTime(),
    );

    return activeTrips[0];
  }

  public async findById(tripId: string): Promise<Trip | null> {
    const trip = this.trips.get(tripId);
    return trip || null;
  }

  public async findByDate(fechaISO: string): Promise<Trip[]> {
    const matching = Array.from(this.trips.values()).filter((trip) => {
      const dt = trip.getDepartureTime();
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      return formatted === fechaISO;
    });

    return matching.sort(
      (a, b) => a.getDepartureTime().getTime() - b.getDepartureTime().getTime(),
    );
  }

  public async save(trip: Trip): Promise<void> {
    this.trips.set(trip.getTripId(), trip);
  }

  public async saveMany(trips: Trip[]): Promise<void> {
    for (const trip of trips) {
      this.trips.set(trip.getTripId(), trip);
    }
  }
}
