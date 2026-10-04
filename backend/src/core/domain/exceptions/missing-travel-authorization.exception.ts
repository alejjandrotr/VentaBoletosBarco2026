export class MissingTravelAuthorizationException extends Error {
  constructor(passengerNameOrId?: string) {
    super(
      `El menor ${passengerNameOrId || ''} no viaja con su representante y no presentó autorización de viaje válida.`.trim(),
    );
    this.name = 'MissingTravelAuthorizationException';
  }
}
