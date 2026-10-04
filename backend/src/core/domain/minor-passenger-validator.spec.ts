import { describe, it, expect } from 'vitest';
import { MinorPassengerValidator } from '@core/domain/minor-passenger-validator.js';
import { MissingTravelAuthorizationException } from '@core/domain/exceptions/missing-travel-authorization.exception.js';
import { MissingRepresentativeDocumentException } from '@core/domain/exceptions/missing-representative-document.exception.js';
import { InvalidRepresentativeDocumentException } from '@core/domain/exceptions/invalid-representative-document.exception.js';

describe('SPEC-002: BDD Acceptance Scenarios (MinorPassengerValidator)', () => {
  const referenceDate = new Date('2026-09-13T00:00:00.000Z');
  const validator = new MinorPassengerValidator();

  describe('Escenario 1: Menor que viaja con su representante legal', () => {
    it('Given un viajero de 10 años (2016-09-13) con representante V-15890123, Then es validado exitosamente con representante asociado', () => {
      const result = validator.validate(
        {
          birthDate: '2016-09-13',
          isTravelingWithRepresentative: true,
          representativeDocumentId: 'V-15890123',
        },
        referenceDate,
      );

      expect(result.isValid).toBe(true);
      expect(result.isMinor).toBe(true);
      expect(result.calculatedAge).toBe(10);
      expect(result.requiresAuthorizationDoc).toBe(false);
      expect(result.authorizationVerified).toBe(false);
      expect(result.representativeDocumentId).toBe('V-15890123');
    });
  });

  describe('Escenario 2: Menor con representante pero sin cédula de este', () => {
    it('Given un viajero de 7 años (2019-09-13) con representante pero cédula vacía, Then arroja MissingRepresentativeDocumentException', () => {
      expect(() =>
        validator.validate(
          {
            birthDate: '2019-09-13',
            isTravelingWithRepresentative: true,
            representativeDocumentId: '   ',
          },
          referenceDate,
        ),
      ).toThrow(MissingRepresentativeDocumentException);
    });
  });

  describe('Escenario 3: Menor que viaja solo con autorización validada por cajera', () => {
    it('Given un adolescente de 15 años (2011-09-13) solo con autorización validada (hasTravelAuthorizationPresented = true), Then es validado exitosamente', () => {
      const result = validator.validate(
        {
          birthDate: '2011-09-13',
          isTravelingWithRepresentative: false,
          hasTravelAuthorizationPresented: true,
        },
        referenceDate,
      );

      expect(result.isValid).toBe(true);
      expect(result.isMinor).toBe(true);
      expect(result.calculatedAge).toBe(15);
      expect(result.requiresAuthorizationDoc).toBe(true);
      expect(result.authorizationVerified).toBe(true);
    });
  });

  describe('Escenario 4: Menor que viaja solo SIN autorización', () => {
    it('Given un adolescente de 15 años (2011-09-13) solo sin autorización (hasTravelAuthorizationPresented = false), Then arroja MissingTravelAuthorizationException', () => {
      expect(() =>
        validator.validate(
          {
            birthDate: '2011-09-13',
            isTravelingWithRepresentative: false,
            hasTravelAuthorizationPresented: false,
          },
          referenceDate,
        ),
      ).toThrow(MissingTravelAuthorizationException);
    });
  });

  describe('Escenario 5: Viajero mayor de edad', () => {
    it('Given un viajero de 25 años (2001-09-13), Then isMinor es false y se valida sin exigir permisos', () => {
      const result = validator.validate(
        {
          birthDate: '2001-09-13',
          passengerDocumentId: 'V-25252525',
          isTravelingWithRepresentative: false,
        },
        referenceDate,
      );

      expect(result.isValid).toBe(true);
      expect(result.isMinor).toBe(false);
      expect(result.calculatedAge).toBe(25);
      expect(result.requiresAuthorizationDoc).toBe(false);
      expect(result.authorizationVerified).toBe(false);
    });
  });

  describe('Escenario 6: Cédula de representante igual a la del menor', () => {
    it('Given un menor de 16 años (2010-09-13) con cédula V-30111222 e idéntica cédula de representante, Then arroja InvalidRepresentativeDocumentException', () => {
      expect(() =>
        validator.validate(
          {
            birthDate: '2010-09-13',
            passengerDocumentId: 'V-30111222',
            isTravelingWithRepresentative: true,
            representativeDocumentId: 'V-30111222',
          },
          referenceDate,
        ),
      ).toThrow(InvalidRepresentativeDocumentException);
    });
  });
});
