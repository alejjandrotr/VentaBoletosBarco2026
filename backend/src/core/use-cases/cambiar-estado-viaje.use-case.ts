import { ITripRepository } from '@ports/outbound/trip-repository.port.js';
import {
  CambiarEstadoViajeDTO,
  ViajeDetalleAdminDTO,
  toTripStatus,
  mapTripToAdminDTO,
} from '@ports/inbound/admin-viajes.dto.js';
import { EntityNotFoundException } from '@core/domain/exceptions/entity-not-found.exception.js';

export class CambiarEstadoViajeUseCase {
  constructor(private readonly tripRepo: ITripRepository) {}

  public async execute(
    viajeId: string,
    dto: CambiarEstadoViajeDTO,
  ): Promise<ViajeDetalleAdminDTO> {
    const trip = await this.tripRepo.findById(viajeId);
    if (!trip) {
      throw new EntityNotFoundException(`Viaje con ID "${viajeId}" no encontrado.`);
    }

    const nuevoStatus = toTripStatus(dto.nuevoEstado);
    trip.changeStatus(nuevoStatus);

    await this.tripRepo.save(trip);

    return mapTripToAdminDTO(trip);
  }
}
