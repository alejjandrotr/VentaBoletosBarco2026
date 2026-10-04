import React from 'react';
import { FormField } from '../molecules/FormField';

export interface BuyerFormData {
  buyerDocumentId: string;
  buyerFullName: string;
  buyerEmail: string;
}

export interface BuyerContactFormProps {
  data: BuyerFormData;
  onChange: (updated: Partial<BuyerFormData>) => void;
  errors?: Record<string, string>;
}

export const BuyerContactForm: React.FC<BuyerContactFormProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <div className="bg-white border border-[#ACBCBF] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="border-b border-[#ACBCBF]/60 pb-3">
        <h3 className="text-base font-bold text-[#243C4C] flex items-center space-x-2">
          <span>👤 Datos del Comprador / Titular de la Factura</span>
        </h3>
        <p className="text-xs text-[#698696] mt-0.5">
          Información fiscal requerida por el SENIAT para el despacho digital del comprobante por correo electrónico.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          label="Cédula / RIF del Comprador"
          placeholder="Ej. V-12345678"
          value={data.buyerDocumentId}
          onChange={(e) => onChange({ buyerDocumentId: e.target.value })}
          error={errors.buyerDocumentId}
          required
        />
        <FormField
          label="Nombre Completo / Razón Social"
          placeholder="Ej. Juan Pérez"
          value={data.buyerFullName}
          onChange={(e) => onChange({ buyerFullName: e.target.value })}
          error={errors.buyerFullName}
          required
        />
        <FormField
          label="Correo Electrónico (Factura Digital)"
          type="email"
          placeholder="Ej. cliente@ejemplo.com"
          value={data.buyerEmail}
          onChange={(e) => onChange({ buyerEmail: e.target.value })}
          error={errors.buyerEmail}
          helpText="Recibirá la factura electrónica SENIAT"
          required
        />
      </div>
    </div>
  );
};
