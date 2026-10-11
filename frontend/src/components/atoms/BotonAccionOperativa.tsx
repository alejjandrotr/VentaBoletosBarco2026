import React from 'react';

export interface BotonAccionOperativaProps {
  accion: 'EMBARQUE' | 'ZARPE' | 'FINALIZAR' | 'CANCELAR' | 'INICIALIZAR';
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const BotonAccionOperativa: React.FC<BotonAccionOperativaProps> = ({
  accion,
  onClick,
  disabled = false,
  isLoading = false,
  size = 'sm',
  className = '',
}) => {
  const configs = {
    EMBARQUE: {
      label: 'Iniciar Embarque',
      icon: '🚪',
      style:
        'bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500',
    },
    ZARPE: {
      label: 'Zarpar (En Tránsito)',
      icon: '🚢',
      style:
        'bg-teal-700 hover:bg-teal-800 text-white shadow-xs focus:ring-teal-500',
    },
    FINALIZAR: {
      label: 'Finalizar Arribo',
      icon: '🏁',
      style:
        'bg-slate-700 hover:bg-slate-800 text-white shadow-xs focus:ring-slate-500',
    },
    CANCELAR: {
      label: 'Cancelar Salida',
      icon: '🚫',
      style:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500',
    },
    INICIALIZAR: {
      label: 'Generar / Inicializar Viajes',
      icon: '⚡',
      style:
        'bg-[#5289AD] hover:bg-[#437394] text-white shadow-md hover:shadow-lg focus:ring-[#5289AD]',
    },
  };

  const current = configs[accion];
  const sizeStyles =
    size === 'sm'
      ? 'px-2.5 py-1.5 text-xs gap-1.5'
      : 'px-4 py-2 text-sm gap-2';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-bold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${current.style} ${sizeStyles} ${className}`}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <span>{current.icon}</span>
      )}
      <span>{current.label}</span>
    </button>
  );
};
