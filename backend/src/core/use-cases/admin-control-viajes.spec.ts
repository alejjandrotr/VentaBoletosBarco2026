import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTripRepository } from '@adapters/outbound/persistence/in-memory-trip.repository.js';
import { InMemoryReglaItinerarioRepository } from '@adapters/outbound/persistence/in-memory-regla-itinerario.repository.js';
import { InMemoryRutaRepository } from '@adapters/outbound/persistence/in-memory-ruta.repository.js';
import { InMemoryPuertoRepository } from '@adapters/outbound/persistence/in-memory-puerto.repository.js';
import { InMemoryEmbarcacionRepository } from '@adapters/outbound/persistence/in-memory-embarcacion.repository.js';
import { GenerarViajesDiaUseCase } from './generar-viajes-dia.use-case.js';
import { ConsultarViajesPorFechaUseCase } from './consultar-viajes-por-fecha.use-case.js';
import { InicializarViajesFechaUseCase } from './inicializar-viajes-fecha.use-case.js';
import { CambiarEstadoViajeUseCase } from './cambiar-estado-viaje.use-case.js';
import { Trip, TripStatus } from '@core/domain/trip.js';
import { EntityNotFoundException } from '@core/domain/exceptions/entity-not-found.exception.js';
import { InvalidTripStatusTransitionException } from '@core/domain/exceptions/invalid-trip-status-transition.exception.js';
import { TripNotAvailableForSaleException } from '@core/domain/exceptions/trip-not-available-for-sale.exception.js';

