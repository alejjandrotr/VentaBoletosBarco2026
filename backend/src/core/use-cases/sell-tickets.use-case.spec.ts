import { describe, it, expect, beforeEach } from 'vitest';
import { SellTicketsUseCase } from '@core/use-cases/sell-tickets.use-case.js';
import { InMemoryTripRepository } from '@adapters/outbound/persistence/in-memory-trip.repository.js';
import { Trip, TripStatus } from '@core/domain/trip.js';
import { TripNotAvailableForSaleException } from '@core/domain/exceptions/trip-not-available-for-sale.exception.js';
import { MissingTravelAuthorizationException } from '@core/domain/exceptions/missing-travel-authorization.exception.js';
import { CapacityExceededException } from '@core/domain/exceptions/capacity-exceeded.exception.js';

describe('SPEC-004: BDD Acceptance Scenarios (SellTicketsUseCase)', () => {
  let tripRepository: InMemoryTripRepository;
  let useCase: SellTicketsUseCase;
  const referenceDate = new Date('2026-09-13T00:00:00.000Z');

  beforeEach(() => {
    tripRepository = new InMemoryTripRepository();
    useCase = new SellTicketsUseCase(tripRepository);
  });

  describe('Escenario 2: Procesamiento exitoso de venta completa', () => {
    it('Given un viaje activo a las 14:00 con 10 cupos, When se procesa la venta para 2 pasajeros (Adulto 30 años + Adulto Mayor 65 años), Then se reduce aforo a 8, se generan boletos con tarjeta reusable y total a pagar correcto', async () => {
      const trip = Trip.create({
        tripId: 'TRIP-1400',
        origin: 'Caracas',
        destination: 'Maracay',
        departureTime: new Date('2026-09-13T14:00:00Z'),
        status: TripStatus.BOARDING,
        basePrice: 10.0,
        transportUnit: {
          id: 'U-01',
          unitName: 'Unidad 04',
          plateNumber: 'A12B34C',
          model: 'Marcopolo',
          totalCapacity: 30,
        },
        soldSeats: 20,
      });

      await tripRepository.save(trip);

      const result = await useCase.execute(
        {
          tripId: 'TRIP-1400',
          buyerDocumentId: 'V-12345678',
          buyerFullName: 'Carlos Comprador',
          buyerEmail: 'cliente@test.com',
          passengers: [
            {
              documentId: 'V-12345678',
              fullName: 'Carlos Comprador',
              birthDate: '1996-05-15', // 30 años (Regular = 10.00)
              isTravelingWithRepresentative: false,
            },
            {
              documentId: 'V-98765432',
              fullName: 'Abuela Compradora',
              birthDate: '1961-02-10', // 65 años (Senior = 5.00)
              isTravelingWithRepresentative: false,
            },
          ],
        },
        referenceDate,
      );

      expect(result.status).toBe('CONFIRMED');
      expect(result.issuedTickets).toHaveLength(2);
      expect(result.totalAmount).toBe(15.0); // 10.00 + 5.00

      expect(result.issuedTickets[0].reusableCardToken).toBeDefined();
      expect(result.issuedTickets[1].reusableCardToken).toBeDefined();

      const updatedTrip = await tripRepository.findById('TRIP-1400');
      expect(updatedTrip?.getAvailableSeats()).toBe(8);
    });
  });

  describe('Escenario 3: Rechazo de venta por viaje cerrado o ya partido', () => {
    it('Given un viaje cuya hora de salida pasó y su estado cambió a DEPARTED, When se intenta emitir un boleto, Then arroja TripNotAvailableForSaleException', async () => {
      const trip = Trip.create({
        tripId: 'TRIP-DEPARTED',
        origin: 'Caracas',
        destination: 'Maracay',
        departureTime: new Date('2026-09-13T10:00:00Z'),
        status: TripStatus.DEPARTED,
        basePrice: 10.0,
        transportUnit: {
          id: 'U-01',
          unitName: 'Unidad 04',
          plateNumber: 'A12B34C',
          model: 'Marcopolo',
          totalCapacity: 30,
        },
        soldSeats: 10,
      });

      await tripRepository.save(trip);

      await expect(
        useCase.execute(
          {
            tripId: 'TRIP-DEPARTED',
            buyerDocumentId: 'V-12345678',
            buyerFullName: 'Carlos Comprador',
            buyerEmail: 'cliente@test.com',
            passengers: [
              {
                documentId: 'V-12345678',
                fullName: 'Carlos Comprador',
                birthDate: '1996-05-15',
                isTravelingWithRepresentative: false,
              },
            ],
          },
          referenceDate,
        ),
      ).rejects.toThrow(TripNotAvailableForSaleException);
    });
  });

  describe('Integración con SPEC-002: Rechazo por menor sin autorización', () => {
    it('debe rechazar la orden si un menor viaja solo sin autorización de viaje', async () => {
      const trip = Trip.create({
        tripId: 'TRIP-1400',
        origin: 'Caracas',
        destination: 'Maracay',
        departureTime: new Date('2026-09-13T14:00:00Z'),
        status: TripStatus.BOARDING,
        basePrice: 10.0,
        transportUnit: {
          id: 'U-01',
          unitName: 'Unidad 04',
          plateNumber: 'A12B34C',
          model: 'Marcopolo',
          totalCapacity: 30,
        },
        soldSeats: 0,
      });

      await tripRepository.save(trip);

      await expect(
        useCase.execute(
          {
            tripId: 'TRIP-1400',
            buyerDocumentId: 'V-12345678',
            buyerFullName: 'Padre Ausente',
            buyerEmail: 'padre@test.com',
            passengers: [
              {
                fullName: 'Adolescente Solo',
                birthDate: '2011-09-13', // 15 años
                isTravelingWithRepresentative: false,
                hasTravelAuthorizationPresented: false,
              },
            ],
          },
          referenceDate,
        ),
      ).rejects.toThrow(MissingTravelAuthorizationException);
    });
  });

  describe('Integración con SPEC-003: Rechazo por aforo superado', () => {
    it('debe rechazar la orden si se solicitan más asientos de los disponibles', async () => {
      const trip = Trip.create({
        tripId: 'TRIP-FULL',
        origin: 'Caracas',
        destination: 'Maracay',
        departureTime: new Date('2026-09-13T14:00:00Z'),
        status: TripStatus.BOARDING,
        basePrice: 10.0,
        transportUnit: {
          id: 'U-01',
          unitName: 'Unidad 04',
          plateNumber: 'A12B34C',
          model: 'Marcopolo',
          totalCapacity: 5,
        },
        soldSeats: 4, // Queda 1 disponible
      });

      await tripRepository.save(trip);

      await expect(
        useCase.execute(
          {
            tripId: 'TRIP-FULL',
            buyerDocumentId: 'V-12345678',
            buyerFullName: 'Grupo Familiar',
            buyerEmail: 'familia@test.com',
            passengers: [
              {
                documentId: 'V-11111111',
                fullName: 'Pasajero 1',
                birthDate: '1990-01-01',
                isTravelingWithRepresentative: false,
              },
              {
                documentId: 'V-22222222',
                fullName: 'Pasajero 2',
                birthDate: '1992-02-02',
                isTravelingWithRepresentative: false,
              },
            ],
          },
          referenceDate,
        ),
      ).rejects.toThrow(CapacityExceededException);
    });
  });
});
