import {
  CalculateFareOptions,
  FareCalculationResult,
} from '@core/domain/fare-calculator.js';

export interface ICalculateFareUseCase {
  execute(options: CalculateFareOptions): FareCalculationResult;
}

export const CALCULATE_FARE_USE_CASE = Symbol('ICalculateFareUseCase');
