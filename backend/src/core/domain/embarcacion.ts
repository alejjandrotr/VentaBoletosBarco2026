import { InvalidTripCapacityException } from './exceptions/invalid-trip-capacity.exception.js';
import { InvalidPortException } from './exceptions/invalid-port.exception.js';

export interface EmbarcacionProps {
  id: string;
  codigo: string; // Código de matrícula / placa identificadora (ej. 'ARSH-PE-001')
  nombre: string;
  capacidadFisica: number;
  activo?: boolean;
}

export class Embarcacion {
  private readonly id: string;
  private readonly codigo: string;
  private readonly nombre: string;
  private readonly capacidadFisica: number;
  private readonly activo: boolean;

  private constructor(props: EmbarcacionProps) {
    const id = props.id?.trim();
    const codigo = props.codigo?.trim();
    const nombre = props.nombre?.trim();

    if (!id || !nombre || !codigo) {
      throw new InvalidPortException(
        'El ID, código/matrícula y nombre de la embarcación son obligatorios.',
      );
    }
    if (typeof props.capacidadFisica !== 'number' || props.capacidadFisica <= 0) {
      throw new InvalidTripCapacityException(
        `La capacidad física de la embarcación debe ser mayor a cero. Valor: ${props.capacidadFisica}`,
      );
    }

    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.capacidadFisica = props.capacidadFisica;
    this.activo = props.activo !== undefined ? props.activo : true;
  }

  public static create(props: EmbarcacionProps): Embarcacion {
    return new Embarcacion(props);
  }

  public getId(): string {
    return this.id;
  }

  public getCodigo(): string {
    return this.codigo;
  }

  public getNombre(): string {
    return this.nombre;
  }

  public getCapacidadFisica(): number {
    return this.capacidadFisica;
  }

  public isActivo(): boolean {
    return this.activo;
  }

  public toProps(): EmbarcacionProps {
    return {
      id: this.id,
      codigo: this.codigo,
      nombre: this.nombre,
      capacidadFisica: this.capacidadFisica,
      activo: this.activo,
    };
  }
}
