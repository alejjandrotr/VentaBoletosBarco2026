import { ITripRepository } from '@ports/outbound/trip-repository.port.js';
import {
  ViajeDetalleAdminDTO,
  mapTripToAdminDTO,
} from '@ports/inbound/admin-viajes.dto.js';

export class ConsultarViajesPorFechaUseCase {
  constructor(private readonly tripRepo: ITripRepository) {}

  public async execute(fecha: string): Promise<ViajeDetalleAdminDTO[]> {
    const viajes = await this.tripRepo.findByDate(fecha);

    // Ordenar cronológicamente por hora de partida
    viajes.sort(
      (a, b) =>
        a.getDepartureTime().getTime() - b.getDepartureTime().getTime(),
    );

    return viajes.map(mapTripToAdminDTO);
  }
}
