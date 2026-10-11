import { Module } from '@nestjs/common';
import { AdminViajesController } from '@adapters/inbound/http/admin-viajes.controller.js';
import { InMemoryTripRepository } from '@adapters/outbound/persistence/in-memory-trip.repository.js';
import { ItinerariosModule } from './itinerarios.module.js';
import { GenerarViajesDiaUseCase } from '@core/use-cases/generar-viajes-dia.use-case.js';
import { ConsultarViajesPorFechaUseCase } from '@core/use-cases/consultar-viajes-por-fecha.use-case.js';
import { InicializarViajesFechaUseCase } from '@core/use-cases/inicializar-viajes-fecha.use-case.js';
import { CambiarEstadoViajeUseCase } from '@core/use-cases/cambiar-estado-viaje.use-case.js';
import { ReglaItinerarioRepository } from '@ports/outbound/regla-itinerario-repository.port.js';
import { RutaRepository } from '@ports/outbound/ruta-repository.port.js';
import { PuertoRepository } from '@ports/outbound/puerto-repository.port.js';
import { EmbarcacionRepository } from '@ports/outbound/embarcacion-repository.port.js';

// Instancia compartida para persistencia en memoria
export const tripRepoInstance = new InMemoryTripRepository();

@Module({
  imports: [ItinerariosModule],
  controllers: [AdminViajesController],
  providers: [
    {
      provide: 'ITripRepository',
      useValue: tripRepoInstance,
    },
    {
      provide: 'GenerarViajesDiaUseCase',
      useFactory: (
        reglaRepo: ReglaItinerarioRepository,
        rutaRepo: RutaRepository,
        puertoRepo: PuertoRepository,
        embarcacionRepo: EmbarcacionRepository,
      ) =>
        new GenerarViajesDiaUseCase(
          tripRepoInstance,
          reglaRepo,
          rutaRepo,
          puertoRepo,
          embarcacionRepo,
        ),
      inject: [
        'ReglaItinerarioRepository',
        'RutaRepository',
        'PuertoRepository',
        'EmbarcacionRepository',
      ],
    },
    {
      provide: 'ConsultarViajesPorFechaUseCase',
      useFactory: () => new ConsultarViajesPorFechaUseCase(tripRepoInstance),
    },
    {
      provide: 'InicializarViajesFechaUseCase',
      useFactory: (generarUseCase: GenerarViajesDiaUseCase) =>
        new InicializarViajesFechaUseCase(generarUseCase),
      inject: ['GenerarViajesDiaUseCase'],
    },
    {
      provide: 'CambiarEstadoViajeUseCase',
      useFactory: () => new CambiarEstadoViajeUseCase(tripRepoInstance),
    },
  ],
  exports: [
    'ITripRepository',
    'GenerarViajesDiaUseCase',
    'ConsultarViajesPorFechaUseCase',
    'InicializarViajesFechaUseCase',
    'CambiarEstadoViajeUseCase',
  ],
})
export class AdminViajesModule {}
