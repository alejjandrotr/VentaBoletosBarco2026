import { describe, it, expect, beforeEach } from 'vitest';
import { GetActiveTripUseCase } from '@core/use-cases/get-active-trip.use-case.js';
import { InMemoryTripRepository } from '@adapters/outbound/persistence/in-memory-trip.repository.js';
import { Trip, TripStatus } from '@core/domain/trip.js';

describe('SPEC-004: GetActiveTripUseCase Unit Tests', () => {
  let tripRepository: InMemoryTripRepository;
  let useCase: GetActiveTripUseCase;

  beforeEach(() => {
    tripRepository = new InMemoryTripRepository();
    useCase = new GetActiveTripUseCase(tripRepository);
  });

  it('Escenario 1: debe preseleccionar automáticamente el viaje más próximo en embarque/programado', async () => {
    const trip1400 = Trip.create({
      tripId: 'TRIP-1400',
      origin: 'Caracas',
      destination: 'Valencia',
      departureTime: new Date('2026-09-13T14:00:00Z'),
      status: TripStatus.BOARDING,
      basePrice: 10.0,
      transportUnit: {
        id: 'U-01',
        unitName: 'Unidad 04 - El Llanero Express',
        plateNumber: 'A12B34C',
        model: 'Marcopolo',
        totalCapacity: 30,
      },
      soldSeats: 20,
    });

    const trip1500 = Trip.create({
      tripId: 'TRIP-1500',
      origin: 'Caracas',
      destination: 'Valencia',
      departureTime: new Date('2026-09-13T15:00:00Z'),
      status: TripStatus.SCHEDULED,
      basePrice: 10.0,
      transportUnit: {
        id: 'U-02',
        unitName: 'Unidad 08',
        plateNumber: 'X99Y88Z',
        model: 'Yutong',
        totalCapacity: 32,
      },
      soldSeats: 0,
    });

    await tripRepository.save(trip1400);
    await tripRepository.save(trip1500);

    const activeTrip = await useCase.execute();

    expect(activeTrip).not.toBeNull();
    expect(activeTrip?.tripId).toBe('TRIP-1400');
    expect(activeTrip?.status).toBe(TripStatus.BOARDING);
    expect(activeTrip?.availableSeats).toBe(10);
    expect(activeTrip?.unitName).toBe('Unidad 04 - El Llanero Express');
  });

  it('debe retornar null cuando no existen viajes activos o disponibles', async () => {
    const activeTrip = await useCase.execute();
    expect(activeTrip).toBeNull();
  });
});
