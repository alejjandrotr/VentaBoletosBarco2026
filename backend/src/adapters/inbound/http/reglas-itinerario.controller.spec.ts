import { describe, it, expect, beforeEach } from 'vitest';
import { ReglasItinerarioController } from './reglas-itinerario.controller.js';
import { InMemoryReglaItinerarioRepository } from '@adapters/outbound/persistence/in-memory-regla-itinerario.repository.js';
import { InMemoryEmbarcacionRepository } from '@adapters/outbound/persistence/in-memory-embarcacion.repository.js';
import { InMemoryRutaRepository } from '@adapters/outbound/persistence/in-memory-ruta.repository.js';
import { InMemoryPuertoRepository } from '@adapters/outbound/persistence/in-memory-puerto.repository.js';
import { CrearReglaItinerarioUseCase } from '@core/use-cases/crear-regla-itinerario.use-case.js';
import { ActualizarReglaItinerarioUseCase } from '@core/use-cases/actualizar-regla-itinerario.use-case.js';
import { CambiarEstadoReglaItinerarioUseCase } from '@core/use-cases/cambiar-estado-regla-itinerario.use-case.js';
import { ListarReglasItinerarioUseCase } from '@core/use-cases/listar-reglas-itinerario.use-case.js';
import { NotFoundException } from '@nestjs/common';

describe('ReglasItinerarioController (HTTP Adapter)', () => {
  let controller: ReglasItinerarioController;
  let reglaRepo: InMemoryReglaItinerarioRepository;

  beforeEach(() => {
    reglaRepo = new InMemoryReglaItinerarioRepository([]);
    const embarcacionRepo = new InMemoryEmbarcacionRepository();
    const rutaRepo = new InMemoryRutaRepository();
    const puertoRepo = new InMemoryPuertoRepository();

    const crearUseCase = new CrearReglaItinerarioUseCase(
      reglaRepo,
      rutaRepo,
      embarcacionRepo,
      puertoRepo,
    );
    const actualizarUseCase = new ActualizarReglaItinerarioUseCase(
      reglaRepo,
      rutaRepo,
      embarcacionRepo,
      puertoRepo,
    );
    const cambiarEstadoUseCase = new CambiarEstadoReglaItinerarioUseCase(
      reglaRepo,
    );
    const listarUseCase = new ListarReglasItinerarioUseCase(
      reglaRepo,
      rutaRepo,
      embarcacionRepo,
      puertoRepo,
    );

    controller = new ReglasItinerarioController(
      crearUseCase,
      actualizarUseCase,
      cambiarEstadoUseCase,
      listarUseCase,
    );
  });

  it('POST /api/itinerarios/reglas crea una regla exitosamente', async () => {
    const res = await controller.crear({
      nombre: 'Salida de la Tarde',
      tipoAplicacion: 'DIAS_SEMANA',
      diasSemana: [1, 2, 3],
      rutaId: 'RUT-01',
      horaPartida: '14:00',
      embarcacionDefaultId: 'EMB-01',
    });

    expect(res).toBeDefined();
    expect(res.id).toBeDefined();
    expect(res.nombre).toBe('Salida de la Tarde');
    expect(res.embarcacionNombre).toBe('Gran Cacique Express I');
  });

  it('POST /api/itinerarios/reglas lanza NotFoundException ante embarcación o ruta inexistente', async () => {
    await expect(
      controller.crear({
        nombre: 'Salida Inválida',
        tipoAplicacion: 'DIAS_SEMANA',
        diasSemana: [1],
        rutaId: 'RUT-01',
        horaPartida: '10:00',
        embarcacionDefaultId: 'EMB-NO-EXISTE',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('GET /api/itinerarios/reglas lista reglas con filtros opcionales', async () => {
    await controller.crear({
      nombre: 'Salida 1',
      tipoAplicacion: 'DIAS_SEMANA',
      diasSemana: [1],
      rutaId: 'RUT-01',
      horaPartida: '08:00',
      embarcacionDefaultId: 'EMB-01',
    });

    const todas = await controller.listar();
    expect(todas.length).toBe(1);

    const filtradas = await controller.listar('RUT-02');
    expect(filtradas.length).toBe(0);
  });

  it('PATCH /api/itinerarios/reglas/:id/estado activa y desactiva la regla', async () => {
    const creada = await controller.crear({
      nombre: 'Regla Conmutable',
      tipoAplicacion: 'DIAS_SEMANA',
      diasSemana: [1],
      rutaId: 'RUT-01',
      horaPartida: '11:00',
      embarcacionDefaultId: 'EMB-01',
    });

    const res = await controller.cambiarEstado(creada.id, { activo: false });
    expect(res.success).toBe(true);

    const reglaEnRepo = await reglaRepo.buscarPorId(creada.id);
    expect(reglaEnRepo?.isActivo()).toBe(false);
  });

  it('PUT /api/itinerarios/reglas/:id actualiza los campos de una regla existente', async () => {
    const creada = await controller.crear({
      nombre: 'Regla Original',
      tipoAplicacion: 'DIAS_SEMANA',
      diasSemana: [1],
      rutaId: 'RUT-01',
      horaPartida: '06:00',
      embarcacionDefaultId: 'EMB-01',
    });

    const actualizada = await controller.actualizar(creada.id, {
      nombre: 'Regla Editada',
      horaPartida: '06:30',
    });

    expect(actualizada.nombre).toBe('Regla Editada');
    expect(actualizada.horaPartida).toBe('06:30');
  });
});
