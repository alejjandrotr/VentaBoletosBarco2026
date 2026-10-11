export class InvalidTripStatusTransitionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTripStatusTransitionException';
  }
}
