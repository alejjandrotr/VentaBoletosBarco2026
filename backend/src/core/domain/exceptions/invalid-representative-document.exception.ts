export class InvalidRepresentativeDocumentException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRepresentativeDocumentException';
  }
}
