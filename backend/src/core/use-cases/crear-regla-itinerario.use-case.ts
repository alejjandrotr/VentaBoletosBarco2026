import { ReglaItinerarioRepository } from '@ports/outbound/regla-itinerario-repository.port.js';
import { RutaRepository } from '@ports/outbound/ruta-repository.port.js';
import { EmbarcacionRepository } from '@ports/outbound/embarcacion-repository.port.js';
import { PuertoRepository } from '@ports/outbound/puerto-repository.port.js';
import {
  ReglaItinerario,
  TipoAplicacionItinerario,
} from '@core/domain/regla-itinerario.js';
import {
  CrearReglaItinerarioDTO,
  ReglaItinerarioResponseDTO,
} from '@ports/inbound/regla-itinerario.dto.js';
import { EntityNotFoundException } from '@core/domain/exceptions/entity-not-found.exception.js';
import { InvalidItineraryRuleException } from '@core/domain/exceptions/invalid-itinerary-rule.exception.js';

export class CrearReglaItinerarioUseCase {
  constructor(
    private readonly reglaRepo: ReglaItinerarioRepository,
    private readonly rutaRepo: RutaRepository,
    private readonly embarcacionRepo: EmbarcacionRepository,
    private readonly puertoRepo?: PuertoRepository,
  ) {}

  public async execute(
    dto: CrearReglaItinerarioDTO,
  ): Promise<ReglaItinerarioResponseDTO> {
    // 1. Validar existencia de la ruta
    const ruta = await this.rutaRepo.buscarPorId(dto.rutaId);
    if (!ruta) {
      throw new EntityNotFoundException(
        `Ruta con ID "${dto.rutaId}" no encontrada.`,
      );
    }

    // 2. Validar existencia y estado activo de la embarcación
    const embarcacion = await this.embarcacionRepo.buscarPorId(
      dto.embarcacionDefaultId,
    );
    if (!embarcacion) {
      throw new EntityNotFoundException(
        `Embarcación con ID "${dto.embarcacionDefaultId}" no encontrada.`,
      );
    }
    if (!embarcacion.isActivo()) {
      throw new InvalidItineraryRuleException(
        `No se puede asignar una embarcación inactiva (${embarcacion.getNombre()}) como embarcación por defecto.`,
      );
    }

    // 3. Validar unicidad de horario para la misma ruta y día/fecha
    const todasLasReglas = await this.reglaRepo.obtenerTodas();
    this.validarUnicidadHorario(dto, todasLasReglas);

    // 4. Instanciar la entidad de dominio (valida formato HH:mm, fechas y días)
    const id =
      dto.id ||
      `REG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const regla = ReglaItinerario.create({
      id,
      nombre: dto.nombre,
      tipoAplicacion: dto.tipoAplicacion as TipoAplicacionItinerario,
      diasSemana: dto.diasSemana,
      fechaEspecifica: dto.fechaEspecifica,
      rutaId: dto.rutaId,
      horaPartida: dto.horaPartida,
      embarcacionDefaultId: dto.embarcacionDefaultId,
      activo: dto.activo !== undefined ? dto.activo : true,
    });

    // 5. Persistir en el repositorio
    await this.reglaRepo.guardar(regla);

    // 6. Construir DTO enriquecido
    let rutaNombre = `${ruta.getOrigenPuertoId()} -> ${ruta.getDestinoPuertoId()}`;
    if (this.puertoRepo) {
      const pOrigen = await this.puertoRepo.buscarPorId(
        ruta.getOrigenPuertoId(),
      );
      const pDestino = await this.puertoRepo.buscarPorId(
        ruta.getDestinoPuertoId(),
      );
      if (pOrigen && pDestino) {
        rutaNombre = `${pOrigen.getNombre()} -> ${pDestino.getNombre()}`;
      }
    }

    return {
      id: regla.getId(),
      nombre: regla.getNombre(),
      tipoAplicacion: regla.getTipoAplicacion(),
      diasSemana: regla.getDiasSemana(),
      fechaEspecifica: regla.getFechaEspecifica(),
      rutaId: regla.getRutaId(),
      rutaNombre,
      horaPartida: regla.getHoraPartida(),
      embarcacionDefaultId: regla.getEmbarcacionDefaultId(),
      embarcacionNombre: embarcacion.getNombre(),
      embarcacionCodigo: embarcacion.getCodigo(),
      activo: regla.isActivo(),
    };
  }

  private validarUnicidadHorario(
    dto: CrearReglaItinerarioDTO,
    reglasExistentes: ReglaItinerario[],
  ): void {
    const colision = reglasExistentes.find((r) => {
      if (!r.isActivo()) return false;
      if (r.getRutaId() !== dto.rutaId) return false;
      if (r.getHoraPartida() !== dto.horaPartida) return false;

      if (
        dto.tipoAplicacion === TipoAplicacionItinerario.FECHA_ESPECIFICA &&
        r.getTipoAplicacion() === TipoAplicacionItinerario.FECHA_ESPECIFICA
      ) {
        return r.getFechaEspecifica() === dto.fechaEspecifica;
      }

      if (
        dto.tipoAplicacion === TipoAplicacionItinerario.DIAS_SEMANA &&
        r.getTipoAplicacion() === TipoAplicacionItinerario.DIAS_SEMANA
      ) {
        const diasNuevos = dto.diasSemana || [];
        return r.getDiasSemana().some((d) => diasNuevos.includes(d));
      }

      return false;
    });

    if (colision) {
      throw new InvalidItineraryRuleException(
        `Ya existe una regla activa programada para la ruta "${dto.rutaId}" a las ${dto.horaPartida} en el mismo día/fecha.`,
      );
    }
  }
}
