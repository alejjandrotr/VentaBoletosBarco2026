import { TripCapacity } from '@core/domain/trip-capacity.js';
import { TransportUnitProps } from '@core/domain/transport-unit.js';
import { TripNotAvailableForSaleException } from '@core/domain/exceptions/trip-not-available-for-sale.exception.js';
import { InvalidTripStatusTransitionException } from '@core/domain/exceptions/invalid-trip-status-transition.exception.js';

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  BOARDING = 'BOARDING',
  DEPARTED = 'DEPARTED',
  FINALIZED = 'FINALIZED',
  CANCELLED = 'CANCELLED',
}

export interface TripProps {
  tripId: string;
  origin: string;
  destination: string;
  departureTime: Date;
  status: TripStatus;
  basePrice: number;
  transportUnit: TransportUnitProps;
  soldSeats?: number;
  rutaId?: string;
  reglaItinerarioId?: string;
}

export class Trip {
  private readonly tripId: string;
  private readonly origin: string;
  private readonly destination: string;
  private readonly departureTime: Date;
  private status: TripStatus;
  private readonly basePrice: number;
  private readonly capacity: TripCapacity;
  private readonly rutaId?: string;
  private readonly reglaItinerarioId?: string;

  private constructor(props: TripProps) {
    this.tripId = props.tripId;
    this.origin = props.origin;
    this.destination = props.destination;
    this.departureTime = props.departureTime;
    this.status = props.status;
    this.basePrice = props.basePrice;
    this.rutaId = props.rutaId;
    this.reglaItinerarioId = props.reglaItinerarioId;
    this.capacity = TripCapacity.create({
      tripId: props.tripId,
      transportUnit: props.transportUnit,
      soldSeats: props.soldSeats || 0,
    });
  }

  public static create(props: TripProps): Trip {
    return new Trip(props);
  }

  public canAcceptSales(): boolean {
    return (
      (this.status === TripStatus.SCHEDULED ||
        this.status === TripStatus.BOARDING) &&
      !this.capacity.isFull()
    );
  }

  public validateForSale(): void {
    if (
      this.status === TripStatus.DEPARTED ||
      this.status === TripStatus.FINALIZED ||
      this.status === TripStatus.CANCELLED
    ) {
      throw new TripNotAvailableForSaleException(
        `El viaje ${this.tripId} no está disponible para venta. Estado actual: ${this.status}`,
      );
    }
  }

  public changeStatus(newStatus: TripStatus): void {
    if (this.status === newStatus) {
      return;
    }

    if (
      this.status === TripStatus.FINALIZED ||
      this.status === TripStatus.CANCELLED
    ) {
      throw new InvalidTripStatusTransitionException(
        `No se puede modificar el estado de un viaje ${this.status}.`,
      );
    }

    if (newStatus === TripStatus.BOARDING && this.status !== TripStatus.SCHEDULED) {
      throw new InvalidTripStatusTransitionException(
        `Solo se puede iniciar embarque (BOARDING) desde estado SCHEDULED. Estado actual: ${this.status}`,
      );
    }

    if (newStatus === TripStatus.DEPARTED && this.status !== TripStatus.BOARDING) {
      throw new InvalidTripStatusTransitionException(
        `Solo se puede zarpar (DEPARTED) desde estado BOARDING. Estado actual: ${this.status}`,
      );
    }

    if (newStatus === TripStatus.FINALIZED && this.status !== TripStatus.DEPARTED) {
      throw new InvalidTripStatusTransitionException(
        `Solo se puede finalizar un viaje (FINALIZED) desde estado DEPARTED. Estado actual: ${this.status}`,
      );
    }

    this.status = newStatus;
  }

  public getTripId(): string {
    return this.tripId;
  }

  public getOrigin(): string {
    return this.origin;
  }

  public getDestination(): string {
    return this.destination;
  }

  public getDepartureTime(): Date {
    return new Date(this.departureTime);
  }

  public getStatus(): TripStatus {
    return this.status;
  }

  public getBasePrice(): number {
    return this.basePrice;
  }

  public getCapacity(): TripCapacity {
    return this.capacity;
  }

  public getAvailableSeats(): number {
    return this.capacity.getAvailableSeats();
  }

  public getRutaId(): string | undefined {
    return this.rutaId;
  }

  public getReglaItinerarioId(): string | undefined {
    return this.reglaItinerarioId;
  }

  public getTransportUnitProps(): TransportUnitProps {
    return this.capacity.getSnapshot().transportUnit;
  }

  public toProps(): TripProps {
    return {
      tripId: this.tripId,
      origin: this.origin,
      destination: this.destination,
      departureTime: new Date(this.departureTime),
      status: this.status,
      basePrice: this.basePrice,
      transportUnit: this.getTransportUnitProps(),
      soldSeats: this.capacity.getSoldSeats(),
      rutaId: this.rutaId,
      reglaItinerarioId: this.reglaItinerarioId,
    };
  }
}
