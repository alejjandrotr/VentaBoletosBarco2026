import React from 'react';
import { Button } from '../atoms/Button';
import type { PassengerItemData } from '../molecules/PassengerRowItem';

export interface SaleSummarySidebarProps {
  basePrice: number;
  passengers: PassengerItemData[];
  onConfirmSale: () => void;
  isLoading?: boolean;
  isValidToSubmit: boolean;
  availableSeats: number;
  referenceDate?: Date;
}

export const SaleSummarySidebar: React.FC<SaleSummarySidebarProps> = ({
  basePrice,
  passengers,
  onConfirmSale,
  isLoading = false,
  isValidToSubmit,
  availableSeats,
  referenceDate = new Date('2026-09-13T00:00:00.000Z'),
}) => {
  let subtotal = 0;
  let totalDiscounts = 0;
  let regularCount = 0;
  let seniorCount = 0;
  let infantCount = 0;
  let minorCount = 0;

  passengers.forEach((p) => {
    subtotal += basePrice;

    if (p.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)) {
      const bDate = new Date(`${p.birthDate}T00:00:00.000Z`);
      if (!isNaN(bDate.getTime())) {
        let age = referenceDate.getUTCFullYear() - bDate.getUTCFullYear();
        const monthDiff = referenceDate.getUTCMonth() - bDate.getUTCMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && referenceDate.getUTCDate() < bDate.getUTCDate())
        ) {
          age--;
        }

        if (age <= 3) {
          infantCount++;
          totalDiscounts += basePrice; // 100% discount
        } else if (age <= 17) {
          minorCount++;
        } else if (age >= 60) {
          seniorCount++;
          totalDiscounts += basePrice * 0.5; // 50% discount
        } else {
          regularCount++;
        }
      }
    }
  });

  const totalToPay = Math.max(0, subtotal - totalDiscounts);
  const exceedsCapacity = passengers.length > availableSeats;

  return (
    <div className="bg-white border border-[#ACBCBF] rounded-2xl p-5 shadow-lg space-y-5 sticky top-5 text-[#243C4C]">
      <div className="border-b border-[#ACBCBF]/60 pb-3">
        <h3 className="text-lg font-bold text-[#243C4C] flex items-center justify-between">
          <span>Resumen de Venta</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#698696]">Taquilla</span>
        </h3>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-[#243C4C]">
          <span>Pasajeros en Orden:</span>
          <span className="font-semibold text-[#243C4C]">{passengers.length}</span>
        </div>

        {regularCount > 0 && (
          <div className="flex justify-between text-xs text-[#698696] pl-2">
            <span>• Regular ({regularCount}):</span>
            <span className="font-medium text-[#243C4C]">${(regularCount * basePrice).toFixed(2)}</span>
          </div>
        )}
        {minorCount > 0 && (
          <div className="flex justify-between text-xs text-[#698696] pl-2">
            <span>• Menor ({minorCount}):</span>
            <span className="font-medium text-[#243C4C]">${(minorCount * basePrice).toFixed(2)}</span>
          </div>
        )}
        {seniorCount > 0 && (
          <div className="flex justify-between text-xs text-[#5289AD] pl-2 font-medium">
            <span>• Tercera Edad 50% Desc ({seniorCount}):</span>
            <span>-${(seniorCount * basePrice * 0.5).toFixed(2)}</span>
          </div>
        )}
        {infantCount > 0 && (
          <div className="flex justify-between text-xs text-[#698696] pl-2 font-medium">
            <span>• Infante 100% Exonerado ({infantCount}):</span>
            <span>-${(infantCount * basePrice).toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-[#ACBCBF]/60 pt-3 space-y-1.5">
          <div className="flex justify-between text-[#698696]">
            <span>Monto Subtotal:</span>
            <span className="font-mono text-[#243C4C]">${subtotal.toFixed(2)} USD</span>
          </div>
          {totalDiscounts > 0 && (
            <div className="flex justify-between text-[#5289AD] font-medium">
              <span>Total Descuentos Sociales:</span>
              <span className="font-mono">-${totalDiscounts.toFixed(2)} USD</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold text-[#243C4C] pt-2 border-t border-[#ACBCBF]/60">
            <span>Total a Pagar:</span>
            <span className="text-2xl font-black text-[#5289AD] font-mono">
              ${totalToPay.toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#F4FCFB] p-3 rounded-xl border border-[#ACBCBF] text-xs text-[#698696] space-y-1">
        <p className="flex items-center space-x-1 font-semibold text-[#243C4C]">
          <span>💳 Tarjeta Reusable Plástica</span>
        </p>
        <p>No se emiten tickets impresos en papel. Se asignará una tarjeta plástica reusable por viajero.</p>
      </div>

      {exceedsCapacity && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
          ⚠️ Capacidad del viaje excedida. Reduzca la cantidad de viajeros.
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full font-bold py-3.5 text-base shadow-xl"
        onClick={onConfirmSale}
        disabled={!isValidToSubmit || exceedsCapacity || isLoading}
        isLoading={isLoading}
      >
        Confirmar Venta y Facturar SENIAT
      </Button>
    </div>
  );
};
