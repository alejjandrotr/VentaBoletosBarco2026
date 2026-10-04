import { describe, it, expect } from 'vitest';
import { ValidateMinorPassengerUseCase } from '@core/use-cases/validate-minor-passenger.use-case.js';

describe('ValidateMinorPassengerUseCase Unit Tests', () => {
  const useCase = new ValidateMinorPassengerUseCase();
  const evaluationDate = new Date('2026-09-13T00:00:00.000Z');

  it('debe ejecutar la validación de menor de edad a través del puerto de entrada correctamente', () => {
    const result = useCase.execute(
      {
        birthDate: '2016-09-13',
        isTravelingWithRepresentative: true,
        representativeDocumentId: 'V-99988877',
      },
      evaluationDate,
    );

    expect(result.isValid).toBe(true);
    expect(result.isMinor).toBe(true);
    expect(result.representativeDocumentId).toBe('V-99988877');
  });
});
