export class InvalidPortException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPortException';
  }
}
