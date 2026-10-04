import {
  MinorValidationInput,
  MinorValidationResult,
} from '@core/domain/minor-passenger-validator.js';

export interface IValidateMinorPassengerUseCase {
  execute(
    input: MinorValidationInput,
    evaluationDate?: Date,
  ): MinorValidationResult;
}

export const VALIDATE_MINOR_PASSENGER_USE_CASE = Symbol(
  'IValidateMinorPassengerUseCase',
);
