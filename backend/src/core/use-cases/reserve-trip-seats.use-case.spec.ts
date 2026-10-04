import { describe, it, expect } from 'vitest';
import { ReserveTripSeatsUseCase } from '@core/use-cases/reserve-trip-seats.use-case.js';

describe('ReserveTripSeatsUseCase Unit Tests', () => {
  const useCase = new ReserveTripSeatsUseCase();

  it('debe ejecutar la reserva de asientos a través del puerto de entrada', () => {
    const result = useCase.execute({
      tripCapacityProps: {
        tripId: 'TRIP-USE-CASE-1',
        transportUnit: {
          id: 'u-1',
          unitName: 'Unidad 04 - El Llanero Express',
          plateNumber: 'ABC-123',
          model: 'Yutong 2022',
          totalCapacity: 32,
        },
        soldSeats: 10,
      },
      seatsToReserve: 2,
    });

    expect(result.soldSeats).toBe(12);
    expect(result.availableSeats).toBe(20);
    expect(result.transportUnit.unitName).toBe('Unidad 04 - El Llanero Express');
  });
});
