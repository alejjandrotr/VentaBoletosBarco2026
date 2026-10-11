import { TransportUnit, TransportUnitProps } from '@core/domain/transport-unit.js';
import { CapacityExceededException } from '@core/domain/exceptions/capacity-exceeded.exception.js';
import { InvalidTripCapacityException } from '@core/domain/exceptions/invalid-trip-capacity.exception.js';

export interface TripCapacityProps {
  tripId: string;
  transportUnit: TransportUnitProps | TransportUnit;
  soldSeats?: number;
}

export interface TripCapacitySnapshot {
  tripId: string;
  transportUnit: TransportUnitProps;
  totalCapacity: number;
  soldSeats: number;
  availableSeats: number;
  isFull: boolean;
}

export class TripCapacity {
  private readonly tripId: string;
  private readonly transportUnit: TransportUnit;
  private soldSeats: number;

  private constructor(props: TripCapacityProps) {
    this.tripId = props.tripId;
    this.transportUnit =
      props.transportUnit instanceof TransportUnit
        ? props.transportUnit
        : TransportUnit.create(props.transportUnit);

    const initialSold = props.soldSeats ?? 0;
    if (initialSold < 0) {
      throw new InvalidTripCapacityException(
        'Los asientos vendidos no pueden ser negativos.',
      );
    }

    if (initialSold > this.transportUnit.getTotalCapacity()) {
      throw new InvalidTripCapacityException(
        `Los asientos vendidos (${initialSold}) superan la capacidad total del vehículo (${this.transportUnit.getTotalCapacity()}).`,
      );
    }

    this.soldSeats = initialSold;
  }

  public static create(props: TripCapacityProps): TripCapacity {
    return new TripCapacity(props);
  }

  public reserveSeats(seatsToReserve: number): TripCapacitySnapshot {
    if (seatsToReserve <= 0) {
      throw new InvalidTripCapacityException(
        'La cantidad de asientos a reservar debe ser mayor a cero.',
      );
    }

    const availableSeats = this.getAvailableSeats();
    if (seatsToReserve > availableSeats) {
      throw new CapacityExceededException(seatsToReserve, availableSeats);
    }

    this.soldSeats += seatsToReserve;
    return this.getSnapshot();
  }

  public getAvailableSeats(): number {
    return this.transportUnit.getTotalCapacity() - this.soldSeats;
  }

  public isFull(): boolean {
    return this.getAvailableSeats() === 0;
  }

  public getSnapshot(): TripCapacitySnapshot {
    const availableSeats = this.getAvailableSeats();
    return {
      tripId: this.tripId,
      transportUnit: this.transportUnit.toProps(),
      totalCapacity: this.transportUnit.getTotalCapacity(),
      soldSeats: this.soldSeats,
      availableSeats,
      isFull: availableSeats === 0,
    };
  }

  public getSoldSeats(): number {
    return this.soldSeats;
  }

  public getTotalCapacity(): number {
    return this.transportUnit.getTotalCapacity();
  }
}
