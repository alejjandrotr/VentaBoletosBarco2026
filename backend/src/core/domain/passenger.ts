import { PassengerCategory } from '@core/domain/passenger-category.enum.js';
import { InvalidPassengerBirthDateException } from '@core/domain/exceptions/invalid-passenger-birthdate.exception.js';
import { InvalidDocumentIdException } from '@core/domain/exceptions/invalid-document-id.exception.js';

export interface PassengerProps {
  documentId: string;
  fullName: string;
  birthDate: string; // ISO format (YYYY-MM-DD)
}

export class Passenger {
  private readonly documentId: string;
  private readonly fullName: string;
  private readonly birthDate: Date;
  private readonly calculatedAge: number;
  private readonly category: PassengerCategory;

  private constructor(
    props: PassengerProps,
    evaluationDate: Date = new Date(),
  ) {
    this.validateBirthDateFormat(props.birthDate);
    const parsedBirthDate = new Date(`${props.birthDate}T00:00:00.000Z`);
    if (isNaN(parsedBirthDate.getTime())) {
      throw new InvalidPassengerBirthDateException(
        `La fecha de nacimiento '${props.birthDate}' no es una fecha válida.`,
      );
    }

    const calculatedAge = this.calculateAge(parsedBirthDate, evaluationDate);
    this.validateInvariants(calculatedAge, parsedBirthDate, evaluationDate, props.documentId);

    this.documentId = props.documentId ? props.documentId.trim() : '';
    this.fullName = props.fullName ? props.fullName.trim() : '';
    this.birthDate = parsedBirthDate;
    this.calculatedAge = calculatedAge;
    this.category = this.determineCategory(calculatedAge);
  }

  public static create(props: PassengerProps, evaluationDate?: Date): Passenger {
    return new Passenger(props, evaluationDate);
  }

  private validateBirthDateFormat(dateStr: string): void {
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoRegex.test(dateStr)) {
      throw new InvalidPassengerBirthDateException(
        `Formato de fecha inválido: '${dateStr}'. Se requiere el formato YYYY-MM-DD.`,
      );
    }
  }

  private calculateAge(birthDate: Date, evalDate: Date): number {
    let age = evalDate.getUTCFullYear() - birthDate.getUTCFullYear();
    const monthDiff = evalDate.getUTCMonth() - birthDate.getUTCMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && evalDate.getUTCDate() < birthDate.getUTCDate())
    ) {
      age--;
    }
    return age;
  }

  private validateInvariants(
    age: number,
    birthDate: Date,
    evalDate: Date,
    documentId: string,
  ): void {
    if (birthDate.getTime() > evalDate.getTime() || age < 0) {
      throw new InvalidPassengerBirthDateException(
        'La fecha de nacimiento no puede ser en el futuro.',
      );
    }

    if (age > 120) {
      throw new InvalidPassengerBirthDateException(
        `La edad calculada (${age} años) supera el límite máximo de 120 años.`,
      );
    }

    if (age >= 18 && (!documentId || documentId.trim() === '')) {
      throw new InvalidDocumentIdException(
        'El documento de identidad es obligatorio para mayores de edad.',
      );
    }
  }

  private determineCategory(age: number): PassengerCategory {
    if (age <= 3) {
      return PassengerCategory.INFANTE;
    }
    if (age <= 17) {
      return PassengerCategory.MENOR;
    }
    if (age <= 59) {
      return PassengerCategory.REGULAR;
    }
    return PassengerCategory.TERCERA_EDAD;
  }

  public getDocumentId(): string {
    return this.documentId;
  }

  public getFullName(): string {
    return this.fullName;
  }

  public getBirthDate(): Date {
    return new Date(this.birthDate);
  }

  public getCalculatedAge(): number {
    return this.calculatedAge;
  }

  public getCategory(): PassengerCategory {
    return this.category;
  }
}
