import { Ruta } from '@core/domain/ruta.js';

export interface RutaRepository {
  obtenerTodas(): Promise<Ruta[]>;
  buscarPorId(id: string): Promise<Ruta | null>;
}
