import { describe, it, expect, beforeEach } from 'vitest';
import { AdminViajesController } from './admin-viajes.controller.js';
import { InMemoryTripRepository } from '@adapters/outbound/persistence/in-memory-trip.repository.js';
import { InMemoryReglaItinerarioRepository } from '@adapters/outbound/persistence/in-memory-regla-itinerario.repository.js';
import { InMemoryRutaRepository } from '@adapters/outbound/persistence/in-memory-ruta.repository.js';
import { InMemoryPuertoRepository } from '@adapters/outbound/persistence/in-memory-puerto.repository.js';
import { InMemoryEmbarcacionRepository } from '@adapters/outbound/persistence/in-memory-embarcacion.repository.js';
import { GenerarViajesDiaUseCase } from '@core/use-cases/generar-viajes-dia.use-case.js';
import { ConsultarViajesPorFechaUseCase } from '@core/use-cases/consultar-viajes-por-fecha.use-case.js';
import { InicializarViajesFechaUseCase } from '@core/use-cases/inicializar-viajes-fecha.use-case.js';
import { CambiarEstadoViajeUseCase } from '@core/use-cases/cambiar-estado-viaje.use-case.js';
import { Trip, TripStatus } from '@core/domain/trip.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AdminViajesController (HTTP Adapter)', () => {
  let controller: AdminViajesController;
  let tripRepo: InMemoryTripRepository;

  beforeEach(() => {
    tripRepo = new InMemoryTripRepository([]);
    const reglaRepo = new InMemoryReglaItinerarioRepository();
    const rutaRepo = new InMemoryRutaRepository();
    const puertoRepo = new InMemoryPuertoRepository();
    const embarcacionRepo = new InMemoryEmbarcacionRepository();

    const generarViajesUseCase = new GenerarViajesDiaUseCase(
      tripRepo,
      reglaRepo,
      rutaRepo,
      puertoRepo,
      embarcacionRepo,
    );
    const consultarViajesUseCase = new ConsultarViajesPorFechaUseCase(tripRepo);
    const inicializarViajesUseCase = new InicializarViajesFechaUseCase(
      generarViajesUseCase,
    );
    const cambiarEstadoUseCase = new CambiarEstadoViajeUseCase(tripRepo);

    controller = new AdminViajesController(
      consultarViajesUseCase,
      inicializarViajesUseCase,
      cambiarEstadoUseCase,
    );
  });

  it('GET /api/admin/viajes retorna lista de viajes para la fecha solicitada', async () => {
    const res = await controller.consultarPorFecha('2026-10-15');
    expect(Array.isArray(res)).toBe(true);
  });

  it('GET /api/admin/viajes lanza BadRequestException con fecha malformada', async () => {
    await expect(controller.consultarPorFecha('fecha-invalida')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('POST /api/admin/viajes/inicializar genera e inicializa viajes del día', async () => {
    const viajes = await controller.inicializarViajes({ fecha: '2026-10-15' });
    expect(viajes.length).toBeGreaterThan(0);
    expect(viajes[0].estado).toBe('PROGRAMADO');
  });

  it('PATCH /api/admin/viajes/:id/estado actualiza estado a EN_EMBARQUE', async () => {
    const viaje = Trip.create({
      tripId: 'V-HTTP-001',
      origin: 'Guanta',
      destination: 'El Guamache',
      departureTime: new Date('2026-10-15T08:00:00'),
      status: TripStatus.SCHEDULED,
      basePrice: 20,
      transportUnit: {
        id: 'EMB-01',
        unitName: 'Lancha 1',
        plateNumber: 'P-1',
        model: 'M',
        totalCapacity: 50,
      },
    });
    await tripRepo.save(viaje);

    const res = await controller.cambiarEstado('V-HTTP-001', {
      nuevoEstado: 'EN_EMBARQUE',
    });

    expect(res.estado).toBe('EN_EMBARQUE');
  });

  it('PATCH /api/admin/viajes/:id/estado lanza NotFoundException con ID inexistente', async () => {
    await expect(
      controller.cambiarEstado('V-NO-EXISTE', { nuevoEstado: 'EN_EMBARQUE' }),
    ).rejects.toThrow(NotFoundException);
  });
});
