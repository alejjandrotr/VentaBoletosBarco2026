import { describe, it, expect } from 'vitest';
import { InMemoryPuertoRepository } from './in-memory-puerto.repository.js';
import { InMemoryRutaRepository } from './in-memory-ruta.repository.js';
import { InMemoryEmbarcacionRepository } from './in-memory-embarcacion.repository.js';
import { InMemoryReglaItinerarioRepository } from './in-memory-regla-itinerario.repository.js';
import { ReglaItinerario, TipoAplicacionItinerario } from '@core/domain/regla-itinerario.js';

describe('SPEC-007: Repositorios en Memoria y Catálogo Estático', () => {
  it('InMemoryPuertoRepository retorna los puertos semilla correctamente', async () => {
    const repo = new InMemoryPuertoRepository();
    const puertos = await repo.obtenerTodos();

    expect(puertos.length).toBeGreaterThanOrEqual(3);
    const guanta = await repo.buscarPorId('PTO-01');
    expect(guanta).not.toBeNull();
    expect(guanta?.getNombre()).toContain('Guanta');
  });

  it('InMemoryRutaRepository retorna las rutas y permite buscar por ID', async () => {
    const repo = new InMemoryRutaRepository();
    const rutas = await repo.obtenerTodas();

    expect(rutas.length).toBeGreaterThanOrEqual(4);
    const ruta1 = await repo.buscarPorId('RUT-01');
    expect(ruta1?.getOrigenPuertoId()).toBe('PTO-01');
    expect(ruta1?.getDestinoPuertoId()).toBe('PTO-02');
  });

  it('InMemoryEmbarcacionRepository retorna las embarcaciones registradas', async () => {
    const repo = new InMemoryEmbarcacionRepository();
    const embarcaciones = await repo.obtenerTodas();

    expect(embarcaciones.length).toBeGreaterThanOrEqual(3);
    const emb1 = await repo.buscarPorId('EMB-01');
    expect(emb1?.getCapacidadFisica()).toBe(50);
  });

  it('InMemoryReglaItinerarioRepository permite consultar y guardar nuevas reglas', async () => {
    const repo = new InMemoryReglaItinerarioRepository();
    const reglasIniciales = await repo.obtenerTodas();
    expect(reglasIniciales.length).toBeGreaterThanOrEqual(4);

    const nuevaRegla = ReglaItinerario.create({
      id: 'REG-NUEVA-01',
      nombre: 'Regla Feriado Especial',
      tipoAplicacion: TipoAplicacionItinerario.FECHA_ESPECIFICA,
      fechaEspecifica: '2026-12-31',
      rutaId: 'RUT-01',
      horaPartida: '09:00',
      embarcacionDefaultId: 'EMB-01',
    });

    await repo.guardar(nuevaRegla);

    const encontrada = await repo.buscarPorId('REG-NUEVA-01');
    expect(encontrada).not.toBeNull();
    expect(encontrada?.getFechaEspecifica()).toBe('2026-12-31');
  });
});
