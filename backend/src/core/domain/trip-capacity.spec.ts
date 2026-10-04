import { describe, it, expect } from 'vitest';
import { TripCapacity } from '@core/domain/trip-capacity.js';
import { TransportUnitProps } from '@core/domain/transport-unit.js';
import { CapacityExceededException } from '@core/domain/exceptions/capacity-exceeded.exception.js';
import { InvalidTripCapacityException } from '@core/domain/exceptions/invalid-trip-capacity.exception.js';

describe('SPEC-003: BDD Acceptance Scenarios (TripCapacity)', () => {
  const defaultUnit: TransportUnitProps = {
    id: 'unit-01',
    unitName: 'Unidad 04 - El Llanero Express',
    plateNumber: 'A12B34C',
    model: 'Marcopolo G7',
    totalCapacity: 30,
  };

  describe('Escenario 1: Venta exitosa dentro de la capacidad disponible', () => {
    it('Given un viaje con autobús de capacidad de 30 asientos y 20 vendidos, When se compran 3 boletos, Then la solicitud es aprobada y quedan 7 asientos disponibles', () => {
      const trip = TripCapacity.create({
        tripId: 'TRIP-101',
        transportUnit: defaultUnit,
        soldSeats: 20,
      });

      const snapshot = trip.reserveSeats(3);

      expect(snapshot.soldSeats).toBe(23);
      expect(snapshot.availableSeats).toBe(7);
      expect(snapshot.isFull).toBe(false);
      expect(snapshot.transportUnit.unitName).toBe('Unidad 04 - El Llanero Express');
    });
  });

  describe('Escenario 2: Intento de compra que excede el aforo disponible', () => {
    it('Given un viaje con capacidad de 20 asientos y 18 vendidos, When se intentan comprar 3 boletos, Then arroja CapacityExceededException y soldSeats se mantiene en 18', () => {
      const smallUnit: TransportUnitProps = {
        ...defaultUnit,
        totalCapacity: 20,
      };

      const trip = TripCapacity.create({
        tripId: 'TRIP-102',
        transportUnit: smallUnit,
        soldSeats: 18,
      });

      expect(() => trip.reserveSeats(3)).toThrow(CapacityExceededException);
      expect(trip.getSnapshot().soldSeats).toBe(18);
      expect(trip.getSnapshot().availableSeats).toBe(2);
    });
  });

  describe('Escenario 3: Venta hasta agotar exactamente la capacidad', () => {
    it('Given un viaje con 4 asientos disponibles de 10 totales, When se compran 4 boletos, Then los asientos disponibles quedan en 0 e isFull pasa a true', () => {
      const trip = TripCapacity.create({
        tripId: 'TRIP-103',
        transportUnit: { ...defaultUnit, totalCapacity: 10 },
        soldSeats: 6,
      });

      const snapshot = trip.reserveSeats(4);

      expect(snapshot.soldSeats).toBe(10);
      expect(snapshot.availableSeats).toBe(0);
      expect(snapshot.isFull).toBe(true);
    });
  });

  describe('Escenario 4: Intento de compra en un viaje agotado (Lleno)', () => {
    it('Given un viaje con 0 asientos disponibles (isFull = true), When se intenta comprar 1 boleto, Then arroja CapacityExceededException', () => {
      const trip = TripCapacity.create({
        tripId: 'TRIP-104',
        transportUnit: { ...defaultUnit, totalCapacity: 15 },
        soldSeats: 15,
      });

      expect(trip.getSnapshot().isFull).toBe(true);
      expect(() => trip.reserveSeats(1)).toThrow(CapacityExceededException);
    });
  });

  describe('Invariantes del Dominio', () => {
    it('debe lanzar InvalidTripCapacityException si la capacidad total de la unidad es menor o igual a cero', () => {
      expect(() =>
        TripCapacity.create({
          tripId: 'TRIP-ERR',
          transportUnit: { ...defaultUnit, totalCapacity: 0 },
          soldSeats: 0,
        }),
      ).toThrow(InvalidTripCapacityException);
    });

    it('debe lanzar InvalidTripCapacityException si los asientos vendidos iniciales superan la capacidad total', () => {
      expect(() =>
        TripCapacity.create({
          tripId: 'TRIP-ERR-2',
          transportUnit: { ...defaultUnit, totalCapacity: 20 },
          soldSeats: 25,
        }),
      ).toThrow(InvalidTripCapacityException);
    });
  });
});
