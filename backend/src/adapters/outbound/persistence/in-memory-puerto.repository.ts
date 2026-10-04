import { PuertoRepository } from '@ports/outbound/puerto-repository.port.js';
import { Puerto } from '@core/domain/puerto.js';

export const SEED_PUERTOS: Puerto[] = [
  Puerto.create({
    id: 'PTO-01',
    nombre: 'Terminal Marítimo de Guanta',
    ubicacionTexto: 'Guanta, Anzoátegui',
    latitud: 10.241,
    longitud: -64.588,
  }),
  Puerto.create({
    id: 'PTO-02',
    nombre: 'Puerto Internacional El Guamache',
    ubicacionTexto: 'Isla de Margarita, Nueva Esparta',
    latitud: 10.875,
    longitud: -64.062,
  }),
  Puerto.create({
    id: 'PTO-03',
    nombre: 'Terminal de Pasajeros de Chacopata',
    ubicacionTexto: 'Península de Araya, Sucre',
    latitud: 10.669,
    longitud: -63.784,
  }),
];

export class InMemoryPuertoRepository implements PuertoRepository {
  private readonly puertos: Map<string, Puerto> = new Map();

  constructor(initialData: Puerto[] = SEED_PUERTOS) {
    for (const puerto of initialData) {
      this.puertos.set(puerto.getId(), puerto);
    }
  }

  public async obtenerTodos(): Promise<Puerto[]> {
    return Array.from(this.puertos.values());
  }

  public async buscarPorId(id: string): Promise<Puerto | null> {
    return this.puertos.get(id) || null;
  }
}
