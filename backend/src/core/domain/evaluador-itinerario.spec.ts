import { describe, it, expect } from 'vitest';
import { ReglaItinerario, TipoAplicacionItinerario } from './regla-itinerario.js';
import { EvaluadorItinerario } from './evaluador-itinerario.js';

describe('SPEC-007: Servicio de Dominio EvaluadorItinerario', () => {
  const reglaRegularViernes = ReglaItinerario.create({
    id: 'REG-VIE-08',
    nombre: 'Viernes Regular 08:00',
    tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
    diasSemana: [5], // Viernes
    rutaId: 'RUT-01',
    horaPartida: '08:00',
    embarcacionDefaultId: 'EMB-01',
  });

  const reglaRegularLunes = ReglaItinerario.create({
    id: 'REG-LUN-09',
    nombre: 'Lunes Regular 09:00',
    tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
    diasSemana: [1], // Lunes
    rutaId: 'RUT-01',
    horaPartida: '09:00',
    embarcacionDefaultId: 'EMB-01',
  });

  const reglaEspecialNavidad = ReglaItinerario.create({
    id: 'REG-NAV-11',
    nombre: 'Especial Navidad 11:00',
    tipoAplicacion: TipoAplicacionItinerario.FECHA_ESPECIFICA,
    fechaEspecifica: '2026-12-25', // 2026-12-25 es Viernes
    rutaId: 'RUT-01',
    horaPartida: '11:00',
    embarcacionDefaultId: 'EMB-02',
  });

  const evaluador = new EvaluadorItinerario();

  it('Escenario 4: Si existe regla especial de FECHA_ESPECIFICA, ignora por completo las reglas de DIAS_SEMANA de ese día', () => {
    // 2026-12-25 es Viernes
    const reglas = [reglaRegularViernes, reglaRegularLunes, reglaEspecialNavidad];

    const aplicables = evaluador.obtenerReglasParaFecha('2026-12-25', reglas);

    expect(aplicables).toHaveLength(1);
    expect(aplicables[0].getId()).toBe('REG-NAV-11');
    expect(aplicables[0].getHoraPartida()).toBe('11:00');
  });

  it('Para una fecha sin reglas especiales, aplica las reglas regulares correspondientes a su día de la semana', () => {
    // 2026-12-18 es Viernes (sin feriado)
    const reglas = [reglaRegularViernes, reglaRegularLunes, reglaEspecialNavidad];

    const aplicables = evaluador.obtenerReglasParaFecha('2026-12-18', reglas);

    expect(aplicables).toHaveLength(1);
    expect(aplicables[0].getId()).toBe('REG-VIE-08');
    expect(aplicables[0].getHoraPartida()).toBe('08:00');
  });

  it('Para una fecha sin reglas coincidentes, devuelve arreglo vacío', () => {
    // 2026-12-20 es Domingo (día 0)
    const reglas = [reglaRegularViernes, reglaRegularLunes, reglaEspecialNavidad];

    const aplicables = evaluador.obtenerReglasParaFecha('2026-12-20', reglas);

    expect(aplicables).toEqual([]);
  });

  it('Ignora reglas inactivas aunque coincidan con la fecha o día', () => {
    const reglaInactiva = ReglaItinerario.create({
      id: 'REG-INACTIVA',
      nombre: 'Inactiva',
      tipoAplicacion: TipoAplicacionItinerario.DIAS_SEMANA,
      diasSemana: [5],
      rutaId: 'RUT-01',
      horaPartida: '14:00',
      embarcacionDefaultId: 'EMB-01',
      activo: false,
    });

    const aplicables = evaluador.obtenerReglasParaFecha('2026-12-18', [reglaInactiva]);
    expect(aplicables).toEqual([]);
  });
});
