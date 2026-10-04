import React from 'react';
import { Badge } from '../atoms/Badge';

export interface CapacityIndicatorProps {
  totalCapacity: number;
  availableSeats: number;
  unitName?: string;
  busPlate?: string;
}

export const CapacityIndicator: React.FC<CapacityIndicatorProps> = ({
  totalCapacity,
  availableSeats,
  unitName,
  busPlate,
}) => {
  const soldSeats = Math.max(0, totalCapacity - availableSeats);
  const percentageAvailable = totalCapacity > 0 ? (availableSeats / totalCapacity) * 100 : 0;
  const isFull = availableSeats <= 0;

  let badgeVariant: 'success' | 'warning' | 'danger' = 'success';
  let barColor = 'bg-[#5289AD]';

  if (isFull) {
    badgeVariant = 'danger';
    barColor = 'bg-rose-500';
  } else if (percentageAvailable < 20) {
    badgeVariant = 'warning';
    barColor = 'bg-[#ACBCBF]';
  }

  return (
    <div className="bg-[#1b2f3d] border border-[#698696]/40 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">{unitName || 'Unidad de Transporte'}</h4>
          {busPlate && <span className="text-xs font-mono text-[#ACBCBF]">Placa: {busPlate}</span>}
        </div>
        <Badge variant={badgeVariant}>
          {isFull ? 'Agotado (Lleno)' : `${availableSeats} Disponibles`}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs font-medium text-[#ACBCBF]">
          <span>Ocupación: {soldSeats} / {totalCapacity} puestos</span>
          <span>{Math.round(100 - percentageAvailable)}% Lleno</span>
        </div>
        <div className="h-2.5 w-full bg-[#13222d] rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300 rounded-full`}
            style={{ width: `${Math.min(100, Math.max(0, ((totalCapacity - availableSeats) / totalCapacity) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
