import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryReglaItinerarioRepository } from '@adapters/outbound/persistence/in-memory-regla-itinerario.repository.js';
import { InMemoryEmbarcacionRepository } from '@adapters/outbound/persistence/in-memory-embarcacion.repository.js';
import { InMemoryRutaRepository } from '@adapters/outbound/persistence/in-memory-ruta.repository.js';
import { InMemoryPuertoRepository } from '@adapters/outbound/persistence/in-memory-puerto.repository.js';
import { CrearReglaItinerarioUseCase } from './crear-regla-itinerario.use-case.js';
import { ActualizarReglaItinerarioUseCase } from './actualizar-regla-itinerario.use-case.js';
import { CambiarEstadoReglaItinerarioUseCase } from './cambiar-estado-regla-itinerario.use-case.js';
import { ListarReglasItinerarioUseCase } from './listar-reglas-itinerario.use-case.js';
import { EntityNotFoundException } from '@core/domain/exceptions/entity-not-found.exception.js';
import { InvalidItineraryRuleException } from '@core/domain/exceptions/invalid-itinerary-rule.exception.js';
import { Embarcacion } from '@core/domain/embarcacion.js';

describe('SPEC-009: Casos de Uso para Gestión de Plantillas de Itinerario', () => {
  let reglaRepo: InMemoryReglaItinerarioRepository;
  let embarcacionRepo: InMemoryEmbarcacionRepository;
  let rutaRepo: InMemoryRutaRepository;
  let puertoRepo: InMemoryPuertoRepository;

  let crearUseCase: CrearReglaItinerarioUseCase;
  let actualizarUseCase: ActualizarReglaItinerarioUseCase;
  let cambiarEstadoUseCase: CambiarEstadoReglaItinerarioUseCase;
  let listarUseCase: ListarReglasItinerarioUseCase;

  beforeEach(() => {
    // Repositorios inicializados con datos semilla limpios
    reglaRepo = new InMemoryReglaItinerarioRepository([]);
    embarcacionRepo = new InMemoryEmbarcacionRepository();
    rutaRepo = new InMemoryRutaRepository();
    puertoRepo = new InMemoryPuertoRepository();

    crearUseCase = new CrearReglaItinerarioUseCase(
      reglaRepo,
      rutaRepo,
      embarcacionRepo,
      puertoRepo,
    );
    actualizarUseCase = new ActualizarReglaItinerarioUseCase(
      reglaRepo,
      rutaRepo,
      embarcacionRepo,
      puertoRepo,
    );
    cambiarEstadoUseCase = new CambiarEstadoReglaItinerarioUseCase(reglaRepo);
    listarUseCase = new ListarReglasItinerarioUseCase(
      reglaRepo,
      rutaRepo,
      embarcacionRepo,
      puertoRepo,
    );
  });

  describe('Escenario 1: Creación exitosa de regla semanal vía caso de uso', () => {
    it('Given datos válidos para una regla semanal de lunes a viernes a las 08:00 en la ruta RUT-01, When se ejecuta CrearReglaItinerarioUseCase, Then la regla se almacena en el repositorio y retorna el DTO con su ID generado y estado activo', async () => {
      // Given
      const dto = {
        nombre: 'Salida Matutina Guanta -> Margarita',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [1, 2, 3, 4, 5],
        rutaId: 'RUT-01',
        horaPartida: '08:00',
        embarcacionDefaultId: 'EMB-01',
      };

      // When
      const resultado = await crearUseCase.execute(dto);

      // Then
      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(resultado.nombre).toBe(dto.nombre);
      expect(resultado.activo).toBe(true);
      expect(resultado.horaPartida).toBe('08:00');
      expect(resultado.embarcacionNombre).toBe('Gran Cacique Express I');
      expect(resultado.rutaNombre).toContain('Terminal Marítimo de Guanta');

      const reglaGuardada = await reglaRepo.buscarPorId(resultado.id);
      expect(reglaGuardada).not.toBeNull();
      expect(reglaGuardada?.getId()).toBe(resultado.id);
    });

    it('Permite crear exitosamente una regla para fecha específica (feriado)', async () => {
      const dto = {
        nombre: 'Viaje Especial Navidad Guanta -> Margarita',
        tipoAplicacion: 'FECHA_ESPECIFICA' as const,
        fechaEspecifica: '2026-12-25',
        rutaId: 'RUT-01',
        horaPartida: '10:00',
        embarcacionDefaultId: 'EMB-02',
      };

      const resultado = await crearUseCase.execute(dto);

      expect(resultado.tipoAplicacion).toBe('FECHA_ESPECIFICA');
      expect(resultado.fechaEspecifica).toBe('2026-12-25');
      expect(resultado.embarcacionNombre).toBe('Gran Cacique Express II');
    });
  });

  describe('Escenario 2: Rechazo al crear regla con embarcación inexistente o inactiva', () => {
    it('Given un DTO con embarcacionDefaultId = "EMB-INEXISTENTE", When se ejecuta la creación de la regla, Then se lanza EntityNotFoundException y no se persiste ninguna regla', async () => {
      // Given
      const dto = {
        nombre: 'Ruta Fantasma',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [1, 2, 3],
        rutaId: 'RUT-01',
        horaPartida: '09:00',
        embarcacionDefaultId: 'EMB-INEXISTENTE',
      };

      // When & Then
      await expect(crearUseCase.execute(dto)).rejects.toThrow(
        EntityNotFoundException,
      );

      const todas = await reglaRepo.obtenerTodas();
      expect(todas.length).toBe(0);
    });

    it('Rechaza crear una regla con una ruta inexistente lanzando EntityNotFoundException', async () => {
      const dto = {
        nombre: 'Ruta Inexistente',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [1, 2],
        rutaId: 'RUT-NO-EXISTE',
        horaPartida: '08:00',
        embarcacionDefaultId: 'EMB-01',
      };

      await expect(crearUseCase.execute(dto)).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('Rechaza asignar una embarcación que esté inactiva lanzando InvalidItineraryRuleException', async () => {
      // Guardar una embarcación inactiva
      const embInactiva = Embarcacion.create({
        id: 'EMB-VARADA',
        codigo: 'MAT-999',
        nombre: 'Lancha en Mantenimiento Mayor',
        capacidadFisica: 40,
        activo: false,
      });
      // Inyectarla en memoria
      const embRepoConInactiva = new InMemoryEmbarcacionRepository([
        embInactiva,
      ]);
      const useCaseLocal = new CrearReglaItinerarioUseCase(
        reglaRepo,
        rutaRepo,
        embRepoConInactiva,
        puertoRepo,
      );

      const dto = {
        nombre: 'Salida con lancha dañada',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [1],
        rutaId: 'RUT-01',
        horaPartida: '07:00',
        embarcacionDefaultId: 'EMB-VARADA',
      };

      await expect(useCaseLocal.execute(dto)).rejects.toThrow(
        InvalidItineraryRuleException,
      );
    });

    it('Rechaza crear dos reglas activas para la misma ruta, día y hora de partida', async () => {
      const dto1 = {
        nombre: 'Salida 1',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [1, 2, 3],
        rutaId: 'RUT-01',
        horaPartida: '08:00',
        embarcacionDefaultId: 'EMB-01',
      };
      await crearUseCase.execute(dto1);

      const dto2 = {
        nombre: 'Salida 2 que colisiona el martes (día 2)',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [2, 4],
        rutaId: 'RUT-01',
        horaPartida: '08:00',
        embarcacionDefaultId: 'EMB-02',
      };

      await expect(crearUseCase.execute(dto2)).rejects.toThrow(
        InvalidItineraryRuleException,
      );
    });
  });

  describe('Escenario 3: Actualización y desactivación de regla', () => {
    it('Given una regla existente y activa, When el administrador actualiza su estado a activo = false, Then la regla persiste actualizada y las consultas subsecuentes reflejan su nuevo estado', async () => {
      // Given
      const creada = await crearUseCase.execute({
        nombre: 'Regla de prueba',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [1, 2, 3, 4, 5],
        rutaId: 'RUT-01',
        horaPartida: '08:00',
        embarcacionDefaultId: 'EMB-01',
      });
      expect(creada.activo).toBe(true);

      // When: Desactivar con CambiarEstadoReglaItinerarioUseCase
      await cambiarEstadoUseCase.execute(creada.id, false);

      // Then
      const recuperada = await reglaRepo.buscarPorId(creada.id);
      expect(recuperada?.isActivo()).toBe(false);

      // And: Actualizar nombre y horario con ActualizarReglaItinerarioUseCase
      const actualizada = await actualizarUseCase.execute(creada.id, {
        nombre: 'Regla Modificada de la Tarde',
        horaPartida: '15:30',
      });

      expect(actualizada.nombre).toBe('Regla Modificada de la Tarde');
      expect(actualizada.horaPartida).toBe('15:30');
      expect(actualizada.activo).toBe(false);
    });

    it('Lanza EntityNotFoundException si se intenta actualizar o cambiar estado a un ID inexistente', async () => {
      await expect(
        actualizarUseCase.execute('REG-NO-EXISTE', { nombre: 'X' }),
      ).rejects.toThrow(EntityNotFoundException);

      await expect(
        cambiarEstadoUseCase.execute('REG-NO-EXISTE', true),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('Consultas y Listado de Reglas con filtros', () => {
    it('Lista todas las reglas ordenadas cronológicamente y enriquece metadatos de rutas y embarcaciones', async () => {
      await crearUseCase.execute({
        id: 'REG-TARDE',
        nombre: 'Salida Tarde',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [1, 2],
        rutaId: 'RUT-01',
        horaPartida: '16:00',
        embarcacionDefaultId: 'EMB-02',
      });
      await crearUseCase.execute({
        id: 'REG-MANANA',
        nombre: 'Salida Mañana',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [1, 2],
        rutaId: 'RUT-01',
        horaPartida: '07:30',
        embarcacionDefaultId: 'EMB-01',
      });

      const listado = await listarUseCase.execute();
      expect(listado.length).toBe(2);
      // Orden cronológico (07:30 antes de 16:00)
      expect(listado[0].horaPartida).toBe('07:30');
      expect(listado[1].horaPartida).toBe('16:00');
    });

    it('Filtra correctamente por rutaId y por estado activo', async () => {
      const r1 = await crearUseCase.execute({
        nombre: 'R1',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [1],
        rutaId: 'RUT-01',
        horaPartida: '08:00',
        embarcacionDefaultId: 'EMB-01',
      });
      await crearUseCase.execute({
        nombre: 'R2',
        tipoAplicacion: 'DIAS_SEMANA' as const,
        diasSemana: [1],
        rutaId: 'RUT-02',
        horaPartida: '09:00',
        embarcacionDefaultId: 'EMB-02',
      });

      // Desactivar r1
      await cambiarEstadoUseCase.execute(r1.id, false);

      const soloRuta1 = await listarUseCase.execute({ rutaId: 'RUT-01' });
      expect(soloRuta1.length).toBe(1);
      expect(soloRuta1[0].rutaId).toBe('RUT-01');

      const soloActivos = await listarUseCase.execute({ activo: true });
      expect(soloActivos.length).toBe(1);
      expect(soloActivos[0].rutaId).toBe('RUT-02');
    });
  });
});
