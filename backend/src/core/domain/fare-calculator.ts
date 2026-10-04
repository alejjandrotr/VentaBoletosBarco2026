import { Passenger, PassengerProps } from '@core/domain/passenger.js';
import { PassengerCategory } from '@core/domain/passenger-category.enum.js';
import { InvalidBasePriceException } from '@core/domain/exceptions/invalid-base-price.exception.js';

export interface CalculatedFareItem {
  passenger: PassengerProps;
  calculatedAge: number;
  category: PassengerCategory;
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
}

export interface FareCalculationResult {
  items: CalculatedFareItem[];
  totalBasePrice: number;
  totalDiscount: number;
  totalToPay: number;
  passengerCount: number;
}

export interface CalculateFareOptions {
  basePrice: number;
  passengers: PassengerProps[];
  evaluationDate?: Date;
}

export class FareCalculator {
  public calculate(options: CalculateFareOptions): FareCalculationResult {
    const { basePrice, passengers, evaluationDate = new Date() } = options;

    if (basePrice <= 0) {
      throw new InvalidBasePriceException(
        `El precio base debe ser mayor a 0. Valor ingresado: ${basePrice}`,
      );
    }

    const items: CalculatedFareItem[] = passengers.map((pProps) => {
      const passenger = Passenger.create(pProps, evaluationDate);
      const category = passenger.getCategory();
      const calculatedAge = passenger.getCalculatedAge();

      const discountPercentage = this.getDiscountPercentage(category);
      const discountAmount = this.round(basePrice * (discountPercentage / 100));
      const finalPrice = this.round(basePrice - discountAmount);

      return {
        passenger: {
          documentId: passenger.getDocumentId(),
          fullName: passenger.getFullName(),
          birthDate: pProps.birthDate,
        },
        calculatedAge,
        category,
        basePrice: this.round(basePrice),
        discountPercentage,
        discountAmount,
        finalPrice,
      };
    });

    const totalBasePrice = this.round(items.reduce((acc, item) => acc + item.basePrice, 0));
    const totalDiscount = this.round(items.reduce((acc, item) => acc + item.discountAmount, 0));
    const totalToPay = this.round(items.reduce((acc, item) => acc + item.finalPrice, 0));

    return {
      items,
      totalBasePrice,
      totalDiscount,
      totalToPay,
      passengerCount: items.length,
    };
  }

  private getDiscountPercentage(category: PassengerCategory): number {
    switch (category) {
      case PassengerCategory.INFANTE:
        return 100;
      case PassengerCategory.TERCERA_EDAD:
        return 50;
      case PassengerCategory.REGULAR:
      case PassengerCategory.MENOR:
      default:
        return 0;
    }
  }

  private round(amount: number): number {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }
}
