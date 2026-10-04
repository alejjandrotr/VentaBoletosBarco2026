export class InvalidBasePriceException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBasePriceException';
  }
}
