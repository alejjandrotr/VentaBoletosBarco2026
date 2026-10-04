import React, { useState } from 'react';
import { BoxOfficeLayout } from '../templates/BoxOfficeLayout';
import { ActiveTripBanner } from '../organisms/ActiveTripBanner';
import { BuyerContactForm } from '../organisms/BuyerContactForm';
import type { BuyerFormData } from '../organisms/BuyerContactForm';
import { PassengerFormList } from '../organisms/PassengerFormList';
import { SaleSummarySidebar } from '../organisms/SaleSummarySidebar';
import { SaleSuccessModal } from '../organisms/SaleSuccessModal';
import type { IssuedTicketData } from '../organisms/SaleSuccessModal';
import type { PassengerItemData } from '../molecules/PassengerRowItem';

export const BoxOfficePage: React.FC = () => {
  // Preselected active trip data
  const [activeTrip, setActiveTrip] = useState({
    tripId: 'TRIP-1400',
    origin: 'Caracas (Terminal La Bandera)',
    destination: 'Valencia (Terminal Big Low)',
    departureTime: '14:00 (En Embarque)',
    status: 'BOARDING' as const,
    basePrice: 10.0,
    totalCapacity: 30,
    availableSeats: 10,
    unitName: 'Unidad 04 - El Llanero Express',
    busPlate: 'A12B34C',
  });

  // Buyer Form State
  const [buyerData, setBuyerData] = useState<BuyerFormData>({
    buyerDocumentId: 'V-12345678',
    buyerFullName: 'Carlos Comprador',
    buyerEmail: 'cliente@ejemplo.com',
  });

  // Passengers List State
  const [passengers, setPassengers] = useState<PassengerItemData[]>([
    {
      id: 'p-1',
      fullName: 'Carlos Comprador',
      documentId: 'V-12345678',
      birthDate: '1996-05-15', // Adult Regular
      isTravelingWithRepresentative: false,
      representativeDocumentId: '',
      hasTravelAuthorizationPresented: false,
    },
  ]);

  // Loading & Modal State
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSaleResult, setLastSaleResult] = useState<{
    orderId: string;
    buyerEmail: string;
    totalAmount: number;
    tickets: IssuedTicketData[];
    fiscalInvoiceNumber: string;
    fiscalControlNumber: string;
  } | null>(null);

  // Handlers
  const handleUpdateBuyer = (updated: Partial<BuyerFormData>) => {
    setBuyerData((prev) => ({ ...prev, ...updated }));
  };

  const handleAddPassenger = () => {
    if (passengers.length >= activeTrip.availableSeats) return;

    const newId = `p-${Date.now()}`;
    setPassengers((prev) => [
      ...prev,
      {
        id: newId,
        fullName: '',
        documentId: '',
        birthDate: '2000-01-01',
        isTravelingWithRepresentative: false,
        representativeDocumentId: '',
        hasTravelAuthorizationPresented: false,
      },
    ]);
  };

  const handleRemovePassenger = (id: string) => {
    if (passengers.length <= 1) return;
    setPassengers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePassenger = (id: string, updated: Partial<PassengerItemData>) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    );
  };

  // Validation logic
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerData.buyerEmail);
  const isBuyerValid =
    buyerData.buyerDocumentId.trim() !== '' &&
    buyerData.buyerFullName.trim() !== '' &&
    isEmailValid;

  const isPassengersValid = passengers.every((p) => {
    if (!p.fullName.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)) return false;

    // Check age
    const bDate = new Date(`${p.birthDate}T00:00:00.000Z`);
    const refDate = new Date('2026-09-13T00:00:00.000Z');
    let age = refDate.getUTCFullYear() - bDate.getUTCFullYear();
    const monthDiff = refDate.getUTCMonth() - bDate.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && refDate.getUTCDate() < bDate.getUTCDate())) {
      age--;
    }

    if (age >= 18 && !p.documentId.trim()) return false;

    // Minor validation rules
    if (age < 18) {
      if (p.isTravelingWithRepresentative) {
        if (!p.representativeDocumentId.trim()) return false;
      } else {
        if (!p.hasTravelAuthorizationPresented) return false;
      }
    }

    return true;
  });

  const isValidToSubmit = isBuyerValid && isPassengersValid && passengers.length <= activeTrip.availableSeats;

  // Confirm Sale Execution
  const handleConfirmSale = () => {
    if (!isValidToSubmit) return;
    setIsLoading(true);

    setTimeout(() => {
      const soldCount = passengers.length;
      const refDate = new Date('2026-09-13T00:00:00.000Z');
      let totalAmount = 0;

      const tickets: IssuedTicketData[] = passengers.map((p, idx) => {
        const seatNumber = 30 - activeTrip.availableSeats + idx + 1;
        const bDate = new Date(`${p.birthDate}T00:00:00.000Z`);
        let age = refDate.getUTCFullYear() - bDate.getUTCFullYear();
        const monthDiff = refDate.getUTCMonth() - bDate.getUTCMonth();
        if (monthDiff < 0 || (monthDiff === 0 && refDate.getUTCDate() < bDate.getUTCDate())) {
          age--;
        }

        let cat = 'REGULAR';
        let price = activeTrip.basePrice;
        if (age <= 3) {
          cat = 'INFANTE';
          price = 0;
        } else if (age <= 17) {
          cat = 'MENOR';
          price = activeTrip.basePrice;
        } else if (age >= 60) {
          cat = 'TERCERA_EDAD';
          price = activeTrip.basePrice * 0.5;
        }

        totalAmount += price;

        return {
          ticketId: `TICKET-${Date.now()}-${idx}`,
          seatNumber,
          passengerName: p.fullName,
          passengerCategory: cat,
          finalPrice: price,
          reusableCardToken: `CARD-${String(seatNumber).padStart(2, '0')}`,
        };
      });

      // Update active trip available seats in real-time
      setActiveTrip((prev) => ({
        ...prev,
        availableSeats: prev.availableSeats - soldCount,
      }));

      const invoiceNum = `FACT-SENIAT-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const controlNum = `CTRL-00-${Math.floor(10000000 + Math.random() * 90000000)}`;

      setLastSaleResult({
        orderId: `ORD-${Date.now()}`,
        buyerEmail: buyerData.buyerEmail,
        totalAmount,
        tickets,
        fiscalInvoiceNumber: invoiceNum,
        fiscalControlNumber: controlNum,
      });

      setIsLoading(false);
      setIsModalOpen(true);
    }, 800);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset to initial clean state for next sale
    setPassengers([
      {
        id: `p-${Date.now()}`,
        fullName: '',
        documentId: '',
        birthDate: '2000-01-01',
        isTravelingWithRepresentative: false,
        representativeDocumentId: '',
        hasTravelAuthorizationPresented: false,
      },
    ]);
  };

  return (
    <BoxOfficeLayout
      header={
        <ActiveTripBanner
          tripId={activeTrip.tripId}
          origin={activeTrip.origin}
          destination={activeTrip.destination}
          departureTime={activeTrip.departureTime}
          status={activeTrip.status}
          basePrice={activeTrip.basePrice}
          totalCapacity={activeTrip.totalCapacity}
          availableSeats={activeTrip.availableSeats}
          unitName={activeTrip.unitName}
          busPlate={activeTrip.busPlate}
        />
      }
      buyerForm={<BuyerContactForm data={buyerData} onChange={handleUpdateBuyer} />}
      passengerList={
        <PassengerFormList
          passengers={passengers}
          onChangePassenger={handleUpdatePassenger}
          onAddPassenger={handleAddPassenger}
          onRemovePassenger={handleRemovePassenger}
          availableSeats={activeTrip.availableSeats}
        />
      }
      summarySidebar={
        <SaleSummarySidebar
          basePrice={activeTrip.basePrice}
          passengers={passengers}
          onConfirmSale={handleConfirmSale}
          isLoading={isLoading}
          isValidToSubmit={isValidToSubmit}
          availableSeats={activeTrip.availableSeats}
        />
      }
      modal={
        lastSaleResult && (
          <SaleSuccessModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            orderId={lastSaleResult.orderId}
            buyerEmail={lastSaleResult.buyerEmail}
            totalAmount={lastSaleResult.totalAmount}
            tickets={lastSaleResult.tickets}
            fiscalInvoiceNumber={lastSaleResult.fiscalInvoiceNumber}
            fiscalControlNumber={lastSaleResult.fiscalControlNumber}
          />
        )
      }
    />
  );
};
