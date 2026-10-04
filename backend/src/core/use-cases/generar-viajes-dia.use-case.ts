import { ITripRepository } from '@ports/outbound/trip-repository.port.js';
import { ReglaItinerarioRepository } from '@ports/outbound/regla-itinerario-repository.port.js';
import { RutaRepository } from '@ports/outbound/ruta-repository.port.js';
import { PuertoRepository } from '@ports/outbound/puerto-repository.port.js';
import { EmbarcacionRepository } from '@ports/outbound/embarcacion-repository.port.js';
import { EvaluadorItinerario } from '@core/domain/evaluador-itinerario.js';
import { Trip, TripStatus } from '@core/domain/trip.js';

export interface GenerarViajesDiaInput {
  fecha: string; // 'YYYY-MM-DD'
  precioBasePorDefecto?: number;
}

export interface GenerarViajesDiaOutput {
  fecha: string;
  viajes: Trip[];
  totalViajes: number;
  esRecienGenerado: boolean;
}

export class GenerarViajesDiaUseCase {
  constructor(
    private readonly tripRepository: ITripRepository,
    private readonly reglaItinerarioRepository: ReglaItinerarioRepository,
    private readonly rutaRepository: RutaRepository,
    private readonly puertoRepository: PuertoRepository,
    private readonly embarcacionRepository: EmbarcacionRepository,
    private readonly evaluadorItinerario: EvaluadorItinerario = new EvaluadorItinerario(),
  ) {}

  public async execute(input: GenerarViajesDiaInput): Promise<GenerarViajesDiaOutput> {
    const { fecha } = input;
    const precioBase =
      input.precioBasePorDefecto !== undefined ? input.precioBasePorDefecto : 10.0;

    // 1. Verificar idempotencia: si ya existen viajes para la fecha, devolverlos directamente
    const viajesExistentes = await this.tripRepository.findByDate(fecha);
    if (viajesExistentes.length > 0) {
      return {
        fecha,
        viajes: viajesExistentes,
        totalViajes: viajesExistentes.length,
        esRecienGenerado: false,
      };
    }

    // 2. Obtener todas las reglas activas y evaluar las aplicables para la fecha
    const todasLasReglas = await this.reglaItinerarioRepository.obtenerTodas();
    const reglasAplicables = this.evaluadorItinerario.obtenerReglasParaFecha(
      fecha,
      todasLasReglas,
    );

    if (reglasAplicables.length === 0) {
      return {
        fecha,
        viajes: [],
        totalViajes: 0,
        esRecienGenerado: true,
      };
    }

    // 3. Instanciar los viajes correspondientes
    const nuevosViajes: Trip[] = [];
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaClean = fecha.replace(/-/g, '');

    for (const regla of reglasAplicables) {
      const ruta = await this.rutaRepository.buscarPorId(regla.getRutaId());
      const puertoOrigen = ruta
        ? await this.puertoRepository.buscarPorId(ruta.getOrigenPuertoId())
        : null;
      const puertoDestino = ruta
        ? await this.puertoRepository.buscarPorId(ruta.getDestinoPuertoId())
        : null;
      const embarcacion = await this.embarcacionRepository.buscarPorId(
        regla.getEmbarcacionDefaultId(),
      );

      const [hora, minuto] = regla.getHoraPartida().split(':').map(Number);
      const departureTime = new Date(year, month - 1, day, hora, minuto, 0);
      const horaClean = regla.getHoraPartida().replace(':', '');
      const tripId = `V-${fechaClean}-${horaClean}-${regla.getRutaId()}`;

      const nuevoViaje = Trip.create({
        tripId,
        origin: puertoOrigen?.getNombre() || ruta?.getOrigenPuertoId() || 'Origen Desconocido',
        destination: puertoDestino?.getNombre() || ruta?.getDestinoPuertoId() || 'Destino Desconocido',
        departureTime,
        status: TripStatus.SCHEDULED,
        basePrice: precioBase,
        transportUnit: {
          id: embarcacion?.getId() || 'EMB-DEFAULT',
          unitName: embarcacion?.getNombre() || 'Lancha Estándar',
          plateNumber: embarcacion?.getCodigo() || 'N/A',
          model: 'Lancha de Pasajeros',
          totalCapacity: embarcacion?.getCapacidadFisica() || 40,
        },
        soldSeats: 0,
        rutaId: regla.getRutaId(),
        reglaItinerarioId: regla.getId(),
      });

      nuevosViajes.push(nuevoViaje);
    }

    // 4. Guardar los viajes generados en el repositorio
    await this.tripRepository.saveMany(nuevosViajes);

    return {
      fecha,
      viajes: nuevosViajes,
      totalViajes: nuevosViajes.length,
      esRecienGenerado: true,
    };
  }
}
