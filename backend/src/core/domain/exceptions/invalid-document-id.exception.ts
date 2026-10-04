export class InvalidDocumentIdException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDocumentIdException';
  }
}
