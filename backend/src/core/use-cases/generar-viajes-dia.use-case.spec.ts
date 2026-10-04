import { describe, it, expect, beforeEach } from 'vitest';
import { GenerarViajesDiaUseCase } from './generar-viajes-dia.use-case.js';
import { InMemoryTripRepository } from '@adapters/outbound/persistence/in-memory-trip.repository.js';
import { InMemoryReglaItinerarioRepository } from '@adapters/outbound/persistence/in-memory-regla-itinerario.repository.js';
import { InMemoryRutaRepository } from '@adapters/outbound/persistence/in-memory-ruta.repository.js';
import { InMemoryPuertoRepository } from '@adapters/outbound/persistence/in-memory-puerto.repository.js';
import { InMemoryEmbarcacionRepository } from '@adapters/outbound/persistence/in-memory-embarcacion.repository.js';
import { EvaluadorItinerario } from '@core/domain/evaluador-itinerario.js';
import { ReglaItinerario, TipoAplicacionItinerario } from '@core/domain/regla-itinerario.js';
import { TripStatus } from '@core/domain/trip.js';

describe('SPEC-008: GenerarViajesDiaUseCase (Idempotencia y Resolución de Itinerario)', () => {
  let tripRepo: InMemoryTripRepository;
  let reglaRepo: InMemoryReglaItinerarioRepository;
  let rutaRepo: InMemoryRutaRepository;
  let puertoRepo: InMemoryPuertoRepository;
  let embarcacionRepo: InMemoryEmbarcacionRepository;
  let evaluador: EvaluadorItinerario;
  let useCase: GenerarViajesDiaUseCase;

  beforeEach(() => {
    tripRepo = new InMemoryTripRepository();
    reglaRepo = new InMemoryReglaItinerarioRepository();
    rutaRepo = new InMemoryRutaRepository();
    puertoRepo = new InMemoryPuertoRepository();
    embarcacionRepo = new InMemoryEmbarcacionRepository();
    evaluador = new EvaluadorItinerario();

    useCase = new GenerarViajesDiaUseCase(
      tripRepo,
      reglaRepo,
      rutaRepo,
      puertoRepo,
      embarcacionRepo,
      evaluador,
    );
  });

  it('Escenario 1: Generación automática de viajes para un día regular de semana (Lunes)', async () => {
    // 2026-10-05 es Lunes (diasSemana = 1)
    // El seed contiene 4 reglas para L-V (2 de ida y 2 de vuelta)
    const result = await useCase.execute({ fecha: '2026-10-05' });

    expect(result.esRecienGenerado).toBe(true);
    expect(result.totalViajes).toBe(4);
    expect(result.viajes).toHaveLength(4);

    const primerViaje = result.viajes[0];
    expect(primerViaje.getStatus()).toBe(TripStatus.SCHEDULED);
    expect(primerViaje.getAvailableSeats()).toBe(primerViaje.getTransportUnitProps().totalCapacity);
    expect(primerViaje.getTripId()).toMatch(/^V-20261005-/);
  });

  it('Escenario 2: Prioridad de fecha específica sobre regla regular (Feriado Navidad)', async () => {
    // 2026-12-25 es Viernes (diasSemana = 5)
    // Añadimos una regla especial exclusiva para el 2026-12-25 a las 11:00
    const reglaNavidad = ReglaItinerario.create({
      id: 'REG-FERIADO-NAV-11',
      nombre: 'Salida Única Feriado Navidad',
      tipoAplicacion: TipoAplicacionItinerario.FECHA_ESPECIFICA,
      fechaEspecifica: '2026-12-25',
      rutaId: 'RUT-01',
      horaPartida: '11:00',
      embarcacionDefaultId: 'EMB-01',
    });
    await reglaRepo.guardar(reglaNavidad);

    const result = await useCase.execute({ fecha: '2026-12-25' });

    expect(result.esRecienGenerado).toBe(true);
    expect(result.totalViajes).toBe(1);
    expect(result.viajes[0].getTripId()).toBe('V-20261225-1100-RUT-01');
    expect(result.viajes[0].getReglaItinerarioId()).toBe('REG-FERIADO-NAV-11');
  });

  it('Escenario 3: Idempotencia ante aperturas o consultas repetidas', async () => {
    // Primera llamada genera los viajes
    const primeraEjecucion = await useCase.execute({ fecha: '2026-10-05' });
    expect(primeraEjecucion.esRecienGenerado).toBe(true);
    expect(primeraEjecucion.totalViajes).toBe(4);

    // Segunda llamada devuelve exactamente los mismos viajes sin duplicarlos
    const segundaEjecucion = await useCase.execute({ fecha: '2026-10-05' });
    expect(segundaEjecucion.esRecienGenerado).toBe(false);
    expect(segundaEjecucion.totalViajes).toBe(4);
    expect(segundaEjecucion.viajes.map((v) => v.getTripId())).toEqual(
      primeraEjecucion.viajes.map((v) => v.getTripId()),
    );
  });
});
