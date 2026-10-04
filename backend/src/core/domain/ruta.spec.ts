import { describe, it, expect } from 'vitest';
import { Ruta } from './ruta.js';
import { InvalidRouteException } from './exceptions/invalid-route.exception.js';

describe('SPEC-007: Entidad de Dominio Ruta', () => {
  it('Dada una ruta válida entre dos puertos distintos, cuando se crea, se inicializa con sus propiedades', () => {
    const ruta = Ruta.create({
      id: 'RUT-01',
      origenPuertoId: 'PTO-01',
      destinoPuertoId: 'PTO-02',
      distanciaKm: 85.5,
    });

    expect(ruta.getId()).toBe('RUT-01');
    expect(ruta.getOrigenPuertoId()).toBe('PTO-01');
    expect(ruta.getDestinoPuertoId()).toBe('PTO-02');
    expect(ruta.getDistanciaKm()).toBe(85.5);
  });

  it('Dada una ruta con origen y destino idénticos, cuando se intenta crear, lanza InvalidRouteException', () => {
    expect(() =>
      Ruta.create({
        id: 'RUT-01',
        origenPuertoId: 'PTO-01',
        destinoPuertoId: 'PTO-01',
        distanciaKm: 50,
      }),
    ).toThrow(InvalidRouteException);
  });

  it('Dada una ruta con distancia menor o igual a cero, cuando se intenta crear, lanza InvalidRouteException', () => {
    expect(() =>
      Ruta.create({
        id: 'RUT-01',
        origenPuertoId: 'PTO-01',
        destinoPuertoId: 'PTO-02',
        distanciaKm: 0,
      }),
    ).toThrow(InvalidRouteException);

    expect(() =>
      Ruta.create({
        id: 'RUT-01',
        origenPuertoId: 'PTO-01',
        destinoPuertoId: 'PTO-02',
        distanciaKm: -10,
      }),
    ).toThrow(InvalidRouteException);
  });
});
