# SPEC-008: Generador Diario de Viajes Idempotente y Resolución de Itinerario

## 1. Metadata
- **ID:** SPEC-008
- **Título:** Generación Diaria de Viajes Idempotente (Disparador en Taquilla) y Resolución de Capacidad
- **Estado:** VERIFICADO
- **Dependencias:** SPEC-003 (Aforo), SPEC-004 (Selección de Viaje), SPEC-007 (Itinerarios y Reglas)
- **Fecha:** 2026-10-04
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
Para que los operadores de taquilla puedan vender boletos, el sistema debe disponer de los **Viajes Reales (Instancias Programadas)** del día corriente.
En lugar de depender exclusivamente de tareas cron nocturnas que puedan fallar en segundo plano, el sistema cuenta con un **disparador resiliente**: cuando el primer operador de taquilla inicia su jornada (o consulta los viajes del día), el sistema evalúa las reglas de itinerario vigentes y genera automáticamente los viajes del día.
Este proceso debe ser **estrictamente idempotente y tolerante a concurrencia** para evitar que múltiples cajeros abriendo sesión simultáneamente dupliquen los registros de viajes en la base de datos.

---

## 3. Reglas de Negocio e Invariantes

### Reglas de Negocio:
1. **Resolución de Reglas Aplicables:**
   - Dado un día `fecha` (formato `YYYY-MM-DD`):
     - Evaluar las reglas mediante `EvaluadorItinerario.obtenerReglasParaFecha(fecha, reglas)`.
     - Si hay reglas activas de `FECHA_ESPECIFICA` (feriado), se aplican únicamente esas.
     - En caso contrario, se aplican las reglas activas de `DIAS_SEMANA` según el día calendario.
2. **Generación e Idempotencia:**
   - Antes de crear viajes, el sistema verifica en el repositorio si ya existen viajes registrados para `fecha`.
   - Si ya existen, la operación devuelve la lista de viajes existentes sin insertar duplicados.
   - Si no existen, se instancian los viajes a partir de las reglas seleccionadas, asignando la embarcación configurada y heredando su capacidad física como capacidad total.
3. **Identificador Determinista del Viaje:**
   - El `tripId` se genera con el formato `V-YYYYMMDD-HHmm-codigoruta` (ej. `V-20261005-0800-RUT-01`).
4. **Mapeo de Capacidad y Asientos:**
   - La capacidad máxima del viaje corresponde a la `capacidadFisica` de la embarcación asignada.
   - `boletosVendidos` inicia en `0`.
   - `puestosDisponibles` se calcula dinámicamente como `capacidadMaxima - boletosVendidos`.
5. **Precio Base:**
   - Se asigna un precio base configurable (por defecto $10.00 USD o según regla/ruta).
6. **Estado Inicial:**
   - Todo viaje recién generado adquiere el estado `SCHEDULED` (`PROGRAMADO`).

### Invariantes del Dominio:
- No pueden existir dos viajes activos con el mismo `tripId` para una misma fecha, hora y ruta.
- La capacidad física de la unidad debe heredarse fielmente sin sobreventa inicial.

---

## 4. Contratos de Entrada y Salida (Domain Ports & Types)

```typescript
export interface GenerarViajesDiaInput {
  fecha: string; // 'YYYY-MM-DD'
  precioBasePorDefecto?: number; // Opcional, por defecto 10.00
}

export interface GenerarViajesDiaOutput {
  fecha: string;
  viajes: Trip[];
  totalViajes: number;
  esRecienGenerado: boolean;
}
```

### Puertos de Salida Requeridos:
- `TripRepository`:
  - `findByDate(fecha: string): Promise<Trip[]>`
  - `findById(tripId: string): Promise<Trip | null>`
  - `save(trip: Trip): Promise<void>`
  - `saveMany(trips: Trip[]): Promise<void>`
- `ReglaItinerarioRepository`:
  - `obtenerTodas(): Promise<ReglaItinerario[]>`
- `RutaRepository`:
  - `buscarPorId(id: string): Promise<Ruta | null>`
- `PuertoRepository`:
  - `buscarPorId(id: string): Promise<Puerto | null>`
- `EmbarcacionRepository`:
  - `buscarPorId(id: string): Promise<Embarcacion | null>`

---

## 5. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Generación automática de viajes para un día regular de semana
- **Given** reglas regulares de lunes a viernes con salidas a las `08:00` y `14:00` en la ruta `RUT-01`
- **When** se solicita generar los viajes para el lunes `'2026-10-05'` y no existen viajes previos
- **Then** el sistema genera 2 viajes `Trip` con estado `SCHEDULED`, IDs `V-20261005-0800-RUT-01` y `V-20261005-1400-RUT-01`, los persiste y retorna `esRecienGenerado = true`.

### Escenario 2: Prioridad de fecha específica sobre regla regular (Feriado)
- **Given** reglas regulares para los viernes a las `08:00`, `14:00` y una regla especial para el viernes `'2026-12-25'` con salida única a las `11:00`
- **When** se solicita generar los viajes para el `'2026-12-25'`
- **Then** se genera únicamente el viaje de las `11:00` (`V-20261225-1100-RUT-01`), omitiendo las salidas regulares.

### Escenario 3: Idempotencia ante consultas o aperturas concurrentes
- **Given** que los viajes para la fecha `'2026-10-05'` ya fueron generados previamente
- **When** otro cajero o proceso invoca la generación de viajes para la misma fecha `'2026-10-05'`
- **Then** el sistema retorna los viajes existentes en base de datos sin duplicarlos y con `esRecienGenerado = false`.

---

## 6. Checklist de Implementación
- [x] Ampliación de `TripRepository` / `InMemoryTripRepository` con `findByDate` y `saveMany`.
- [x] Enriquecimiento de `Trip` con campos de trazabilidad si aplica (`reglaItinerarioId`, `rutaId`).
- [x] Caso de uso `GenerarViajesDiaUseCase` con integración a `EvaluadorItinerario`.
- [x] Tests unitarios en Vitest cubriendo todos los escenarios BDD de generación e idempotencia.
