import { Module } from '@nestjs/common';
import { ReglasItinerarioController } from '@adapters/inbound/http/reglas-itinerario.controller.js';
import { InMemoryReglaItinerarioRepository } from '@adapters/outbound/persistence/in-memory-regla-itinerario.repository.js';
import { InMemoryRutaRepository } from '@adapters/outbound/persistence/in-memory-ruta.repository.js';
import { InMemoryEmbarcacionRepository } from '@adapters/outbound/persistence/in-memory-embarcacion.repository.js';
import { InMemoryPuertoRepository } from '@adapters/outbound/persistence/in-memory-puerto.repository.js';
import { CrearReglaItinerarioUseCase } from '@core/use-cases/crear-regla-itinerario.use-case.js';
import { ActualizarReglaItinerarioUseCase } from '@core/use-cases/actualizar-regla-itinerario.use-case.js';
import { CambiarEstadoReglaItinerarioUseCase } from '@core/use-cases/cambiar-estado-regla-itinerario.use-case.js';
import { ListarReglasItinerarioUseCase } from '@core/use-cases/listar-reglas-itinerario.use-case.js';

// Singleton instances for in-memory persistence across requests
const reglaRepoInstance = new InMemoryReglaItinerarioRepository();
const rutaRepoInstance = new InMemoryRutaRepository();
const embarcacionRepoInstance = new InMemoryEmbarcacionRepository();
const puertoRepoInstance = new InMemoryPuertoRepository();

@Module({
  controllers: [ReglasItinerarioController],
  providers: [
    {
      provide: 'ReglaItinerarioRepository',
      useValue: reglaRepoInstance,
    },
    {
      provide: 'RutaRepository',
      useValue: rutaRepoInstance,
    },
    {
      provide: 'EmbarcacionRepository',
      useValue: embarcacionRepoInstance,
    },
    {
      provide: 'PuertoRepository',
      useValue: puertoRepoInstance,
    },
    {
      provide: 'CrearReglaItinerarioUseCase',
      useFactory: () =>
        new CrearReglaItinerarioUseCase(
          reglaRepoInstance,
          rutaRepoInstance,
          embarcacionRepoInstance,
          puertoRepoInstance,
        ),
    },
    {
      provide: 'ActualizarReglaItinerarioUseCase',
      useFactory: () =>
        new ActualizarReglaItinerarioUseCase(
          reglaRepoInstance,
          rutaRepoInstance,
          embarcacionRepoInstance,
          puertoRepoInstance,
        ),
    },
    {
      provide: 'CambiarEstadoReglaItinerarioUseCase',
      useFactory: () =>
        new CambiarEstadoReglaItinerarioUseCase(reglaRepoInstance),
    },
    {
      provide: 'ListarReglasItinerarioUseCase',
      useFactory: () =>
        new ListarReglasItinerarioUseCase(
          reglaRepoInstance,
          rutaRepoInstance,
          embarcacionRepoInstance,
          puertoRepoInstance,
        ),
    },
  ],
  exports: [
    'ReglaItinerarioRepository',
    'RutaRepository',
    'EmbarcacionRepository',
    'PuertoRepository',
    'CrearReglaItinerarioUseCase',
    'ActualizarReglaItinerarioUseCase',
    'CambiarEstadoReglaItinerarioUseCase',
    'ListarReglasItinerarioUseCase',
  ],
})
export class ItinerariosModule {}
