import React from 'react';
import { SwitchActivo } from '../atoms/SwitchActivo';

export interface ReglaItinerarioItem {
  id: string;
  nombre: string;
  tipoAplicacion: 'DIAS_SEMANA' | 'FECHA_ESPECIFICA';
  diasSemana?: number[];
  fechaEspecifica?: string;
  rutaId: string;
  rutaNombre?: string;
  horaPartida: string;
  embarcacionDefaultId: string;
  embarcacionNombre?: string;
  embarcacionCodigo?: string;
  activo: boolean;
}

export interface FilaReglaItinerarioProps {
  regla: ReglaItinerarioItem;
  onToggleActivo: (id: string, activo: boolean) => void;
  onEditar: (regla: ReglaItinerarioItem) => void;
}

const NOMBRES_DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const FilaReglaItinerario: React.FC<FilaReglaItinerarioProps> = ({
  regla,
  onToggleActivo,
  onEditar,
}) => {
  return (
    <tr
      className={`border-b border-slate-100 transition-colors ${
        regla.activo ? 'hover:bg-slate-50/80' : 'bg-slate-50/50 opacity-70'
      }`}
    >
      {/* Hora y Nombre */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-base font-extrabold text-[#243C4C] bg-[#5289AD]/10 px-2.5 py-1 rounded-md border border-[#5289AD]/20">
            {regla.horaPartida}
          </span>
          <div>
            <p className="text-sm font-bold text-[#243C4C] leading-snug">
              {regla.nombre}
            </p>
            <p className="text-xs text-[#698696] font-medium">
              ID: {regla.id}
            </p>
          </div>
        </div>
      </td>

      {/* Ruta */}
      <td className="py-3.5 px-4 text-xs font-semibold text-[#243C4C]">
        <div className="flex items-center gap-1.5">
          <span>🚢</span>
          <span>{regla.rutaNombre || regla.rutaId}</span>
        </div>
      </td>

      {/* Frecuencia / Días o Fecha */}
      <td className="py-3.5 px-4">
        {regla.tipoAplicacion === 'DIAS_SEMANA' ? (
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4, 5, 6, 0].map((diaNum) => {
              const aplica = regla.diasSemana?.includes(diaNum);
              return (
                <span
                  key={diaNum}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    aplica
                      ? 'bg-[#5289AD] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {NOMBRES_DIAS[diaNum]}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span>📅 Feriado:</span>
            <span>{regla.fechaEspecifica}</span>
          </span>
        )}
      </td>

      {/* Embarcación */}
      <td className="py-3.5 px-4">
        <div className="text-xs font-semibold text-[#243C4C]">
          {regla.embarcacionNombre || regla.embarcacionDefaultId}
        </div>
        {regla.embarcacionCodigo && (
          <div className="text-[11px] text-[#698696] font-mono">
            {regla.embarcacionCodigo}
          </div>
        )}
      </td>

      {/* Estado (Switch) */}
      <td className="py-3.5 px-4 text-center">
        <SwitchActivo
          checked={regla.activo}
          onChange={(checked) => onToggleActivo(regla.id, checked)}
          label={regla.activo ? 'Activa' : 'Pausada'}
        />
      </td>

      {/* Acciones */}
      <td className="py-3.5 px-4 text-right">
        <button
          type="button"
          onClick={() => onEditar(regla)}
          className="text-xs font-bold text-[#5289AD] hover:text-[#437394] hover:underline px-2 py-1 rounded cursor-pointer"
        >
          Editar
        </button>
      </td>
    </tr>
  );
};
