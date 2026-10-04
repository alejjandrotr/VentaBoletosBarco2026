import { ICalculateFareUseCase } from '@ports/inbound/calculate-fare.port.js';
import {
  CalculateFareOptions,
  FareCalculationResult,
  FareCalculator,
} from '@core/domain/fare-calculator.js';

export class CalculateFareUseCase implements ICalculateFareUseCase {
  private readonly fareCalculator: FareCalculator;

  constructor() {
    this.fareCalculator = new FareCalculator();
  }

  public execute(options: CalculateFareOptions): FareCalculationResult {
    return this.fareCalculator.calculate(options);
  }
}
