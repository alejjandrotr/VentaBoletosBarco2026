import React, { useState, useEffect } from 'react';
import type { ReglaItinerarioItem } from './FilaReglaItinerario';
import { InputHora } from '../atoms/InputHora';
import { SwitchActivo } from '../atoms/SwitchActivo';
import { Button } from '../atoms/Button';

export interface ModalEditarReglaProps {
  isOpen: boolean;
  reglaEdicion: ReglaItinerarioItem | null;
  onClose: () => void;
  onGuardar: (datos: Partial<ReglaItinerarioItem>) => Promise<void>;
}

const RUTAS_DISPONIBLES = [
  { id: 'RUT-01', nombre: 'Guanta -> El Guamache (Margarita)' },
  { id: 'RUT-02', nombre: 'El Guamache (Margarita) -> Guanta' },
  { id: 'RUT-03', nombre: 'Chacopata (Araya) -> El Guamache' },
  { id: 'RUT-04', nombre: 'El Guamache -> Chacopata (Araya)' },
];

const EMBARCACIONES_DISPONIBLES = [
  { id: 'EMB-01', nombre: 'Gran Cacique Express I (Cap: 50)', codigo: 'ARSH-PE-001' },
  { id: 'EMB-02', nombre: 'Gran Cacique Express II (Cap: 60)', codigo: 'ARSH-PE-002' },
  { id: 'EMB-03', nombre: 'Lancha Rápida Virgen del Valle (Cap: 35)', codigo: 'ARSH-PE-003' },
];

const DIAS_OPCIONES = [
  { num: 1, label: 'Lunes' },
  { num: 2, label: 'Martes' },
  { num: 3, label: 'Miércoles' },
  { num: 4, label: 'Jueves' },
  { num: 5, label: 'Viernes' },
  { num: 6, label: 'Sábado' },
  { num: 0, label: 'Domingo' },
];

