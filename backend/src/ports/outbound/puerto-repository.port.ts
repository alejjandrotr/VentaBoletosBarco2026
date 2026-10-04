import { Puerto } from '@core/domain/puerto.js';

export interface PuertoRepository {
  obtenerTodos(): Promise<Puerto[]>;
  buscarPorId(id: string): Promise<Puerto | null>;
}
