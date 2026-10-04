import { IValidateMinorPassengerUseCase } from '@ports/inbound/validate-minor-passenger.port.js';
import {
  MinorPassengerValidator,
  MinorValidationInput,
  MinorValidationResult,
} from '@core/domain/minor-passenger-validator.js';

export class ValidateMinorPassengerUseCase
  implements IValidateMinorPassengerUseCase
{
  private readonly validator: MinorPassengerValidator;

  constructor() {
    this.validator = new MinorPassengerValidator();
  }

  public execute(
    input: MinorValidationInput,
    evaluationDate?: Date,
  ): MinorValidationResult {
    return this.validator.validate(input, evaluationDate);
  }
}
