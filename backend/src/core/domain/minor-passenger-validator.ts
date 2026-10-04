import { Passenger } from '@core/domain/passenger.js';
import { MissingTravelAuthorizationException } from '@core/domain/exceptions/missing-travel-authorization.exception.js';
import { MissingRepresentativeDocumentException } from '@core/domain/exceptions/missing-representative-document.exception.js';
import { InvalidRepresentativeDocumentException } from '@core/domain/exceptions/invalid-representative-document.exception.js';

export interface MinorValidationInput {
  birthDate: string; // ISO format YYYY-MM-DD
  passengerDocumentId?: string;
  isTravelingWithRepresentative: boolean;
  representativeDocumentId?: string;
  hasTravelAuthorizationPresented?: boolean;
}

export interface MinorValidationResult {
  isValid: boolean;
  isMinor: boolean;
  calculatedAge: number;
  requiresAuthorizationDoc: boolean;
  authorizationVerified: boolean;
  representativeDocumentId?: string;
}

export class MinorPassengerValidator {
  public validate(
    input: MinorValidationInput,
    evaluationDate: Date = new Date(),
  ): MinorValidationResult {
    const passenger = Passenger.create(
      {
        documentId: input.passengerDocumentId?.trim() || 'V-VALIDATION-DOC',
        fullName: 'MinorValidationPassenger',
        birthDate: input.birthDate,
      },
      evaluationDate,
    );

    const calculatedAge = passenger.getCalculatedAge();
    const isMinor = calculatedAge < 18;

    if (!isMinor) {
      return {
        isValid: true,
        isMinor: false,
        calculatedAge,
        requiresAuthorizationDoc: false,
        authorizationVerified: false,
      };
    }

    if (input.isTravelingWithRepresentative) {
      const repDoc = input.representativeDocumentId
        ? input.representativeDocumentId.trim()
        : '';
      if (!repDoc) {
        throw new MissingRepresentativeDocumentException();
      }

      const passDoc = input.passengerDocumentId
        ? input.passengerDocumentId.trim()
        : '';
      if (passDoc && repDoc === passDoc) {
        throw new InvalidRepresentativeDocumentException(
          'La cédula del representante no puede ser idéntica a la del menor.',
        );
      }

      return {
        isValid: true,
        isMinor: true,
        calculatedAge,
        requiresAuthorizationDoc: false,
        authorizationVerified: false,
        representativeDocumentId: repDoc,
      };
    } else {
      const authorizationVerified = Boolean(
        input.hasTravelAuthorizationPresented,
      );
      if (!authorizationVerified) {
        throw new MissingTravelAuthorizationException();
      }

      return {
        isValid: true,
        isMinor: true,
        calculatedAge,
        requiresAuthorizationDoc: true,
        authorizationVerified: true,
      };
    }
  }
}
