import { RutaRepository } from '@ports/outbound/ruta-repository.port.js';
import { Ruta } from '@core/domain/ruta.js';

export const SEED_RUTAS: Ruta[] = [
  Ruta.create({
    id: 'RUT-01',
    origenPuertoId: 'PTO-01', // Guanta
    destinoPuertoId: 'PTO-02', // El Guamache
    distanciaKm: 88.5,
  }),
  Ruta.create({
    id: 'RUT-02',
    origenPuertoId: 'PTO-02', // El Guamache
    destinoPuertoId: 'PTO-01', // Guanta
    distanciaKm: 88.5,
  }),
  Ruta.create({
    id: 'RUT-03',
    origenPuertoId: 'PTO-03', // Chacopata
    destinoPuertoId: 'PTO-02', // El Guamache
    distanciaKm: 42.0,
  }),
  Ruta.create({
    id: 'RUT-04',
    origenPuertoId: 'PTO-02', // El Guamache
    destinoPuertoId: 'PTO-03', // Chacopata
    distanciaKm: 42.0,
  }),
];

export class InMemoryRutaRepository implements RutaRepository {
  private readonly rutas: Map<string, Ruta> = new Map();

  constructor(initialData: Ruta[] = SEED_RUTAS) {
    for (const ruta of initialData) {
      this.rutas.set(ruta.getId(), ruta);
    }
  }

  public async obtenerTodas(): Promise<Ruta[]> {
    return Array.from(this.rutas.values());
  }

  public async buscarPorId(id: string): Promise<Ruta | null> {
    return this.rutas.get(id) || null;
  }
}
