import { Trip, TripStatus } from '@core/domain/trip.js';

export type EstadoViajeAdmin =
  | 'PROGRAMADO'
  | 'EN_EMBARQUE'
  | 'EN_TRANSITO'
  | 'FINALIZADO'
  | 'CANCELADO';

export interface ViajeDetalleAdminDTO {
  id: string;
  fecha: string; // 'YYYY-MM-DD'
  horaPartida: string; // 'HH:mm'
  rutaId: string;
  rutaNombre: string;
  origenPuertoNombre: string;
  destinoPuertoNombre: string;
  embarcacionId: string;
  embarcacionCodigo: string; // Matrícula / Placa
  embarcacionNombre: string;
  capacidadMaxima: number;
  boletosVendidos: number;
  puestosDisponibles: number;
  porcentajeOcupacion: number;
  estado: EstadoViajeAdmin;
}

export interface CambiarEstadoViajeDTO {
  nuevoEstado: EstadoViajeAdmin;
  motivo?: string;
}

export function toEstadoViajeAdmin(status: TripStatus): EstadoViajeAdmin {
  switch (status) {
    case TripStatus.SCHEDULED:
      return 'PROGRAMADO';
    case TripStatus.BOARDING:
      return 'EN_EMBARQUE';
    case TripStatus.DEPARTED:
      return 'EN_TRANSITO';
    case TripStatus.FINALIZED:
      return 'FINALIZADO';
    case TripStatus.CANCELLED:
      return 'CANCELADO';
    default:
      return 'PROGRAMADO';
  }
}

export function toTripStatus(estado: EstadoViajeAdmin): TripStatus {
  switch (estado) {
    case 'PROGRAMADO':
      return TripStatus.SCHEDULED;
    case 'EN_EMBARQUE':
      return TripStatus.BOARDING;
    case 'EN_TRANSITO':
      return TripStatus.DEPARTED;
    case 'FINALIZADO':
      return TripStatus.FINALIZED;
    case 'CANCELADO':
      return TripStatus.CANCELLED;
    default:
      return TripStatus.SCHEDULED;
  }
}

export function mapTripToAdminDTO(trip: Trip): ViajeDetalleAdminDTO {
  const dt = trip.getDepartureTime();
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  const fecha = `${year}-${month}-${day}`;

  const hours = String(dt.getHours()).padStart(2, '0');
  const minutes = String(dt.getMinutes()).padStart(2, '0');
  const horaPartida = `${hours}:${minutes}`;

  const capacity = trip.getCapacity();
  const tu = trip.getTransportUnitProps();
  const maxCap = capacity.getTotalCapacity() || 1;
  const sold = capacity.getSoldSeats();
  const available = capacity.getAvailableSeats();
  const porcentaje = Math.min(100, Math.round((sold / maxCap) * 100));

  return {
    id: trip.getTripId(),
    fecha,
    horaPartida,
    rutaId: trip.getRutaId() || 'N/A',
    rutaNombre: `${trip.getOrigin()} -> ${trip.getDestination()}`,
    origenPuertoNombre: trip.getOrigin(),
    destinoPuertoNombre: trip.getDestination(),
    embarcacionId: tu.id,
    embarcacionCodigo: tu.plateNumber,
    embarcacionNombre: tu.unitName,
    capacidadMaxima: capacity.getTotalCapacity(),
    boletosVendidos: sold,
    puestosDisponibles: available,
    porcentajeOcupacion: porcentaje,
    estado: toEstadoViajeAdmin(trip.getStatus()),
  };
}

