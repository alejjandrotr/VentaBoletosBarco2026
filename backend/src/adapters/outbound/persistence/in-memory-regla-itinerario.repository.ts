import { ReglaItinerarioRepository } from '@ports/outbound/regla-itinerario-repository.port.js';
import { ReglaItinerario, TipoAplicacionItinerario } from '@core/domain/regla-itinerario.js';

export const SEED_REGLAS_ITINERARIO: ReglaItinerario[] = [
  // Lunes a Viernes: Guanta -> El Guamache (08:00 y 14:00)
  ReglaItinerario.create({
    id: 'REG-LV-0800-GUA-GUA',
    nombre: 'Guanta -> El Guamache 08:00 AM (L-V)',
    tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
    diasSemana: [1, 2, 3, 4, 5],
    rutaId: 'RUT-01',
    horaPartida: '08:00',
    embarcacionDefaultId: 'EMB-01',
  }),
  ReglaItinerario.create({
    id: 'REG-LV-1400-GUA-GUA',
    nombre: 'Guanta -> El Guamache 02:00 PM (L-V)',
    tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
    diasSemana: [1, 2, 3, 4, 5],
    rutaId: 'RUT-01',
    horaPartida: '14:00',
    embarcacionDefaultId: 'EMB-02',
  }),
  // Lunes a Viernes: El Guamache -> Guanta (11:00 y 17:00)
  ReglaItinerario.create({
    id: 'REG-LV-1100-GUA-GUA',
    nombre: 'El Guamache -> Guanta 11:00 AM (L-V)',
    tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
    diasSemana: [1, 2, 3, 4, 5],
    rutaId: 'RUT-02',
    horaPartida: '11:00',
    embarcacionDefaultId: 'EMB-01',
  }),
  ReglaItinerario.create({
    id: 'REG-LV-1700-GUA-GUA',
    nombre: 'El Guamache -> Guanta 05:00 PM (L-V)',
    tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
    diasSemana: [1, 2, 3, 4, 5],
    rutaId: 'RUT-02',
    horaPartida: '17:00',
    embarcacionDefaultId: 'EMB-02',
  }),
];

export class InMemoryReglaItinerarioRepository implements ReglaItinerarioRepository {
  private readonly reglas: Map<string, ReglaItinerario> = new Map();

  constructor(initialData: ReglaItinerario[] = SEED_REGLAS_ITINERARIO) {
    for (const regla of initialData) {
      this.reglas.set(regla.getId(), regla);
    }
  }

  public async obtenerTodas(): Promise<ReglaItinerario[]> {
    return Array.from(this.reglas.values());
  }

  public async buscarPorId(id: string): Promise<ReglaItinerario | null> {
    return this.reglas.get(id) || null;
  }

  public async guardar(regla: ReglaItinerario): Promise<void> {
    this.reglas.set(regla.getId(), regla);
  }
}
