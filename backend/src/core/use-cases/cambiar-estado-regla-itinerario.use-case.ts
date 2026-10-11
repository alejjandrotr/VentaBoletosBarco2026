import { ReglaItinerarioRepository } from '@ports/outbound/regla-itinerario-repository.port.js';
import {
  ReglaItinerario,
  TipoAplicacionItinerario,
} from '@core/domain/regla-itinerario.js';
import { EntityNotFoundException } from '@core/domain/exceptions/entity-not-found.exception.js';
import { InvalidItineraryRuleException } from '@core/domain/exceptions/invalid-itinerary-rule.exception.js';

export class CambiarEstadoReglaItinerarioUseCase {
  constructor(private readonly reglaRepo: ReglaItinerarioRepository) {}

  public async execute(id: string, activo: boolean): Promise<void> {
    const regla = await this.reglaRepo.buscarPorId(id);
    if (!regla) {
      throw new EntityNotFoundException(`Regla con ID "${id}" no encontrada.`);
    }

    if (regla.isActivo() === activo) {
      return;
    }

    if (activo) {
      const todas = await this.reglaRepo.obtenerTodas();
      const colision = todas.find((r) => {
        if (r.getId() === id) return false;
        if (!r.isActivo()) return false;
        if (r.getRutaId() !== regla.getRutaId()) return false;
        if (r.getHoraPartida() !== regla.getHoraPartida()) return false;

        if (
          regla.getTipoAplicacion() === TipoAplicacionItinerario.FECHA_ESPECIFICA &&
          r.getTipoAplicacion() === TipoAplicacionItinerario.FECHA_ESPECIFICA
        ) {
          return r.getFechaEspecifica() === regla.getFechaEspecifica();
        }

        if (
          regla.getTipoAplicacion() === TipoAplicacionItinerario.DIAS_SEMANA &&
          r.getTipoAplicacion() === TipoAplicacionItinerario.DIAS_SEMANA
        ) {
          return r.getDiasSemana().some((d) => regla.getDiasSemana().includes(d));
        }

        return false;
      });

      if (colision) {
        throw new InvalidItineraryRuleException(
          `No se puede activar la regla: ya existe otra regla activa programada para la misma ruta y horario.`,
        );
      }
    }

    const props = regla.toProps();
    const updated = ReglaItinerario.create({
      ...props,
      activo,
    });

    await this.reglaRepo.guardar(updated);
  }
}
