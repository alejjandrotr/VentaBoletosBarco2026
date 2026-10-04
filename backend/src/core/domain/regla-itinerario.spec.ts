import { describe, it, expect } from 'vitest';
import { ReglaItinerario, TipoAplicacionItinerario } from './regla-itinerario.js';
import { InvalidItineraryRuleException } from './exceptions/invalid-itinerary-rule.exception.js';

describe('SPEC-007: Entidad de Dominio ReglaItinerario', () => {
  it('Escenario 1: Creación y validación de regla regular por días de semana', () => {
    const regla = ReglaItinerario.create({
      id: 'REG-01',
      nombre: 'Salida Mañana L-V',
      tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
      diasSemana: [1, 2, 3, 4, 5],
      rutaId: 'RUT-01',
      horaPartida: '08:00',
      embarcacionDefaultId: 'EMB-01',
    });

    expect(regla.getId()).toBe('REG-01');
    expect(regla.getTipoAplicacion()).toBe(TipoAplicacionItinerario.DIAS_SEMANA);
    expect(regla.getDiasSemana()).toEqual([1, 2, 3, 4, 5]);
    expect(regla.getHoraPartida()).toBe('08:00');
    expect(regla.isActivo()).toBe(true);
    expect(regla.aplicaEnDiaSemana(1)).toBe(true); // Lunes
    expect(regla.aplicaEnDiaSemana(0)).toBe(false); // Domingo
  });

  it('Escenario 2: Creación de regla especial para fecha específica (Feriado)', () => {
    const regla = ReglaItinerario.create({
      id: 'REG-FERIADO-01',
      nombre: 'Salida Especial Navidad',
      tipoAplicacion: TipoAplicacionItinerario.FECHA_ESPECIFICA,
      fechaEspecifica: '2026-12-25',
      rutaId: 'RUT-01',
      horaPartida: '10:00',
      embarcacionDefaultId: 'EMB-01',
    });

    expect(regla.getId()).toBe('REG-FERIADO-01');
    expect(regla.getTipoAplicacion()).toBe(TipoAplicacionItinerario.FECHA_ESPECIFICA);
    expect(regla.getFechaEspecifica()).toBe('2026-12-25');
    expect(regla.aplicaEnFecha('2026-12-25')).toBe(true);
    expect(regla.aplicaEnFecha('2026-12-26')).toBe(false);
  });

  it('Escenario 3: Rechazo de regla con parámetros inválidos', () => {
    // DIAS_SEMANA sin arreglo de días o días vacíos
    expect(() =>
      ReglaItinerario.create({
        id: 'REG-INV-1',
        nombre: 'Regla inválida',
        tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
        diasSemana: [],
        rutaId: 'RUT-01',
        horaPartida: '08:00',
        embarcacionDefaultId: 'EMB-01',
      }),
    ).toThrow(InvalidItineraryRuleException);

    // DIAS_SEMANA con días fuera de rango [0..6]
    expect(() =>
      ReglaItinerario.create({
        id: 'REG-INV-2',
        nombre: 'Regla inválida',
        tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
        diasSemana: [1, 7],
        rutaId: 'RUT-01',
        horaPartida: '08:00',
        embarcacionDefaultId: 'EMB-01',
      }),
    ).toThrow(InvalidItineraryRuleException);

    // FECHA_ESPECIFICA sin fechaEspecifica
    expect(() =>
      ReglaItinerario.create({
        id: 'REG-INV-3',
        nombre: 'Regla feriado inválida',
        tipoAplicacion: TipoAplicacionItinerario.FECHA_ESPECIFICA,
        rutaId: 'RUT-01',
        horaPartida: '10:00',
        embarcacionDefaultId: 'EMB-01',
      }),
    ).toThrow(InvalidItineraryRuleException);

    // Hora de partida inválida
    expect(() =>
      ReglaItinerario.create({
        id: 'REG-INV-4',
        nombre: 'Regla hora inválida',
        tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
        diasSemana: [1],
        rutaId: 'RUT-01',
        horaPartida: '25:70',
        embarcacionDefaultId: 'EMB-01',
      }),
    ).toThrow(InvalidItineraryRuleException);
  });
});
