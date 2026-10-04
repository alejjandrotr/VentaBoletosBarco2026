import { EmbarcacionRepository } from '@ports/outbound/embarcacion-repository.port.js';
import { Embarcacion } from '@core/domain/embarcacion.js';

export const SEED_EMBARCACIONES: Embarcacion[] = [
  Embarcacion.create({
    id: 'EMB-01',
    codigo: 'ARSH-PE-001',
    nombre: 'Gran Cacique Express I',
    capacidadFisica: 50,
    activo: true,
  }),
  Embarcacion.create({
    id: 'EMB-02',
    codigo: 'ARSH-PE-002',
    nombre: 'Gran Cacique Express II',
    capacidadFisica: 60,
    activo: true,
  }),
  Embarcacion.create({
    id: 'EMB-03',
    codigo: 'ARSH-PE-003',
    nombre: 'Lancha Rápida Virgen del Valle',
    capacidadFisica: 35,
    activo: true,
  }),
];

export class InMemoryEmbarcacionRepository implements EmbarcacionRepository {
  private readonly embarcaciones: Map<string, Embarcacion> = new Map();

  constructor(initialData: Embarcacion[] = SEED_EMBARCACIONES) {
    for (const emb of initialData) {
      this.embarcaciones.set(emb.getId(), emb);
    }
  }

  public async obtenerTodas(): Promise<Embarcacion[]> {
    return Array.from(this.embarcaciones.values());
  }

  public async buscarPorId(id: string): Promise<Embarcacion | null> {
    return this.embarcaciones.get(id) || null;
  }
}
