import React, { useState } from 'react';
import {
  FilaReglaItinerario,
  type ReglaItinerarioItem,
} from '../molecules/FilaReglaItinerario';
import { Button } from '../atoms/Button';

export interface TablaReglasItinerarioProps {
  reglas: ReglaItinerarioItem[];
  onToggleActivo: (id: string, activo: boolean) => void;
  onEditarRegla: (regla: ReglaItinerarioItem) => void;
  onNuevaRegla: () => void;
}

export const TablaReglasItinerario: React.FC<TablaReglasItinerarioProps> = ({
  reglas,
  onToggleActivo,
  onEditarRegla,
  onNuevaRegla,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<'TODAS' | 'DIAS_SEMANA' | 'FECHA_ESPECIFICA'>('TODAS');
  const [soloActivas, setSoloActivas] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const filtradas = reglas.filter((r) => {
    if (filtroTipo !== 'TODAS' && r.tipoAplicacion !== filtroTipo) {
      return false;
    }
    if (soloActivas && !r.activo) {
      return false;
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const matchNombre = r.nombre.toLowerCase().includes(q);
      const matchRuta = (r.rutaNombre || r.rutaId).toLowerCase().includes(q);
      const matchEmb = (r.embarcacionNombre || '').toLowerCase().includes(q);
      return matchNombre || matchRuta || matchEmb;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Barra de Filtros y Acción */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Pestañas de Filtro */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltroTipo('TODAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filtroTipo === 'TODAS'
                ? 'bg-[#5289AD] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas ({reglas.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo('DIAS_SEMANA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filtroTipo === 'DIAS_SEMANA'
                ? 'bg-[#5289AD] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📅 Semanales Recurrentes
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo('FECHA_ESPECIFICA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filtroTipo === 'FECHA_ESPECIFICA'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            🎉 Feriados / Especiales
          </button>

          <label className="inline-flex items-center gap-1.5 ml-2 text-xs font-semibold text-[#243C4C] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soloActivas}
              onChange={(e) => setSoloActivas(e.target.checked)}
              className="rounded border-[#ACBCBF] text-[#5289AD] focus:ring-[#5289AD]"
            />
            Solo Activas
          </label>
        </div>

        {/* Buscador y Botón Crear */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por ruta o lancha..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#ACBCBF] text-[#243C4C] w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-[#5289AD]"
          />

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onNuevaRegla}
            className="whitespace-nowrap"
          >
            + Nueva Salida
          </Button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-[11px] font-bold text-[#698696] uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-4">Hora & Salida</th>
              <th className="py-3 px-4">Ruta</th>
              <th className="py-3 px-4">Frecuencia / Días</th>
              <th className="py-3 px-4">Embarcación Asignada</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                  No se encontraron reglas de itinerario con los criterios seleccionados.
                </td>
              </tr>
            ) : (
              filtradas.map((r) => (
                <FilaReglaItinerario
                  key={r.id}
                  regla={r}
                  onToggleActivo={onToggleActivo}
                  onEditar={onEditarRegla}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
