import React from 'react';
import { BotonAccionOperativa } from '../atoms/BotonAccionOperativa';

export interface MetricasOperativasDia {
  totalViajes: number;
  enEmbarque: number;
  enTransito: number;
  finalizados: number;
  totalVendidos: number;
  capacidadTotal: number;
}

export interface CabeceraPanelOperativoProps {
  fecha: string;
  metricas: MetricasOperativasDia;
  onInicializarViajes: () => void;
  isLoading?: boolean;
}

export const CabeceraPanelOperativo: React.FC<CabeceraPanelOperativoProps> = ({
  fecha: _fecha,
  metricas,
  onInicializarViajes,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚓</span>
            <h1 className="text-xl font-black text-[#243C4C]">
              Centro de Mando y Despacho Marítimo
            </h1>
          </div>
          <p className="text-xs text-[#698696] font-medium mt-1">
            Supervisión de aforo, control de embarque y autorización de zarpe en tiempo real.
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

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
          <span className="text-[11px] font-bold text-[#698696] uppercase block">
            Viajes Programados
          </span>
          <span className="text-2xl font-black text-[#243C4C] mt-0.5 block">
            {metricas.totalViajes}
          </span>
        </div>

        <div className="bg-amber-50/80 rounded-xl p-3.5 border border-amber-200/60">
          <span className="text-[11px] font-bold text-amber-800 uppercase block">
            En Embarque (Muelle)
          </span>
          <span className="text-2xl font-black text-amber-900 mt-0.5 block">
            {metricas.enEmbarque}
          </span>
        </div>

        <div className="bg-teal-50/80 rounded-xl p-3.5 border border-teal-200/60">
          <span className="text-[11px] font-bold text-teal-800 uppercase block">
            En Tránsito (Zarpe)
          </span>
          <span className="text-2xl font-black text-teal-900 mt-0.5 block">
            {metricas.enTransito}
          </span>
        </div>

        <div className="bg-[#5289AD]/10 rounded-xl p-3.5 border border-[#5289AD]/20">
          <span className="text-[11px] font-bold text-[#243C4C] uppercase block">
            Ocupación General
          </span>
          <span className="text-2xl font-black text-[#243C4C] mt-0.5 block">
            {metricas.totalVendidos} / {metricas.capacidadTotal}
          </span>
        </div>
      </div>
    </div>
  );
};
