import { InvalidItineraryRuleException } from './exceptions/invalid-itinerary-rule.exception.js';

export enum TipoAplicacionItinerario {
  DIAS_SEMANA = 'DIAS_SEMANA',
  FECHA_ESPECIFICA = 'FECHA_ESPECIFICA',
}

export interface ReglaItinerarioProps {
  id: string;
  nombre: string;
  tipoAplicacion: TipoAplicacionItinerario;
  diasSemana?: number[]; // [0..6] (0 = Domingo)
  fechaEspecifica?: string; // 'YYYY-MM-DD'
  rutaId: string;
  horaPartida: string; // 'HH:mm'
  embarcacionDefaultId: string;
  activo?: boolean;
}

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class ReglaItinerario {
  private readonly id: string;
  private readonly nombre: string;
  private readonly tipoAplicacion: TipoAplicacionItinerario;
  private readonly diasSemana: number[];
  private readonly fechaEspecifica?: string;
  private readonly rutaId: string;
  private readonly horaPartida: string;
  private readonly embarcacionDefaultId: string;
  private readonly activo: boolean;

  private constructor(props: ReglaItinerarioProps) {
    const id = props.id?.trim();
    const nombre = props.nombre?.trim();
    const rutaId = props.rutaId?.trim();
    const embarcacionDefaultId = props.embarcacionDefaultId?.trim();
    const horaPartida = props.horaPartida?.trim();

    if (!id || !nombre || !rutaId || !embarcacionDefaultId) {
      throw new InvalidItineraryRuleException(
        'Los campos id, nombre, rutaId y embarcacionDefaultId son obligatorios.',
      );
    }

    if (!horaPartida || !HORA_REGEX.test(horaPartida)) {
      throw new InvalidItineraryRuleException(
        `La hora de partida debe tener formato HH:mm (24h). Valor recibido: ${props.horaPartida}`,
      );
    }

    if (props.tipoAplicacion === TipoAplicacionItinerario.DIAS_SEMANA) {
      if (!props.diasSemana || !Array.isArray(props.diasSemana) || props.diasSemana.length === 0) {
        throw new InvalidItineraryRuleException(
          'Para una regla por días de semana, debe especificar al menos un día en diasSemana.',
        );
      }
      const diasValidos = props.diasSemana.every(
        (d) => Number.isInteger(d) && d >= 0 && d <= 6,
      );
      if (!diasValidos) {
        throw new InvalidItineraryRuleException(
          'Los días de la semana deben ser enteros entre 0 (Domingo) y 6 (Sábado).',
        );
      }
      this.diasSemana = [...new Set(props.diasSemana)].sort((a, b) => a - b);
      this.fechaEspecifica = undefined;
    } else if (props.tipoAplicacion === TipoAplicacionItinerario.FECHA_ESPECIFICA) {
      const fecha = props.fechaEspecifica?.trim();
      if (!fecha || !FECHA_REGEX.test(fecha)) {
        throw new InvalidItineraryRuleException(
          `Para una regla de fecha específica, fechaEspecifica debe tener formato YYYY-MM-DD. Valor: ${props.fechaEspecifica}`,
        );
      }
      this.fechaEspecifica = fecha;
      this.diasSemana = [];
    } else {
      throw new InvalidItineraryRuleException(
        `Tipo de aplicación no válido: ${props.tipoAplicacion}`,
      );
    }

    this.id = id;
    this.nombre = nombre;
    this.tipoAplicacion = props.tipoAplicacion;
    this.rutaId = rutaId;
    this.horaPartida = horaPartida;
    this.embarcacionDefaultId = embarcacionDefaultId;
    this.activo = props.activo !== undefined ? props.activo : true;
  }

  public static create(props: ReglaItinerarioProps): ReglaItinerario {
    return new ReglaItinerario(props);
  }

  public getId(): string {
    return this.id;
  }

  public getNombre(): string {
    return this.nombre;
  }

  public getTipoAplicacion(): TipoAplicacionItinerario {
    return this.tipoAplicacion;
  }

  public getDiasSemana(): number[] {
    return [...this.diasSemana];
  }

  public getFechaEspecifica(): string | undefined {
    return this.fechaEspecifica;
  }

  public getRutaId(): string {
    return this.rutaId;
  }

  public getHoraPartida(): string {
    return this.horaPartida;
  }

  public getEmbarcacionDefaultId(): string {
    return this.embarcacionDefaultId;
  }

  public isActivo(): boolean {
    return this.activo;
  }

  public aplicaEnFecha(fechaISO: string): boolean {
    if (!this.activo) return false;
    if (this.tipoAplicacion === TipoAplicacionItinerario.FECHA_ESPECIFICA) {
      return this.fechaEspecifica === fechaISO;
    }
    return false;
  }

  public aplicaEnDiaSemana(dia: number): boolean {
    if (!this.activo) return false;
    if (this.tipoAplicacion === TipoAplicacionItinerario.DIAS_SEMANA) {
      return this.diasSemana.includes(dia);
    }
    return false;
  }

  public toProps(): ReglaItinerarioProps {
    return {
      id: this.id,
      nombre: this.nombre,
      tipoAplicacion: this.tipoAplicacion,
      diasSemana: this.diasSemana.length > 0 ? [...this.diasSemana] : undefined,
      fechaEspecifica: this.fechaEspecifica,
      rutaId: this.rutaId,
      horaPartida: this.horaPartida,
      embarcacionDefaultId: this.embarcacionDefaultId,
      activo: this.activo,
    };
  }
}
