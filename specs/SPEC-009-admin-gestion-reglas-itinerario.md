# SPEC-009: API y Casos de Uso para Gestión de Plantillas de Itinerario

## 1. Metadata
- **ID:** SPEC-009
- **Título:** Casos de Uso y Endpoints Administrativos para Gestión de Reglas de Itinerario
- **Estado:** APROBADO
- **Dependencias:** SPEC-007 (Modelado de Reglas de Itinerario y Puertos/Rutas)
- **Fecha:** 2026-10-04
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
El administrador de operaciones requiere gestionar de forma flexible la programación regular de salidas de las lanchas y definir excepciones para días feriados o temporadas altas.
Estas plantillas (reglas de itinerario) deben persistirse en la base de datos para que los administradores puedan crear nuevas frecuencias, modificar horarios o embarcaciones asignadas, y activar/desactivar reglas según la estacionalidad del servicio.

---

## 3. Reglas de Negocio e Invariantes

### Reglas de Dominio:
1. **Creación y Actualización de Reglas:**
   - Se pueden registrar reglas recurrentes semanales (`DIAS_SEMANA`) y reglas por fecha festiva (`FECHA_ESPECIFICA`).
   - Al crear o actualizar una regla, se deben validar todas las invariantes de dominio definidas en SPEC-007 (hora `HH:mm` válida, ruta existente, embarcación existente y activa).
2. **Activación y Desactivación:**
   - Una regla puede desactivarse (`activo = false`) sin ser eliminada físicamente, impidiendo que el generador de viajes la use en fechas futuras.
3. **Consulta Filtrada:**
   - El administrador puede listar todas las reglas o filtrar por: `rutaId`, `tipoAplicacion` o `activo`.

### Invariantes del Dominio:
- No se puede asignar una embarcación inactiva como embarcación por defecto de una regla.
- La hora de partida debe ser única para una misma ruta en el mismo día/fecha (no pueden salir dos lanchas a la misma hora en la misma ruta bajo la misma plantilla).

---

## 4. Contratos de Entrada y Salida (Domain Ports & DTOs)

```typescript
export interface CrearReglaItinerarioDTO {
  nombre: string;
  tipoAplicacion: 'DIAS_SEMANA' | 'FECHA_ESPECIFICA';
  diasSemana?: number[];
  fechaEspecifica?: string;
  rutaId: string;
  horaPartida: string; // 'HH:mm'
  embarcacionDefaultId: string;
  activo?: boolean;
}

export interface ActualizarReglaItinerarioDTO {
  nombre?: string;
  diasSemana?: number[];
  fechaEspecifica?: string;
  rutaId?: string;
  horaPartida?: string;
  embarcacionDefaultId?: string;
  activo?: boolean;
}

export interface ReglaItinerarioResponseDTO {
  id: string;
  nombre: string;
  tipoAplicacion: string;
  diasSemana?: number[];
  fechaEspecifica?: string;
  rutaId: string;
  rutaNombre?: string;
  horaPartida: string;
  embarcacionDefaultId: string;
  embarcacionNombre?: string;
  embarcacionCodigo?: string;
  activo: boolean;
}
```

### Puertos de Entrada (Use Cases):
- `CrearReglaItinerarioUseCase.execute(dto: CrearReglaItinerarioDTO): Promise<ReglaItinerarioResponseDTO>`
- `ActualizarReglaItinerarioUseCase.execute(id: string, dto: ActualizarReglaItinerarioDTO): Promise<ReglaItinerarioResponseDTO>`
- `ListarReglasItinerarioUseCase.execute(filtros?: { rutaId?: string; activo?: boolean }): Promise<ReglaItinerarioResponseDTO[]>`
- `CambiarEstadoReglaItinerarioUseCase.execute(id: string, activo: boolean): Promise<void>`

---

## 5. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Creación exitosa de regla semanal vía caso de uso
- **Given** datos válidos para una regla semanal de lunes a viernes a las `08:00` en la ruta `RUT-01`
- **When** se ejecuta `CrearReglaItinerarioUseCase`
- **Then** la regla se almacena en el repositorio y retorna el DTO con su ID generado y estado activo.

### Escenario 2: Rechazo al crear regla con embarcación inexistente
- **Given** un DTO con `embarcacionDefaultId = 'EMB-INEXISTENTE'`
- **When** se ejecuta la creación de la regla
- **Then** se lanza `EntityNotFoundException` y no se persiste ninguna regla.

### Escenario 3: Actualización y desactivación de regla
- **Given** una regla existente y activa
- **When** el administrador actualiza su estado a `activo = false`
- **Then** la regla persiste actualizada y las consultas subsecuentes reflejan su nuevo estado.

---

## 6. Checklist de Implementación
- [ ] Casos de uso de administración (`Crear`, `Actualizar`, `Listar`, `CambiarEstado`).
- [ ] Controlador HTTP / Endpoints REST (`POST /api/itinerarios/reglas`, `GET /api/itinerarios/reglas`, `PUT /api/itinerarios/reglas/:id`, `PATCH /api/itinerarios/reglas/:id/estado`).
- [ ] Tests unitarios en Vitest para todos los casos de uso.
