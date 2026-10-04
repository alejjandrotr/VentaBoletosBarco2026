import { describe, it, expect } from 'vitest';
import { FareCalculator } from '@core/domain/fare-calculator.js';
import { PassengerCategory } from '@core/domain/passenger-category.enum.js';
import { InvalidPassengerBirthDateException } from '@core/domain/exceptions/invalid-passenger-birthdate.exception.js';
import { InvalidBasePriceException } from '@core/domain/exceptions/invalid-base-price.exception.js';

describe('SPEC-001: BDD Acceptance Scenarios (FareCalculator)', () => {
  const referenceDate = new Date('2026-09-13T00:00:00.000Z');
  const calculator = new FareCalculator();

  describe('Escenario 1: Cálculo de tarifa para viajero regular', () => {
    it('Given un viaje con precio base de 10.00 USD, When se evalúa un viajero de 30 años (1996-05-15) con cédula V-12345678, Then su categoría es REGULAR, descuento 0% y precio final 10.00 USD', () => {
      const result = calculator.calculate({
        basePrice: 10.0,
        evaluationDate: referenceDate,
        passengers: [
          {
            documentId: 'V-12345678',
            fullName: 'Viajero Regular',
            birthDate: '1996-05-15',
          },
        ],
      });

      expect(result.items).toHaveLength(1);
      const item = result.items[0];
      expect(item.calculatedAge).toBe(30);
      expect(item.category).toBe(PassengerCategory.REGULAR);
      expect(item.discountPercentage).toBe(0);
      expect(item.discountAmount).toBe(0.0);
      expect(item.finalPrice).toBe(10.0);

      expect(result.totalBasePrice).toBe(10.0);
      expect(result.totalDiscount).toBe(0.0);
      expect(result.totalToPay).toBe(10.0);
      expect(result.passengerCount).toBe(1);
    });
  });

  describe('Escenario 2: Cálculo con descuento de tercera edad (50%)', () => {
    it('Given un viaje con precio base de 10.00 USD, When se evalúa un viajero de 65 años (1961-02-10) con cédula V-3456789, Then su categoría es TERCERA_EDAD, descuento 50% (5.00 USD) y precio final 5.00 USD', () => {
      const result = calculator.calculate({
        basePrice: 10.0,
        evaluationDate: referenceDate,
        passengers: [
          {
            documentId: 'V-3456789',
            fullName: 'Adulto Mayor',
            birthDate: '1961-02-10',
          },
        ],
      });

      expect(result.items).toHaveLength(1);
      const item = result.items[0];
      expect(item.calculatedAge).toBe(65);
      expect(item.category).toBe(PassengerCategory.TERCERA_EDAD);
      expect(item.discountPercentage).toBe(50);
      expect(item.discountAmount).toBe(5.0);
      expect(item.finalPrice).toBe(5.0);

      expect(result.totalBasePrice).toBe(10.0);
      expect(result.totalDiscount).toBe(5.0);
      expect(result.totalToPay).toBe(5.0);
    });
  });

  describe('Escenario 3: Cálculo para infante (menor a 4 años)', () => {
    it('Given un viaje con precio base de 10.00 USD, When se evalúa un niño de 2 años (2024-08-01), Then su categoría es INFANTE y precio final es 0.00 USD (exonerado)', () => {
      const result = calculator.calculate({
        basePrice: 10.0,
        evaluationDate: referenceDate,
        passengers: [
          {
            documentId: '',
            fullName: 'Infante Viajero',
            birthDate: '2024-08-01',
          },
        ],
      });

      expect(result.items).toHaveLength(1);
      const item = result.items[0];
      expect(item.calculatedAge).toBe(2);
      expect(item.category).toBe(PassengerCategory.INFANTE);
      expect(item.discountPercentage).toBe(100);
      expect(item.discountAmount).toBe(10.0);
      expect(item.finalPrice).toBe(0.0);

      expect(result.totalBasePrice).toBe(10.0);
      expect(result.totalDiscount).toBe(10.0);
      expect(result.totalToPay).toBe(0.0);
    });
  });

  describe('Escenario 4: Cálculo de grupo mixto en taquilla', () => {
    it('Given un viaje con precio base de 20.00 USD, When se procesa un grupo de 3 (Regular 40 años, Tercera Edad 68 años, Infante 2 años), Then monto base total es 60.00 USD, total descuentos 30.00 USD y total a pagar 30.00 USD', () => {
      const result = calculator.calculate({
        basePrice: 20.0,
        evaluationDate: referenceDate,
        passengers: [
          {
            documentId: 'V-40404040',
            fullName: 'Regular 40yo',
            birthDate: '1986-01-10',
          },
          {
            documentId: 'V-68686868',
            fullName: 'Senior 68yo',
            birthDate: '1958-05-20',
          },
          {
            documentId: '',
            fullName: 'Infante 2yo',
            birthDate: '2024-03-15',
          },
        ],
      });

      expect(result.passengerCount).toBe(3);
      expect(result.totalBasePrice).toBe(60.0);
      expect(result.totalDiscount).toBe(30.0); // 0 (regular) + 10.0 (senior) + 20.0 (infante)
      expect(result.totalToPay).toBe(30.0);

      expect(result.items[0].finalPrice).toBe(20.0);
      expect(result.items[1].finalPrice).toBe(10.0);
      expect(result.items[2].finalPrice).toBe(0.0);
    });
  });

  describe('Escenario 5: Validación de fecha de nacimiento o edad inválida', () => {
    it('Given un viajero con birthDate futura o edad > 120, When se intenta calcular la tarifa, Then arroja InvalidPassengerBirthDateException', () => {
      expect(() =>
        calculator.calculate({
          basePrice: 10.0,
          evaluationDate: referenceDate,
          passengers: [
            {
              documentId: 'V-100',
              fullName: 'Futuro',
              birthDate: '2030-01-01',
            },
          ],
        }),
      ).toThrow(InvalidPassengerBirthDateException);
    });
  });

  describe('Invariante de precio base', () => {
    it('debe lanzar InvalidBasePriceException si el precio base es menor o igual a cero', () => {
      expect(() =>
        calculator.calculate({
          basePrice: 0,
          evaluationDate: referenceDate,
          passengers: [
            {
              documentId: 'V-123',
              fullName: 'Test',
              birthDate: '1990-01-01',
            },
          ],
        }),
      ).toThrow(InvalidBasePriceException);
    });
  });
});
