import {
  ActiveTripDto,
  IGetActiveTripUseCase,
} from '@ports/inbound/get-active-trip.port.js';
import { ITripRepository } from '@ports/outbound/trip-repository.port.js';

export class GetActiveTripUseCase implements IGetActiveTripUseCase {
  constructor(private readonly tripRepository: ITripRepository) {}

  public async execute(): Promise<ActiveTripDto | null> {
    const trip = await this.tripRepository.findEarliestActiveTrip();
    if (!trip) {
      return null;
    }

    const unit = trip.getTransportUnitProps();

    return {
      tripId: trip.getTripId(),
      origin: trip.getOrigin(),
      destination: trip.getDestination(),
      departureTime: trip.getDepartureTime(),
      status: trip.getStatus(),
      basePrice: trip.getBasePrice(),
      totalCapacity: unit.totalCapacity,
      availableSeats: trip.getAvailableSeats(),
      busPlate: unit.plateNumber,
      unitName: unit.unitName,
    };
  }
}
