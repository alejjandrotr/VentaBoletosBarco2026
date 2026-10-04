import { Embarcacion } from '@core/domain/embarcacion.js';

export interface EmbarcacionRepository {
  obtenerTodas(): Promise<Embarcacion[]>;
  buscarPorId(id: string): Promise<Embarcacion | null>;
}
