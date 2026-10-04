export class InvalidRouteException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRouteException';
  }
}
