import React from 'react';
import { Badge } from '../atoms/Badge';
import { CapacityIndicator } from '../molecules/CapacityIndicator';

export interface ActiveTripBannerProps {
  tripId: string;
  origin: string;
  destination: string;
  departureTime: string;
  status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'CANCELLED';
  basePrice: number;
  totalCapacity: number;
  availableSeats: number;
  unitName: string;
  busPlate: string;
}

export const ActiveTripBanner: React.FC<ActiveTripBannerProps> = ({
  origin,
  destination,
  departureTime,
  status,
  basePrice,
  totalCapacity,
  availableSeats,
  unitName,
  busPlate,
}) => {
  return (
    <div className="bg-gradient-to-r from-[#243C4C] via-[#243C4C] to-[#1d3240] border border-[#698696]/40 rounded-2xl p-5 shadow-lg space-y-4 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F4FCFB] bg-[#5289AD]/30 border border-[#5289AD] px-2.5 py-1 rounded-md">
              Viaje Activo Preseleccionado
            </span>
            <Badge variant={status === 'BOARDING' ? 'warning' : 'info'}>
              {status === 'BOARDING' ? 'Embarcando Próximo' : 'Programado'}
            </Badge>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight pt-1">
            {origin} <span className="text-[#5289AD]">➔</span> {destination}
          </h2>
          <p className="text-xs text-[#ACBCBF]">
            Salida Programada: <strong className="text-white">{departureTime}</strong> | Tarifa Base:{' '}
            <strong className="text-white font-mono bg-[#5289AD]/40 px-2 py-0.5 rounded border border-[#5289AD]">
              ${basePrice.toFixed(2)} USD
            </strong>
          </p>
        </div>

        <div className="w-full md:w-72">
          <CapacityIndicator
            totalCapacity={totalCapacity}
            availableSeats={availableSeats}
            unitName={unitName}
            busPlate={busPlate}
          />
        </div>
      </div>
    </div>
  );
};
