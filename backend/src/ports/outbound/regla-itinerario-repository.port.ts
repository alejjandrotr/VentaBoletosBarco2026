import { ReglaItinerario } from '@core/domain/regla-itinerario.js';

export interface ReglaItinerarioRepository {
  obtenerTodas(): Promise<ReglaItinerario[]>;
  buscarPorId(id: string): Promise<ReglaItinerario | null>;
  guardar(regla: ReglaItinerario): Promise<void>;
}
