export class TripNotAvailableForSaleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TripNotAvailableForSaleException';
  }
}
