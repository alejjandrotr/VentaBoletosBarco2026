import React from 'react';

export interface SelectorFechaOperativaProps {
  fechaSeleccionada: string; // 'YYYY-MM-DD'
  onCambiarFecha: (nuevaFecha: string) => void;
  className?: string;
}

export const SelectorFechaOperativa: React.FC<SelectorFechaOperativaProps> = ({
  fechaSeleccionada,
  onCambiarFecha,
  className = '',
}) => {
  const formatearFecha = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const hoy = new Date();
  const manana = new Date();
  manana.setDate(hoy.getDate() + 1);
  const pasadoManana = new Date();
  pasadoManana.setDate(hoy.getDate() + 2);

  const strHoy = formatearFecha(hoy);
  const strManana = formatearFecha(manana);
  const strPasado = formatearFecha(pasadoManana);

  // Obtener texto descriptivo en español
  const partes = fechaSeleccionada.split('-').map(Number);
  let fechaTexto = fechaSeleccionada;
  if (partes.length === 3) {
    const fechaObj = new Date(partes[0], partes[1] - 1, partes[2]);
    fechaTexto = fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    // Capitalize first letter
    fechaTexto = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
  }

  return (
    <div
      className={`bg-white rounded-xl p-4 border border-[#ACBCBF]/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="space-y-1">
        <span className="text-xs font-bold text-[#698696] uppercase tracking-wider">
          Fecha de Operación en Muelle
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className="text-base font-extrabold text-[#243C4C]">
            {fechaTexto}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onCambiarFecha(strHoy)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            fechaSeleccionada === strHoy
              ? 'bg-[#5289AD] text-white shadow-xs'
              : 'bg-slate-100 text-[#243C4C] hover:bg-slate-200'
          }`}
        >
          Hoy
        </button>

        <button
          type="button"
          onClick={() => onCambiarFecha(strManana)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            fechaSeleccionada === strManana
              ? 'bg-[#5289AD] text-white shadow-xs'
              : 'bg-slate-100 text-[#243C4C] hover:bg-slate-200'
          }`}
        >
          Mañana
        </button>

        <button
          type="button"
          onClick={() => onCambiarFecha(strPasado)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            fechaSeleccionada === strPasado
              ? 'bg-[#5289AD] text-white shadow-xs'
              : 'bg-slate-100 text-[#243C4C] hover:bg-slate-200'
          }`}
        >
          Pasado Mañana
        </button>

        <input
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => e.target.value && onCambiarFecha(e.target.value)}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#ACBCBF] text-[#243C4C] bg-white hover:border-[#5289AD] focus:outline-none focus:ring-1 focus:ring-[#5289AD] cursor-pointer"
        />
      </div>
    </div>
  );
};
