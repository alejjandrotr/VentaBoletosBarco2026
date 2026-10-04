import { describe, it, expect } from 'vitest';
import { Passenger } from '@core/domain/passenger.js';
import { PassengerCategory } from '@core/domain/passenger-category.enum.js';
import { InvalidPassengerBirthDateException } from '@core/domain/exceptions/invalid-passenger-birthdate.exception.js';
import { InvalidDocumentIdException } from '@core/domain/exceptions/invalid-document-id.exception.js';

describe('Passenger Entity & Value Objects', () => {
  const referenceDate = new Date('2026-09-13T00:00:00.000Z');

  describe('Cálculo de edad cumplida (birthDate)', () => {
    it('debe calcular correctamente la edad en años cumplidos cuando ya pasó el cumpleaños este año', () => {
      const passenger = Passenger.create(
        {
          documentId: 'V-12345678',
          fullName: 'Juan Pérez',
          birthDate: '1996-05-15',
        },
        referenceDate,
      );

      expect(passenger.getCalculatedAge()).toBe(30);
    });

    it('debe calcular correctamente la edad cuando aún no ha cumplido años este año', () => {
      const passenger = Passenger.create(
        {
          documentId: 'V-12345678',
          fullName: 'María López',
          birthDate: '1996-12-25',
        },
        referenceDate,
      );

      expect(passenger.getCalculatedAge()).toBe(29);
    });

    it('debe calcular 0 años para un infante nacido este año', () => {
      const passenger = Passenger.create(
        {
          documentId: '',
          fullName: 'Bebé Pérez',
          birthDate: '2026-01-10',
        },
        referenceDate,
      );

      expect(passenger.getCalculatedAge()).toBe(0);
    });
  });

  describe('Asignación de Categoría por Edad', () => {
    it('debe asignar categoría INFANTE para niños de 0 a 3 años', () => {
      const passenger = Passenger.create(
        {
          documentId: '',
          fullName: 'Infante Test',
          birthDate: '2024-08-01', // 2 años al 2026-09-13
        },
        referenceDate,
      );

      expect(passenger.getCategory()).toBe(PassengerCategory.INFANTE);
    });

    it('debe asignar categoría MENOR para personas de 4 a 17 años', () => {
      const passenger = Passenger.create(
        {
          documentId: '',
          fullName: 'Menor Test',
          birthDate: '2016-09-13', // 10 años exactos
        },
        referenceDate,
      );

      expect(passenger.getCategory()).toBe(PassengerCategory.MENOR);
    });

    it('debe asignar categoría REGULAR para personas entre 18 y 59 años', () => {
      const passenger = Passenger.create(
        {
          documentId: 'V-99999999',
          fullName: 'Adulto Test',
          birthDate: '1986-01-10', // 40 años
        },
        referenceDate,
      );

      expect(passenger.getCategory()).toBe(PassengerCategory.REGULAR);
    });

    it('debe asignar categoría TERCERA_EDAD para personas de 60 años o más', () => {
      const passenger = Passenger.create(
        {
          documentId: 'V-88888888',
          fullName: 'Adulto Mayor Test',
          birthDate: '1958-05-20', // 68 años
        },
        referenceDate,
      );

      expect(passenger.getCategory()).toBe(PassengerCategory.TERCERA_EDAD);
    });
  });

  describe('Validación de Invariantes del Dominio', () => {
    it('debe lanzar InvalidPassengerBirthDateException para fechas en el futuro', () => {
      expect(() =>
        Passenger.create(
          {
            documentId: 'V-12345678',
            fullName: 'Viajero del Futuro',
            birthDate: '2030-01-01',
          },
          referenceDate,
        ),
      ).toThrow(InvalidPassengerBirthDateException);
    });

    it('debe lanzar InvalidPassengerBirthDateException para fechas que deriven en edad > 120 años', () => {
      expect(() =>
        Passenger.create(
          {
            documentId: 'V-12345678',
            fullName: 'Persona Muy Ancieana',
            birthDate: '1890-01-01',
          },
          referenceDate,
        ),
      ).toThrow(InvalidPassengerBirthDateException);
    });

    it('debe lanzar InvalidPassengerBirthDateException si el formato de la fecha es inválido', () => {
      expect(() =>
        Passenger.create(
          {
            documentId: 'V-12345678',
            fullName: 'Fecha Invalida',
            birthDate: '13-09-1990', // Formato incorrecto
          },
          referenceDate,
        ),
      ).toThrow(InvalidPassengerBirthDateException);
    });

    it('debe lanzar InvalidDocumentIdException si un mayor de edad no proporciona documento de identidad', () => {
      expect(() =>
        Passenger.create(
          {
            documentId: '   ',
            fullName: 'Adulto Sin Cedula',
            birthDate: '1990-05-05',
          },
          referenceDate,
        ),
      ).toThrow(InvalidDocumentIdException);
    });
  });
});
