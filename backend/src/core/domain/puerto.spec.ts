import { describe, it, expect } from 'vitest';
import { Puerto } from './puerto.js';
import { InvalidPortException } from './exceptions/invalid-port.exception.js';

describe('SPEC-007: Entidad de Dominio Puerto', () => {
  it('Dado un puerto con datos válidos, cuando se crea la entidad, entonces se inicializa correctamente', () => {
    const puerto = Puerto.create({
      id: 'PTO-01',
      nombre: 'Terminal Marítimo de Guanta',
      ubicacionTexto: 'Guanta, Anzoátegui',
      latitud: 10.241,
      longitud: -64.588,
    });

    expect(puerto.getId()).toBe('PTO-01');
    expect(puerto.getNombre()).toBe('Terminal Marítimo de Guanta');
    expect(puerto.getUbicacionTexto()).toBe('Guanta, Anzoátegui');
    expect(puerto.getLatitud()).toBe(10.241);
    expect(puerto.getLongitud()).toBe(-64.588);
  });

  it('Dado un puerto con ID o nombre vacío, cuando se intenta crear, entonces lanza InvalidPortException', () => {
    expect(() =>
      Puerto.create({
        id: '  ',
        nombre: 'Guanta',
        ubicacionTexto: 'Guanta',
        latitud: 10.241,
        longitud: -64.588,
      }),
    ).toThrow(InvalidPortException);

    expect(() =>
      Puerto.create({
        id: 'PTO-01',
        nombre: '   ',
        ubicacionTexto: 'Guanta',
        latitud: 10.241,
        longitud: -64.588,
      }),
    ).toThrow(InvalidPortException);
  });

  it('Dado un puerto con coordenadas geográficas fuera de rango, entonces lanza InvalidPortException', () => {
    expect(() =>
      Puerto.create({
        id: 'PTO-01',
        nombre: 'Guanta',
        ubicacionTexto: 'Guanta',
        latitud: 95.0, // > 90
        longitud: -64.588,
      }),
    ).toThrow(InvalidPortException);

    expect(() =>
      Puerto.create({
        id: 'PTO-01',
        nombre: 'Guanta',
        ubicacionTexto: 'Guanta',
        latitud: 10.0,
        longitud: -190.0, // < -180
      }),
    ).toThrow(InvalidPortException);
  });
});