export const ModalEditarRegla: React.FC<ModalEditarReglaProps> = ({
  isOpen,
  reglaEdicion,
  onClose,
  onGuardar,
}) => {
  const [nombre, setNombre] = useState('');
  const [tipoAplicacion, setTipoAplicacion] = useState<'DIAS_SEMANA' | 'FECHA_ESPECIFICA'>('DIAS_SEMANA');
  const [diasSemana, setDiasSemana] = useState<number[]>([1, 2, 3, 4, 5]);
  const [fechaEspecifica, setFechaEspecifica] = useState('');
  const [rutaId, setRutaId] = useState('RUT-01');
  const [horaPartida, setHoraPartida] = useState('08:00');
  const [embarcacionDefaultId, setEmbarcacionDefaultId] = useState('EMB-01');
  const [activo, setActivo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reglaEdicion) {
      setNombre(reglaEdicion.nombre);
      setTipoAplicacion(reglaEdicion.tipoAplicacion);
      setDiasSemana(reglaEdicion.diasSemana || [1, 2, 3, 4, 5]);
      setFechaEspecifica(reglaEdicion.fechaEspecifica || '');
      setRutaId(reglaEdicion.rutaId);
      setHoraPartida(reglaEdicion.horaPartida);
      setEmbarcacionDefaultId(reglaEdicion.embarcacionDefaultId);
      setActivo(reglaEdicion.activo);
    } else {
      setNombre('');
      setTipoAplicacion('DIAS_SEMANA');
      setDiasSemana([1, 2, 3, 4, 5]);
      setFechaEspecifica('');
      setRutaId('RUT-01');
      setHoraPartida('08:00');
      setEmbarcacionDefaultId('EMB-01');
      setActivo(true);
    }
    setError(null);
  }, [reglaEdicion, isOpen]);

  if (!isOpen) return null;

  const toggleDia = (num: number) => {
    if (diasSemana.includes(num)) {
      setDiasSemana(diasSemana.filter((d) => d !== num));
    } else {
      setDiasSemana([...diasSemana, num]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre de la salida programada es requerido.');
      return;
    }
    if (tipoAplicacion === 'DIAS_SEMANA' && diasSemana.length === 0) {
      setError('Debe seleccionar al menos un día de la semana.');
      return;
    }
    if (tipoAplicacion === 'FECHA_ESPECIFICA' && !fechaEspecifica) {
      setError('Debe ingresar una fecha específica en formato YYYY-MM-DD.');
      return;
    }
    if (!horaPartida) {
      setError('La hora de partida es requerida.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onGuardar({
        id: reglaEdicion?.id,
        nombre: nombre.trim(),
        tipoAplicacion,
        diasSemana: tipoAplicacion === 'DIAS_SEMANA' ? diasSemana : undefined,
        fechaEspecifica: tipoAplicacion === 'FECHA_ESPECIFICA' ? fechaEspecifica : undefined,
        rutaId,
        horaPartida,
        embarcacionDefaultId,
        activo,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la regla.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-[#243C4C] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📋</span>
            <h2 className="text-base font-extrabold">
              {reglaEdicion ? 'Editar Regla de Itinerario' : 'Nueva Salida Programada'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              ⚠️ {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-[#698696] mb-1 uppercase tracking-wider">
              Nombre Descriptivo de la Salida
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Guanta -> Margarita 08:00 AM (L-V)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#ACBCBF] focus:ring-2 focus:ring-[#5289AD] focus:border-[#5289AD] text-[#243C4C]"
            />
          </div>

          {/* Tipo de Aplicación */}
          <div>
            <label className="block text-xs font-bold text-[#698696] mb-1.5 uppercase tracking-wider">
              Frecuencia / Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoAplicacion('DIAS_SEMANA')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  tipoAplicacion === 'DIAS_SEMANA'
                    ? 'bg-[#5289AD]/15 border-[#5289AD] text-[#243C4C]'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                📅 Días Semanales Recurrentes
              </button>
              <button
                type="button"
                onClick={() => setTipoAplicacion('FECHA_ESPECIFICA')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  tipoAplicacion === 'FECHA_ESPECIFICA'
                    ? 'bg-amber-100 border-amber-400 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🎉 Salida Especial / Feriado
              </button>
            </div>
          </div>

          {/* Días de la semana o Fecha específica */}
          {tipoAplicacion === 'DIAS_SEMANA' ? (
            <div>
              <label className="block text-xs font-bold text-[#698696] mb-1 uppercase tracking-wider">
                Días de Operación
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIAS_OPCIONES.map((d) => {
                  const seleccionado = diasSemana.includes(d.num);
                  return (
                    <button
                      type="button"
                      key={d.num}
                      onClick={() => toggleDia(d.num)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        seleccionado
                          ? 'bg-[#5289AD] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#698696] mb-1 uppercase tracking-wider">
                Fecha Específica (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={fechaEspecifica}
                onChange={(e) => setFechaEspecifica(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#ACBCBF] focus:ring-2 focus:ring-[#5289AD] text-[#243C4C]"
              />
            </div>
          )}

          {/* Ruta y Horario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#698696] mb-1 uppercase tracking-wider">
                Ruta Marítima
              </label>
              <select
                value={rutaId}
                onChange={(e) => setRutaId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-[#ACBCBF] text-[#243C4C] bg-white"
              >
                {RUTAS_DISPONIBLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#698696] mb-1 uppercase tracking-wider">
                Hora de Partida (24h)
              </label>
              <InputHora value={horaPartida} onChange={setHoraPartida} />
            </div>
          </div>

          {/* Embarcación asignada */}
          <div>
            <label className="block text-xs font-bold text-[#698696] mb-1 uppercase tracking-wider">
              Lancha / Embarcación por Defecto
            </label>
            <select
              value={embarcacionDefaultId}
              onChange={(e) => setEmbarcacionDefaultId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-[#ACBCBF] text-[#243C4C] bg-white"
            >
              {EMBARCACIONES_DISPONIBLES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} ({e.codigo})
                </option>
              ))}
            </select>
          </div>

          {/* Switch Activo */}
          <div className="pt-2">
            <SwitchActivo
              checked={activo}
              onChange={setActivo}
              label="Habilitar regla inmediatamente para el generador de viajes"
            />
          </div>

          {/* Footer Botones */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
            >
              {reglaEdicion ? 'Guardar Cambios' : 'Crear Regla'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
