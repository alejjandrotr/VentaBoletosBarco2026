export class MissingRepresentativeDocumentException extends Error {
  constructor(passengerNameOrId?: string) {
    super(
      `El menor ${passengerNameOrId || ''} viaja con su representante, pero no se ingresó la cédula del mismo.`.trim(),
    );
    this.name = 'MissingRepresentativeDocumentException';
  }
}
