import { describe, it, expect } from 'vitest';
import { CalculateFareUseCase } from '@core/use-cases/calculate-fare.use-case.js';
import { PassengerCategory } from '@core/domain/passenger-category.enum.js';

describe('CalculateFareUseCase Unit Tests', () => {
  const useCase = new CalculateFareUseCase();
  const evaluationDate = new Date('2026-09-13T00:00:00.000Z');

  it('debe ejecutar el cálculo de tarifa a través del puerto de entrada correctamente', () => {
    const result = useCase.execute({
      basePrice: 15.0,
      evaluationDate,
      passengers: [
        {
          documentId: 'V-11111111',
          fullName: 'Pasajero Regular',
          birthDate: '1995-03-20',
        },
      ],
    });

    expect(result.passengerCount).toBe(1);
    expect(result.totalToPay).toBe(15.0);
    expect(result.items[0].category).toBe(PassengerCategory.REGULAR);
  });
});
