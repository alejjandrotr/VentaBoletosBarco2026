import { InvalidPortException } from './exceptions/invalid-port.exception.js';

export interface PuertoProps {
  id: string;
  nombre: string;
  ubicacionTexto: string;
  latitud: number;
  longitud: number;
}

export class Puerto {
  private readonly id: string;
  private readonly nombre: string;
  private readonly ubicacionTexto: string;
  private readonly latitud: number;
  private readonly longitud: number;

  private constructor(props: PuertoProps) {
    const id = props.id?.trim();
    const nombre = props.nombre?.trim();
    const ubicacionTexto = props.ubicacionTexto?.trim();

    if (!id) {
      throw new InvalidPortException('El ID del puerto no puede estar vacío.');
    }
    if (!nombre) {
      throw new InvalidPortException('El nombre del puerto no puede estar vacío.');
    }
    if (props.latitud < -90 || props.latitud > 90) {
      throw new InvalidPortException(
        `La latitud debe estar en el rango [-90, 90]. Valor recibido: ${props.latitud}`,
      );
    }
    if (props.longitud < -180 || props.longitud > 180) {
      throw new InvalidPortException(
        `La longitud debe estar en el rango [-180, 180]. Valor recibido: ${props.longitud}`,
      );
    }

    this.id = id;
    this.nombre = nombre;
    this.ubicacionTexto = ubicacionTexto || '';
    this.latitud = props.latitud;
    this.longitud = props.longitud;
  }

  public static create(props: PuertoProps): Puerto {
    return new Puerto(props);
  }

  public getId(): string {
    return this.id;
  }

  public getNombre(): string {
    return this.nombre;
  }

  public getUbicacionTexto(): string {
    return this.ubicacionTexto;
  }

  public getLatitud(): number {
    return this.latitud;
  }

  public getLongitud(): number {
    return this.longitud;
  }

  public toProps(): PuertoProps {
    return {
      id: this.id,
      nombre: this.nombre,
      ubicacionTexto: this.ubicacionTexto,
      latitud: this.latitud,
      longitud: this.longitud,
    };
  }
}
