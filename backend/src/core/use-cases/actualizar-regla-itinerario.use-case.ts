import { ReglaItinerarioRepository } from '@ports/outbound/regla-itinerario-repository.port.js';
import { RutaRepository } from '@ports/outbound/ruta-repository.port.js';
import { EmbarcacionRepository } from '@ports/outbound/embarcacion-repository.port.js';
import { PuertoRepository } from '@ports/outbound/puerto-repository.port.js';
import {
  ReglaItinerario,
  TipoAplicacionItinerario,
} from '@core/domain/regla-itinerario.js';
import {
  ActualizarReglaItinerarioDTO,
  ReglaItinerarioResponseDTO,
} from '@ports/inbound/regla-itinerario.dto.js';
import { EntityNotFoundException } from '@core/domain/exceptions/entity-not-found.exception.js';
import { InvalidItineraryRuleException } from '@core/domain/exceptions/invalid-itinerary-rule.exception.js';

export class ActualizarReglaItinerarioUseCase {
  constructor(
    private readonly reglaRepo: ReglaItinerarioRepository,
    private readonly rutaRepo: RutaRepository,
    private readonly embarcacionRepo: EmbarcacionRepository,
    private readonly puertoRepo?: PuertoRepository,
  ) {}

  public async execute(
    id: string,
    dto: ActualizarReglaItinerarioDTO,
  ): Promise<ReglaItinerarioResponseDTO> {
    const reglaActual = await this.reglaRepo.buscarPorId(id);
    if (!reglaActual) {
      throw new EntityNotFoundException(`Regla con ID "${id}" no encontrada.`);
    }

    const nuevaRutaId = dto.rutaId ?? reglaActual.getRutaId();
    const nuevaEmbarcacionId =
      dto.embarcacionDefaultId ?? reglaActual.getEmbarcacionDefaultId();
    const nuevoTipo =
      (dto.tipoAplicacion ??
        reglaActual.getTipoAplicacion()) as TipoAplicacionItinerario;
    const nuevaHora = dto.horaPartida ?? reglaActual.getHoraPartida();
    const nuevoActivo = dto.activo !== undefined ? dto.activo : reglaActual.isActivo();

    // 1. Validar ruta si cambia
    const ruta = await this.rutaRepo.buscarPorId(nuevaRutaId);
    if (!ruta) {
      throw new EntityNotFoundException(
        `Ruta con ID "${nuevaRutaId}" no encontrada.`,
      );
    }

    // 2. Validar embarcación si cambia o si se revalida
    const embarcacion = await this.embarcacionRepo.buscarPorId(
      nuevaEmbarcacionId,
    );
    if (!embarcacion) {
      throw new EntityNotFoundException(
        `Embarcación con ID "${nuevaEmbarcacionId}" no encontrada.`,
      );
    }
    if (!embarcacion.isActivo()) {
      throw new InvalidItineraryRuleException(
        `No se puede asignar una embarcación inactiva (${embarcacion.getNombre()}) como embarcación por defecto.`,
      );
    }

    // 3. Determinar días / fecha específica según el tipo
    let nuevosDias: number[] | undefined =
      dto.diasSemana !== undefined
        ? dto.diasSemana
        : reglaActual.getDiasSemana();
    let nuevaFecha =
      dto.fechaEspecifica !== undefined
        ? dto.fechaEspecifica
        : reglaActual.getFechaEspecifica();

    if (nuevoTipo === TipoAplicacionItinerario.DIAS_SEMANA) {
      nuevaFecha = undefined;
    } else if (nuevoTipo === TipoAplicacionItinerario.FECHA_ESPECIFICA) {
      nuevosDias = undefined;
    }

    // 4. Validar unicidad si está activa
    if (nuevoActivo) {
      const todas = await this.reglaRepo.obtenerTodas();
      this.validarUnicidadHorario(
        id,
        nuevaRutaId,
        nuevaHora,
        nuevoTipo,
        nuevosDias,
        nuevaFecha,
        todas,
      );
    }

    // 5. Crear regla actualizada
    const reglaActualizada = ReglaItinerario.create({
      id: reglaActual.getId(),
      nombre: dto.nombre ?? reglaActual.getNombre(),
      tipoAplicacion: nuevoTipo,
      diasSemana: nuevosDias,
      fechaEspecifica: nuevaFecha,
      rutaId: nuevaRutaId,
      horaPartida: nuevaHora,
      embarcacionDefaultId: nuevaEmbarcacionId,
      activo: nuevoActivo,
    });

    await this.reglaRepo.guardar(reglaActualizada);

    // 6. Construir DTO de respuesta
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
      id: reglaActualizada.getId(),
      nombre: reglaActualizada.getNombre(),
      tipoAplicacion: reglaActualizada.getTipoAplicacion(),
      diasSemana: reglaActualizada.getDiasSemana(),
      fechaEspecifica: reglaActualizada.getFechaEspecifica(),
      rutaId: reglaActualizada.getRutaId(),
      rutaNombre,
      horaPartida: reglaActualizada.getHoraPartida(),
      embarcacionDefaultId: reglaActualizada.getEmbarcacionDefaultId(),
      embarcacionNombre: embarcacion.getNombre(),
      embarcacionCodigo: embarcacion.getCodigo(),
      activo: reglaActualizada.isActivo(),
    };
  }

  private validarUnicidadHorario(
    reglaId: string,
    rutaId: string,
    horaPartida: string,
    tipoAplicacion: TipoAplicacionItinerario,
    diasSemana: number[] | undefined,
    fechaEspecifica: string | undefined,
    reglasExistentes: ReglaItinerario[],
  ): void {
    const colision = reglasExistentes.find((r) => {
      if (r.getId() === reglaId) return false;
      if (!r.isActivo()) return false;
      if (r.getRutaId() !== rutaId) return false;
      if (r.getHoraPartida() !== horaPartida) return false;

      if (
        tipoAplicacion === TipoAplicacionItinerario.FECHA_ESPECIFICA &&
        r.getTipoAplicacion() === TipoAplicacionItinerario.FECHA_ESPECIFICA
      ) {
        return r.getFechaEspecifica() === fechaEspecifica;
      }

      if (
        tipoAplicacion === TipoAplicacionItinerario.DIAS_SEMANA &&
        r.getTipoAplicacion() === TipoAplicacionItinerario.DIAS_SEMANA
      ) {
        const dias = diasSemana || [];
        return r.getDiasSemana().some((d) => dias.includes(d));
      }

      return false;
    });

    if (colision) {
      throw new InvalidItineraryRuleException(
        `Ya existe una regla activa programada para la ruta "${rutaId}" a las ${horaPartida} en el mismo día/fecha.`,
      );
    }
  }
}
