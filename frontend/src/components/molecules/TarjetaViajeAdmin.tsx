import React from 'react';
import { BadgeEstadoViaje, type EstadoViajeType } from '../atoms/BadgeEstadoViaje';
import { BarraProgresoAforo } from '../atoms/BarraProgresoAforo';
import { BotonAccionOperativa } from '../atoms/BotonAccionOperativa';

export interface ViajeAdminItem {
  id: string;
  fecha: string;
  horaPartida: string;
  rutaId: string;
  rutaNombre: string;
  origenPuertoNombre: string;
  destinoPuertoNombre: string;
  embarcacionId: string;
  embarcacionCodigo: string;
  embarcacionNombre: string;
  capacidadMaxima: number;
  boletosVendidos: number;
  puestosDisponibles: number;
  porcentajeOcupacion: number;
  estado: EstadoViajeType;
}

export interface TarjetaViajeAdminProps {
  viaje: ViajeAdminItem;
  onCambiarEstado: (viajeId: string, nuevoEstado: EstadoViajeType) => void;
  isLoading?: boolean;
}

export const TarjetaViajeAdmin: React.FC<TarjetaViajeAdminProps> = ({
  viaje,
  onCambiarEstado,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between gap-4">
      {/* Cabecera del Viaje */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-black text-[#243C4C] bg-[#5289AD]/10 px-2.5 py-1 rounded-lg border border-[#5289AD]/20">
              {viaje.horaPartida}
            </span>
            <BadgeEstadoViaje estado={viaje.estado} />
          </div>
          <h3 className="text-sm font-extrabold text-[#243C4C] mt-2 leading-tight">
            {viaje.rutaNombre}
          </h3>
          <p className="text-[11px] text-[#698696] font-mono mt-0.5">
            ID: {viaje.id}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-[#243C4C] block">
            {viaje.embarcacionNombre}
          </span>
          <span className="text-[10px] font-mono text-[#698696] bg-slate-100 px-2 py-0.5 rounded">
            {viaje.embarcacionCodigo}
          </span>
        </div>
      </div>

      {/* Aforo y Ocupación */}
      <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
        <BarraProgresoAforo
          vendidos={viaje.boletosVendidos}
          capacidad={viaje.capacidadMaxima}
          porcentaje={viaje.porcentajeOcupacion}
        />
        <div className="flex justify-between items-center text-[11px] text-[#698696] mt-2 font-medium">
          <span>Puestos disponibles:</span>
          <strong className="text-[#243C4C] font-bold text-xs">
            {viaje.puestosDisponibles} asientos
          </strong>
        </div>
      </div>

      {/* Botones de Acción Operativa según Estado */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-100">
        {viaje.estado === 'PROGRAMADO' && (
          <>
            <BotonAccionOperativa
              accion="EMBARQUE"
              onClick={() => onCambiarEstado(viaje.id, 'EN_EMBARQUE')}
              isLoading={isLoading}
            />
            <BotonAccionOperativa
              accion="CANCELAR"
              onClick={() => onCambiarEstado(viaje.id, 'CANCELADO')}
              isLoading={isLoading}
            />
          </>
        )}

        {viaje.estado === 'EN_EMBARQUE' && (
          <>
            <BotonAccionOperativa
              accion="ZARPE"
              onClick={() => onCambiarEstado(viaje.id, 'EN_TRANSITO')}
              isLoading={isLoading}
            />
            <BotonAccionOperativa
              accion="CANCELAR"
              onClick={() => onCambiarEstado(viaje.id, 'CANCELADO')}
              isLoading={isLoading}
            />
          </>
        )}

        {viaje.estado === 'EN_TRANSITO' && (
          <BotonAccionOperativa
            accion="FINALIZAR"
            onClick={() => onCambiarEstado(viaje.id, 'FINALIZADO')}
            isLoading={isLoading}
          />
        )}

        {viaje.estado === 'FINALIZADO' && (
          <span className="text-xs text-slate-500 font-semibold italic">
            Viaje culminado exitosamente
          </span>
        )}

        {viaje.estado === 'CANCELADO' && (
          <span className="text-xs text-rose-500 font-semibold italic">
            Salida cancelada
          </span>
        )}
      </div>
    </div>
  );
};