describe('SPEC-010: Panel de Control y Operaciones de Viajes del Día', () => {
  let tripRepo: InMemoryTripRepository;
  let reglaRepo: InMemoryReglaItinerarioRepository;
  let rutaRepo: InMemoryRutaRepository;
  let puertoRepo: InMemoryPuertoRepository;
  let embarcacionRepo: InMemoryEmbarcacionRepository;

  let generarViajesUseCase: GenerarViajesDiaUseCase;
  let consultarViajesUseCase: ConsultarViajesPorFechaUseCase;
  let inicializarViajesUseCase: InicializarViajesFechaUseCase;
  let cambiarEstadoUseCase: CambiarEstadoViajeUseCase;

  beforeEach(() => {
    tripRepo = new InMemoryTripRepository([]);
    reglaRepo = new InMemoryReglaItinerarioRepository();
    rutaRepo = new InMemoryRutaRepository();
    puertoRepo = new InMemoryPuertoRepository();
    embarcacionRepo = new InMemoryEmbarcacionRepository();

    generarViajesUseCase = new GenerarViajesDiaUseCase(
      tripRepo,
      reglaRepo,
      rutaRepo,
      puertoRepo,
      embarcacionRepo,
    );
    consultarViajesUseCase = new ConsultarViajesPorFechaUseCase(tripRepo);
    inicializarViajesUseCase = new InicializarViajesFechaUseCase(generarViajesUseCase);
    cambiarEstadoUseCase = new CambiarEstadoViajeUseCase(tripRepo);
  });

  describe('Escenario 1: Inicialización manual de viajes desde la pantalla administrativa', () => {
    it('Given una fecha "2026-10-15" (Jueves) sin viajes generados aún, When el administrador presiona el botón "Inicializar Viajes del Día", Then el sistema evalúa las reglas, genera los viajes en base de datos y los retorna listos para visualización', async () => {
      // Given: 2026-10-15 es jueves (día 4 de la semana)
      const fecha = '2026-10-15';
      const antes = await consultarViajesUseCase.execute(fecha);
      expect(antes.length).toBe(0);

      // When
      const resultado = await inicializarViajesUseCase.execute(fecha);

      // Then
      expect(resultado.length).toBeGreaterThan(0);
      expect(resultado[0].fecha).toBe(fecha);
      expect(resultado[0].estado).toBe('PROGRAMADO');
      expect(resultado[0].capacidadMaxima).toBeGreaterThan(0);
      expect(resultado[0].boletosVendidos).toBe(0);
      expect(resultado[0].puestosDisponibles).toBe(resultado[0].capacidadMaxima);
      expect(resultado[0].porcentajeOcupacion).toBe(0);

      // Idempotencia: segunda llamada no duplica
      const segundaVez = await inicializarViajesUseCase.execute(fecha);
      expect(segundaVez.length).toBe(resultado.length);
    });
  });

  describe('Escenario 2: Cambio de estado a En Embarque', () => {
    it('Given un viaje en estado PROGRAMADO, When el operador de muelle cambia el estado a EN_EMBARQUE, Then el viaje actualiza su estado y permite seguir recibiendo pasajeros hasta zarpar', async () => {
      // Given
      const viaje = Trip.create({
        tripId: 'V-TEST-001',
        origin: 'Terminal Marítimo de Guanta',
        destination: 'Puerto Internacional El Guamache',
        departureTime: new Date('2026-10-15T08:00:00'),
        status: TripStatus.SCHEDULED,
        basePrice: 20,
        transportUnit: {
          id: 'EMB-01',
          unitName: 'Gran Cacique Express I',
          plateNumber: 'ARSH-PE-001',
          model: 'Lancha de Pasajeros',
          totalCapacity: 50,
        },
        soldSeats: 10,
        rutaId: 'RUT-01',
      });
      await tripRepo.save(viaje);

      // When
      const actualizado = await cambiarEstadoUseCase.execute('V-TEST-001', {
        nuevoEstado: 'EN_EMBARQUE',
      });

      // Then
      expect(actualizado.estado).toBe('EN_EMBARQUE');
      expect(actualizado.boletosVendidos).toBe(10);
      expect(actualizado.porcentajeOcupacion).toBe(20);

      const viajeEnRepo = await tripRepo.findById('V-TEST-001');
      expect(viajeEnRepo?.getStatus()).toBe(TripStatus.BOARDING);
      expect(viajeEnRepo?.canAcceptSales()).toBe(true);
    });
  });

  describe('Escenario 3: Bloqueo de ventas al cambiar a En Tránsito', () => {
    it('Given un viaje en estado EN_EMBARQUE, When el viaje pasa a EN_TRANSITO, Then el sistema deshabilita la venta de nuevos boletos para este viaje en taquilla', async () => {
      // Given
      const viaje = Trip.create({
        tripId: 'V-TEST-002',
        origin: 'Terminal Marítimo de Guanta',
        destination: 'Puerto Internacional El Guamache',
        departureTime: new Date('2026-10-15T08:00:00'),
        status: TripStatus.BOARDING,
        basePrice: 20,
        transportUnit: {
          id: 'EMB-01',
          unitName: 'Gran Cacique Express I',
          plateNumber: 'ARSH-PE-001',
          model: 'Lancha de Pasajeros',
          totalCapacity: 50,
        },
        soldSeats: 45,
        rutaId: 'RUT-01',
      });
      await tripRepo.save(viaje);

      // When
      const actualizado = await cambiarEstadoUseCase.execute('V-TEST-002', {
        nuevoEstado: 'EN_TRANSITO',
      });

      // Then
      expect(actualizado.estado).toBe('EN_TRANSITO');
      const viajeEnRepo = await tripRepo.findById('V-TEST-002');
      expect(viajeEnRepo?.getStatus()).toBe(TripStatus.DEPARTED);
      expect(viajeEnRepo?.canAcceptSales()).toBe(false);
      expect(() => viajeEnRepo?.validateForSale()).toThrow(
        TripNotAvailableForSaleException,
      );
    });
  });

  describe('Invariantes y transiciones del ciclo de vida marítimo', () => {
    it('Permite completar el ciclo hasta FINALIZADO desde EN_TRANSITO', async () => {
      const viaje = Trip.create({
        tripId: 'V-CICLO-01',
        origin: 'Guanta',
        destination: 'El Guamache',
        departureTime: new Date('2026-10-15T08:00:00'),
        status: TripStatus.DEPARTED,
        basePrice: 20,
        transportUnit: {
          id: 'EMB-01',
          unitName: 'Gran Cacique Express I',
          plateNumber: 'ARSH-PE-001',
          model: 'Lancha',
          totalCapacity: 50,
        },
      });
      await tripRepo.save(viaje);

      const finalizado = await cambiarEstadoUseCase.execute('V-CICLO-01', {
        nuevoEstado: 'FINALIZADO',
      });
      expect(finalizado.estado).toBe('FINALIZADO');
    });

    it('Rechaza intentar reabrir embarque en un viaje FINALIZADO o CANCELADO', async () => {
      const viajeFinalizado = Trip.create({
        tripId: 'V-FIN-01',
        origin: 'Guanta',
        destination: 'El Guamache',
        departureTime: new Date('2026-10-15T08:00:00'),
        status: TripStatus.FINALIZED,
        basePrice: 20,
        transportUnit: {
          id: 'EMB-01',
          unitName: 'Gran Cacique Express I',
          plateNumber: 'ARSH-PE-001',
          model: 'Lancha',
          totalCapacity: 50,
        },
      });
      await tripRepo.save(viajeFinalizado);

      await expect(
        cambiarEstadoUseCase.execute('V-FIN-01', { nuevoEstado: 'EN_EMBARQUE' }),
      ).rejects.toThrow(InvalidTripStatusTransitionException);
    });

    it('Lanza EntityNotFoundException si se intenta cambiar estado a un viaje inexistente', async () => {
      await expect(
        cambiarEstadoUseCase.execute('V-INEXISTENTE', { nuevoEstado: 'EN_EMBARQUE' }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});
