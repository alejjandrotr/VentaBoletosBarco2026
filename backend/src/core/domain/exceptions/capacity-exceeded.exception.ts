export class CapacityExceededException extends Error {
  constructor(
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(
      `No hay suficiente capacidad disponible. Solicitados: ${requested}, Disponibles: ${available}.`,
    );
    this.name = 'CapacityExceededException';
  }
}
