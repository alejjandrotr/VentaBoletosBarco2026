import { InvalidRouteException } from './exceptions/invalid-route.exception.js';

export interface RutaProps {
  id: string;
  origenPuertoId: string;
  destinoPuertoId: string;
  distanciaKm: number;
}

export class Ruta {
  private readonly id: string;
  private readonly origenPuertoId: string;
  private readonly destinoPuertoId: string;
  private readonly distanciaKm: number;

  private constructor(props: RutaProps) {
    const id = props.id?.trim();
    const origen = props.origenPuertoId?.trim();
    const destino = props.destinoPuertoId?.trim();

    if (!id) {
      throw new InvalidRouteException('El ID de la ruta no puede estar vacío.');
    }
    if (!origen || !destino) {
      throw new InvalidRouteException('El origen y destino de la ruta son obligatorios.');
    }
    if (origen === destino) {
      throw new InvalidRouteException(
        `El puerto de origen y destino no pueden ser el mismo (${origen}).`,
      );
    }
    if (typeof props.distanciaKm !== 'number' || props.distanciaKm <= 0) {
      throw new InvalidRouteException(
        `La distancia en km debe ser mayor a cero. Valor recibido: ${props.distanciaKm}`,
      );
    }

    this.id = id;
    this.origenPuertoId = origen;
    this.destinoPuertoId = destino;
    this.distanciaKm = props.distanciaKm;
  }

  public static create(props: RutaProps): Ruta {
    return new Ruta(props);
  }

  public getId(): string {
    return this.id;
  }

  public getOrigenPuertoId(): string {
    return this.origenPuertoId;
  }

  public getDestinoPuertoId(): string {
    return this.destinoPuertoId;
  }

  public getDistanciaKm(): number {
    return this.distanciaKm;
  }

  public toProps(): RutaProps {
    return {
      id: this.id,
      origenPuertoId: this.origenPuertoId,
      destinoPuertoId: this.destinoPuertoId,
      distanciaKm: this.distanciaKm,
    };
  }
}
