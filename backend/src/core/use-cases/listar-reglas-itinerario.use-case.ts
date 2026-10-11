import { ReglaItinerarioRepository } from '@ports/outbound/regla-itinerario-repository.port.js';
import { RutaRepository } from '@ports/outbound/ruta-repository.port.js';
import { EmbarcacionRepository } from '@ports/outbound/embarcacion-repository.port.js';
import { PuertoRepository } from '@ports/outbound/puerto-repository.port.js';
import { ReglaItinerarioResponseDTO } from '@ports/inbound/regla-itinerario.dto.js';

export interface FiltrosListarReglas {
  rutaId?: string;
  tipoAplicacion?: string;
  activo?: boolean;
}

export class ListarReglasItinerarioUseCase {
  constructor(
    private readonly reglaRepo: ReglaItinerarioRepository,
    private readonly rutaRepo: RutaRepository,
    private readonly embarcacionRepo: EmbarcacionRepository,
    private readonly puertoRepo?: PuertoRepository,
  ) {}

  public async execute(
    filtros?: FiltrosListarReglas,
  ): Promise<ReglaItinerarioResponseDTO[]> {
    let reglas = await this.reglaRepo.obtenerTodas();

    if (filtros) {
      if (filtros.rutaId !== undefined && filtros.rutaId.trim() !== '') {
        reglas = reglas.filter((r) => r.getRutaId() === filtros.rutaId);
      }
      if (filtros.tipoAplicacion !== undefined && filtros.tipoAplicacion.trim() !== '') {
        reglas = reglas.filter((r) => r.getTipoAplicacion() === filtros.tipoAplicacion);
      }
      if (filtros.activo !== undefined) {
        reglas = reglas.filter((r) => r.isActivo() === filtros.activo);
      }
    }

    // Ordenar por hora de partida ascendente
    reglas.sort((a, b) => a.getHoraPartida().localeCompare(b.getHoraPartida()));

    // Cache local de puertos y rutas para evitar consultas redundantes
    const embarcacionesMap = new Map<string, { nombre: string; codigo?: string }>();
    const rutasMap = new Map<string, string>();

    const resultado: ReglaItinerarioResponseDTO[] = [];

    for (const regla of reglas) {
      // 1. Obtener datos de la embarcación
      let embData = embarcacionesMap.get(regla.getEmbarcacionDefaultId());
      if (!embData) {
        const emb = await this.embarcacionRepo.buscarPorId(
          regla.getEmbarcacionDefaultId(),
        );
        embData = {
          nombre: emb ? emb.getNombre() : regla.getEmbarcacionDefaultId(),
          codigo: emb ? emb.getCodigo() : undefined,
        };
        embarcacionesMap.set(regla.getEmbarcacionDefaultId(), embData);
      }

      // 2. Obtener nombre amigable de la ruta
      let rutaNombre = rutasMap.get(regla.getRutaId());
      if (!rutaNombre) {
        const ruta = await this.rutaRepo.buscarPorId(regla.getRutaId());
        if (ruta) {
          if (this.puertoRepo) {
            const pOrigen = await this.puertoRepo.buscarPorId(
              ruta.getOrigenPuertoId(),
            );
            const pDestino = await this.puertoRepo.buscarPorId(
              ruta.getDestinoPuertoId(),
            );
            rutaNombre = `${pOrigen?.getNombre() || ruta.getOrigenPuertoId()} -> ${pDestino?.getNombre() || ruta.getDestinoPuertoId()}`;
          } else {
            rutaNombre = `${ruta.getOrigenPuertoId()} -> ${ruta.getDestinoPuertoId()}`;
          }
        } else {
          rutaNombre = regla.getRutaId();
        }
        rutasMap.set(regla.getRutaId(), rutaNombre);
      }

      resultado.push({
        id: regla.getId(),
        nombre: regla.getNombre(),
        tipoAplicacion: regla.getTipoAplicacion(),
        diasSemana: regla.getDiasSemana(),
        fechaEspecifica: regla.getFechaEspecifica(),
        rutaId: regla.getRutaId(),
        rutaNombre,
        horaPartida: regla.getHoraPartida(),
        embarcacionDefaultId: regla.getEmbarcacionDefaultId(),
        embarcacionNombre: embData?.nombre,
        embarcacionCodigo: embData?.codigo,
        activo: regla.isActivo(),
      });
    }

    return resultado;
  }
}
