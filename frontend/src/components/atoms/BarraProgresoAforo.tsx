import React from 'react';

export interface BarraProgresoAforoProps {
  vendidos: number;
  capacidad: number;
  porcentaje?: number;
  className?: string;
  showLabels?: boolean;
}

export const BarraProgresoAforo: React.FC<BarraProgresoAforoProps> = ({
  vendidos,
  capacidad,
  porcentaje,
  className = '',
  showLabels = true,
}) => {
  const cap = capacidad > 0 ? capacidad : 1;
  const pct =
    porcentaje !== undefined
      ? porcentaje
      : Math.min(100, Math.round((vendidos / cap) * 100));

  let colorBarra = 'bg-[#5289AD]';
  let badgeColor = 'text-[#243C4C]';

  if (pct >= 90) {
    colorBarra = 'bg-rose-500';
    badgeColor = 'text-rose-700 font-bold';
  } else if (pct >= 70) {
    colorBarra = 'bg-amber-500';
    badgeColor = 'text-amber-800 font-semibold';
  } else {
    colorBarra = 'bg-teal-600';
    badgeColor = 'text-teal-800';
  }

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabels && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#698696] font-medium">
            Ocupación: <strong className="text-[#243C4C]">{vendidos}</strong> / {capacidad} puestos
          </span>
          <span className={`${badgeColor}`}>{pct}%</span>
        </div>
      )}
      <div className="w-full bg-[#ACBCBF]/30 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${colorBarra}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
