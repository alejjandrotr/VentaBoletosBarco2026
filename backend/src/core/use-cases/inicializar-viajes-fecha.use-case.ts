import { GenerarViajesDiaUseCase } from '@core/use-cases/generar-viajes-dia.use-case.js';
import {
  ViajeDetalleAdminDTO,
  mapTripToAdminDTO,
} from '@ports/inbound/admin-viajes.dto.js';

export class InicializarViajesFechaUseCase {
  constructor(
    private readonly generarViajesDiaUseCase: GenerarViajesDiaUseCase,
  ) {}

  public async execute(fecha: string): Promise<ViajeDetalleAdminDTO[]> {
    const resultado = await this.generarViajesDiaUseCase.execute({ fecha });

    // Ordenar cronológicamente
    const ordenados = [...resultado.viajes].sort(
      (a, b) =>
        a.getDepartureTime().getTime() - b.getDepartureTime().getTime(),
    );

    return ordenados.map(mapTripToAdminDTO);
  }
}
