import { describe, it, expect } from 'vitest';
import { Embarcacion } from './embarcacion.js';
import { InvalidTripCapacityException } from './exceptions/invalid-trip-capacity.exception.js';
import { InvalidPortException } from './exceptions/invalid-port.exception.js';

describe('SPEC-007: Entidad de Dominio Embarcacion', () => {
  it('Dada una embarcación con código y capacidad válida, cuando se crea, se inicializa activa por defecto', () => {
    const lancha = Embarcacion.create({
      id: 'EMB-01',
      codigo: 'ARSH-PE-001',
      nombre: 'Gran Cacique Express I',
      capacidadFisica: 50,
    });

    expect(lancha.getId()).toBe('EMB-01');
    expect(lancha.getCodigo()).toBe('ARSH-PE-001');
    expect(lancha.getNombre()).toBe('Gran Cacique Express I');
    expect(lancha.getCapacidadFisica()).toBe(50);
    expect(lancha.isActivo()).toBe(true);
  });

  it('Dada una embarcación sin código o nombre, cuando se intenta crear, lanza InvalidPortException', () => {
    expect(() =>
      Embarcacion.create({
        id: 'EMB-01',
        codigo: '',
        nombre: 'Lancha',
        capacidadFisica: 40,
      }),
    ).toThrow(InvalidPortException);
  });

  it('Dada una embarcación con capacidad cero o negativa, cuando se intenta crear, lanza InvalidTripCapacityException', () => {
    expect(() =>
      Embarcacion.create({
        id: 'EMB-02',
        codigo: 'ARSH-PE-002',
        nombre: 'Lancha Rápida',
        capacidadFisica: 0,
      }),
    ).toThrow(InvalidTripCapacityException);

    expect(() =>
      Embarcacion.create({
        id: 'EMB-02',
        codigo: 'ARSH-PE-002',
        nombre: 'Lancha Rápida',
        capacidadFisica: -5,
      }),
    ).toThrow(InvalidTripCapacityException);
  });
});
