export class InvalidTripCapacityException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTripCapacityException';
  }
}
