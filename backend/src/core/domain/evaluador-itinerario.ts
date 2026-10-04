import { ReglaItinerario, TipoAplicacionItinerario } from './regla-itinerario.js';

export class EvaluadorItinerario {
  /**
   * Evalúa las reglas de itinerario aplicables para una fecha dada (YYYY-MM-DD).
   * Si existen reglas de FECHA_ESPECIFICA para ese día, tienen precedencia total sobre
   * las reglas de DIAS_SEMANA.
   */
  public obtenerReglasParaFecha(
    fechaISO: string,
    reglas: ReglaItinerario[],
  ): ReglaItinerario[] {
    const reglasActivas = reglas.filter((r) => r.isActivo());

    // 1. Prioridad: Reglas especiales por fecha específica
    const reglasFechaEspecifica = reglasActivas.filter(
      (r) =>
        r.getTipoAplicacion() === TipoAplicacionItinerario.FECHA_ESPECIFICA &&
        r.aplicaEnFecha(fechaISO),
    );

    if (reglasFechaEspecifica.length > 0) {
      return reglasFechaEspecifica.sort((a, b) =>
        a.getHoraPartida().localeCompare(b.getHoraPartida()),
      );
    }

    // 2. Reglas regulares por día de la semana
    const [year, month, day] = fechaISO.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const diaSemana = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    const reglasDiaSemana = reglasActivas.filter(
      (r) =>
        r.getTipoAplicacion() === TipoAplicacionItinerario.DIAS_SEMANA &&
        r.aplicaEnDiaSemana(diaSemana),
    );

    return reglasDiaSemana.sort((a, b) =>
      a.getHoraPartida().localeCompare(b.getHoraPartida()),
    );
  }
}
