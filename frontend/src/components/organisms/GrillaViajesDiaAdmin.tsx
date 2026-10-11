import React from 'react';
import { TarjetaViajeAdmin, type ViajeAdminItem } from '../molecules/TarjetaViajeAdmin';
import type { EstadoViajeType } from '../atoms/BadgeEstadoViaje';
import { BotonAccionOperativa } from '../atoms/BotonAccionOperativa';

export interface GrillaViajesDiaAdminProps {
  viajes: ViajeAdminItem[];
  onCambiarEstado: (viajeId: string, nuevoEstado: EstadoViajeType) => void;
  onInicializarViajes: () => void;
  isLoading?: boolean;
}

export const GrillaViajesDiaAdmin: React.FC<GrillaViajesDiaAdminProps> = ({
  viajes,
  onCambiarEstado,
  onInicializarViajes,
  isLoading = false,
}) => {
  if (viajes.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#5289AD]/15 flex items-center justify-center text-3xl mx-auto">
          🛥️
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-extrabold text-[#243C4C]">
            No hay viajes generados para esta fecha
          </h3>
          <p className="text-xs text-[#698696] mt-1">
            Puedes generar los viajes correspondientes al itinerario programado de este día con un solo clic.
          </p>
        </div>
        <div>
          <BotonAccionOperativa
            accion="INICIALIZAR"
            onClick={onInicializarViajes}
            isLoading={isLoading}
            size="md"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {viajes.map((viaje) => (
        <TarjetaViajeAdmin
          key={viaje.id}
          viaje={viaje}
          onCambiarEstado={onCambiarEstado}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
