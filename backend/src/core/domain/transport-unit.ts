import { InvalidTripCapacityException } from '@core/domain/exceptions/invalid-trip-capacity.exception.js';

export interface TransportUnitProps {
  id: string;
  unitName: string;
  plateNumber: string;
  model: string;
  totalCapacity: number;
}

export class TransportUnit {
  private readonly id: string;
  private readonly unitName: string;
  private readonly plateNumber: string;
  private readonly model: string;
  private readonly totalCapacity: number;

  private constructor(props: TransportUnitProps) {
    if (props.totalCapacity <= 0) {
      throw new InvalidTripCapacityException(
        `La capacidad total del vehículo debe ser mayor a cero. Valor ingresado: ${props.totalCapacity}`,
      );
    }

    this.id = props.id;
    this.unitName = props.unitName ? props.unitName.trim() : 'Unidad Sin Nombre';
    this.plateNumber = props.plateNumber ? props.plateNumber.trim() : '';
    this.model = props.model ? props.model.trim() : '';
    this.totalCapacity = props.totalCapacity;
  }

  public static create(props: TransportUnitProps): TransportUnit {
    return new TransportUnit(props);
  }

  public getId(): string {
    return this.id;
  }

  public getUnitName(): string {
    return this.unitName;
  }

  public getPlateNumber(): string {
    return this.plateNumber;
  }

  public getModel(): string {
    return this.model;
  }

  public getTotalCapacity(): number {
    return this.totalCapacity;
  }

  public toProps(): TransportUnitProps {
    return {
      id: this.id,
      unitName: this.unitName,
      plateNumber: this.plateNumber,
      model: this.model,
      totalCapacity: this.totalCapacity,
    };
  }
}
