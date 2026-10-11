import React from 'react';

export type EstadoViajeType =
  | 'PROGRAMADO'
  | 'EN_EMBARQUE'
  | 'EN_TRANSITO'
  | 'FINALIZADO'
  | 'CANCELADO';

export interface BadgeEstadoViajeProps {
  estado: EstadoViajeType;
  size?: 'sm' | 'md';
  className?: string;
}

export const BadgeEstadoViaje: React.FC<BadgeEstadoViajeProps> = ({
  estado,
  size = 'md',
  className = '',
}) => {
  const configs: Record<
    EstadoViajeType,
    { label: string; icon: string; styles: string }
  > = {
    PROGRAMADO: {
      label: 'Programado',
      icon: '⏱️',
      styles: 'bg-[#5289AD]/15 text-[#243C4C] border-[#5289AD]/40',
    },
    EN_EMBARQUE: {
      label: 'En Embarque',
      icon: '🚪',
      styles: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse',
    },
    EN_TRANSITO: {
      label: 'En Tránsito (Zarpe)',
      icon: '🚢',
      styles: 'bg-teal-100 text-teal-900 border-teal-300 font-bold',
    },
    FINALIZADO: {
      label: 'Finalizado',
      icon: '🏁',
      styles: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    CANCELADO: {
      label: 'Cancelado',
      icon: '🚫',
      styles: 'bg-rose-100 text-rose-800 border-rose-300',
    },
  };

  const current = configs[estado] || configs.PROGRAMADO;
  const sizeStyles =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-xs font-bold uppercase tracking-wider';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-solid shadow-xs ${current.styles} ${sizeStyles} ${className}`}
    >
      <span>{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
};
