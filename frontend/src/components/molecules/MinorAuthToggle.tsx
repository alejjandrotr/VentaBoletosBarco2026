import React from 'react';
import { FormField } from './FormField';
import { Checkbox } from '../atoms/Checkbox';

export interface MinorAuthToggleProps {
  isTravelingWithRepresentative: boolean;
  representativeDocumentId: string;
  hasTravelAuthorizationPresented: boolean;
  onChange: (fields: {
    isTravelingWithRepresentative?: boolean;
    representativeDocumentId?: string;
    hasTravelAuthorizationPresented?: boolean;
  }) => void;
  error?: string;
}

export const MinorAuthToggle: React.FC<MinorAuthToggleProps> = ({
  isTravelingWithRepresentative,
  representativeDocumentId,
  hasTravelAuthorizationPresented,
  onChange,
  error,
}) => {
  return (
    <div className="mt-3 p-3.5 bg-[#5289AD]/10 border border-[#5289AD]/30 rounded-xl space-y-3">
      <div className="flex items-center space-x-2 text-[#243C4C]">
        <span className="text-xs font-bold uppercase tracking-wider">
          ⚠️ Requisito Legal - Pasajero Menor de Edad (&lt;18 años)
        </span>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <label className="inline-flex items-center space-x-2 text-[#243C4C] cursor-pointer">
          <input
            type="radio"
            name="travelAcc"
            checked={isTravelingWithRepresentative}
            onChange={() => onChange({ isTravelingWithRepresentative: true })}
            className="text-[#5289AD] focus:ring-[#5289AD]"
          />
          <span>Viaja con Representante Legal</span>
        </label>
        <label className="inline-flex items-center space-x-2 text-[#243C4C] cursor-pointer">
          <input
            type="radio"
            name="travelAcc"
            checked={!isTravelingWithRepresentative}
            onChange={() => onChange({ isTravelingWithRepresentative: false, representativeDocumentId: '' })}
            className="text-[#5289AD] focus:ring-[#5289AD]"
          />
          <span>Viaja Solo / Con Terceros</span>
        </label>
      </div>

      {isTravelingWithRepresentative ? (
        <FormField
          label="Cédula del Representante Legal"
          placeholder="Ej. V-15890123"
          value={representativeDocumentId}
          onChange={(e) => onChange({ representativeDocumentId: e.target.value })}
          required
        />
      ) : (
        <div className="pt-1">
          <Checkbox
            label="Constancia Física de Autorización de Viaje Presentada y Validada"
            description="El cajero certifica haber verificado el permiso formal firmado por representantes/LOPNNA."
            checked={hasTravelAuthorizationPresented}
            onChange={(e) => onChange({ hasTravelAuthorizationPresented: e.target.checked })}
          />
        </div>
      )}

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
