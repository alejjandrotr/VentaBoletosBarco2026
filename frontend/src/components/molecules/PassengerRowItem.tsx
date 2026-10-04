import React from 'react';
import { FormField } from './FormField';
import { Badge } from '../atoms/Badge';
import { MinorAuthToggle } from './MinorAuthToggle';

export interface PassengerItemData {
  id: string;
  fullName: string;
  documentId: string;
  birthDate: string;
  calculatedAge?: number;
  category?: 'REGULAR' | 'TERCERA_EDAD' | 'MENOR' | 'INFANTE';
  isTravelingWithRepresentative: boolean;
  representativeDocumentId: string;
  hasTravelAuthorizationPresented: boolean;
}

export interface PassengerRowItemProps {
  index: number;
  data: PassengerItemData;
  onChange: (id: string, updated: Partial<PassengerItemData>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  referenceDate?: Date;
}

export const PassengerRowItem: React.FC<PassengerRowItemProps> = ({
  index,
  data,
  onChange,
  onRemove,
  canRemove,
  referenceDate = new Date('2026-09-13T00:00:00.000Z'),
}) => {
  // Compute category & calculatedAge in real-time
  let age: number | undefined;
  let category: 'REGULAR' | 'TERCERA_EDAD' | 'MENOR' | 'INFANTE' = 'REGULAR';

  if (data.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(data.birthDate)) {
    const bDate = new Date(`${data.birthDate}T00:00:00.000Z`);
    if (!isNaN(bDate.getTime())) {
      age = referenceDate.getUTCFullYear() - bDate.getUTCFullYear();
      const monthDiff = referenceDate.getUTCMonth() - bDate.getUTCMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && referenceDate.getUTCDate() < bDate.getUTCDate())
      ) {
        age--;
      }

      if (age <= 3) category = 'INFANTE';
      else if (age <= 17) category = 'MENOR';
      else if (age <= 59) category = 'REGULAR';
      else category = 'TERCERA_EDAD';
    }
  }

  const isMinor = age !== undefined && age < 18;

  const getBadgeVariant = (cat: string) => {
    switch (cat) {
      case 'INFANTE': return 'info';
      case 'TERCERA_EDAD': return 'warning';
      case 'MENOR': return 'neutral';
      default: return 'success';
    }
  };

  return (
    <div className="bg-[#F4FCFB] border border-[#ACBCBF] rounded-xl p-4 space-y-3 relative shadow-sm hover:border-[#698696] transition-all">
      <div className="flex items-center justify-between border-b border-[#ACBCBF]/60 pb-2">
        <div className="flex items-center space-x-2">
          <span className="bg-[#243C4C] text-[#F4FCFB] text-xs font-bold px-2 py-0.5 rounded-md">
            Pasajero #{index + 1}
          </span>
          {age !== undefined && (
            <span className="text-xs font-medium text-[#698696]">
              ({age} años)
            </span>
          )}
          <Badge variant={getBadgeVariant(category)}>
            {category === 'TERCERA_EDAD' ? 'Tercera Edad (50% Desc)' : category}
          </Badge>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(data.id)}
            className="text-[#698696] hover:text-rose-600 transition-colors text-xs font-medium px-2 py-1 rounded-md hover:bg-[#ACBCBF]/20 cursor-pointer"
          >
            ✕ Eliminar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField
          label="Nombre Completo"
          placeholder="Ej. Maria Pérez"
          value={data.fullName}
          onChange={(e) => onChange(data.id, { fullName: e.target.value })}
          required
        />
        <FormField
          label="Fecha de Nacimiento"
          type="date"
          value={data.birthDate}
          onChange={(e) => onChange(data.id, { birthDate: e.target.value })}
          required
        />
        <FormField
          label="Cédula / Documento"
          placeholder={isMinor ? 'Opcional si menor' : 'Ej. V-12345678'}
          value={data.documentId}
          onChange={(e) => onChange(data.id, { documentId: e.target.value })}
          required={!isMinor}
        />
      </div>

      {isMinor && (
        <MinorAuthToggle
          isTravelingWithRepresentative={data.isTravelingWithRepresentative}
          representativeDocumentId={data.representativeDocumentId}
          hasTravelAuthorizationPresented={data.hasTravelAuthorizationPresented}
          onChange={(updated) => onChange(data.id, updated)}
        />
      )}
    </div>
  );
};
