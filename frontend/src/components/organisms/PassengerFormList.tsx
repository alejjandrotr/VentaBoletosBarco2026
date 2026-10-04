import React from 'react';
import { PassengerRowItem } from '../molecules/PassengerRowItem';
import type { PassengerItemData } from '../molecules/PassengerRowItem';
import { Button } from '../atoms/Button';

export interface PassengerFormListProps {
  passengers: PassengerItemData[];
  onChangePassenger: (id: string, updated: Partial<PassengerItemData>) => void;
  onAddPassenger: () => void;
  onRemovePassenger: (id: string) => void;
  availableSeats: number;
}

export const PassengerFormList: React.FC<PassengerFormListProps> = ({
  passengers,
  onChangePassenger,
  onAddPassenger,
  onRemovePassenger,
  availableSeats,
}) => {
  const canAddMore = passengers.length < availableSeats;

  return (
    <div className="bg-white border border-[#ACBCBF] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ACBCBF]/60 pb-3">
        <div>
          <h3 className="text-base font-bold text-[#243C4C] flex items-center space-x-2">
            <span>🎟️ Pasajeros de la Orden ({passengers.length})</span>
          </h3>
          <p className="text-xs text-[#698696] mt-0.5">
            Agregue los viajeros. Las tarifas y descuentos sociales se calculan en vivo.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onAddPassenger}
          disabled={!canAddMore}
          leftIcon={<span className="text-base">+</span>}
        >
          {canAddMore ? 'Agregar Pasajero' : 'Aforo Máximo Alcanzado'}
        </Button>
      </div>

      <div className="space-y-3">
        {passengers.map((passenger, index) => (
          <PassengerRowItem
            key={passenger.id}
            index={index}
            data={passenger}
            onChange={onChangePassenger}
            onRemove={onRemovePassenger}
            canRemove={passengers.length > 1}
          />
        ))}
      </div>
    </div>
  );
};
