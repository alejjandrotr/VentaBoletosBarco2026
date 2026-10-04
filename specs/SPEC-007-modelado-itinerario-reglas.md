# SPEC-007: Modelado de Puertos, Rutas y Reglas de Itinerario

## 1. Metadata
- **ID:** SPEC-007
- **Título:** Modelado Estático de Puertos/Rutas y Gestión de Reglas de Itinerario (Semanales y Feriados)
- **Estado:** VERIFICADO
- **Dependencias:** Ninguna (Base para SPEC-008)
- **Fecha:** 2026-10-04
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
En el sistema de transporte marítimo/fluvial por lanchas punto a punto, la infraestructura física (Puertos y Rutas) es fija y altamente estable, por lo que se modela como catálogo estático/configuración inmutable.
Por otro lado, la planificación operativa requiere definir **Reglas de Itinerario (Plantillas)** que dictan las frecuencias habituales de salida:
- Salidas regulares recurrentes según los días de la semana (ej. Lunes a Viernes a las 08:00, 12:00 y 16:00).
- Salidas especiales o excepcionales para fechas específicas / feriados (ej. 25 de Diciembre o temporadas altas con itinerario exclusivo).
- Asociación de cada viaje programado a una **Embarcación (Lancha)** con su capacidad física máxima.

---

## 3. Reglas de Negocio e Invariantes

### Reglas de Dominio:
1. **Catálogo Estático de Puertos y Rutas:**
   - Cada `Puerto` posee un identificador inmutable (`id`, ej. `PTO-01`), nombre descriptivo, texto de ubicación y coordenadas geográficas (`latitud`, `longitud`).
   - Cada `Ruta` conecta un `origenPuertoId` con un `destinoPuertoId` (deben ser diferentes) y define la distancia en kilómetros (`distanciaKm > 0`).
2. **Embarcacion (Lancha):**
   - Posee un identificador único, nombre/código de la lancha y una `capacidadFisica` estricta ($> 0$).
3. **Tipos de Reglas de Itinerario:**
   - **`DIAS_SEMANA` (Regular):** Aplica a un conjunto de días de la semana (donde 0 = Domingo, 1 = Lunes, ..., 6 = Sábado).
   - **`FECHA_ESPECIFICA` (Feriado / Especial):** Aplica únicamente a una fecha calendario exacta (`YYYY-MM-DD`).
4. **Prioridad de Evaluación de Itinerario (`EvaluadorItinerario`):**
   - Si para una fecha calendario existe al menos una regla activa de tipo `FECHA_ESPECIFICA`, dicha fecha se considera **Día Especial**. En ese caso, se ignoran por completo las reglas de `DIAS_SEMANA` y se aplican únicamente las reglas de la fecha específica.
   - Si no existen reglas activas para esa fecha específica, se evalúa el día de la semana y se aplican las reglas regulares activas `DIAS_SEMANA`.
   - Las reglas con `activo = false` nunca son seleccionadas.

### Invariantes del Dominio:
- La capacidad física de una embarcación debe ser un entero estrictamente positivo (`capacidadFisica > 0`).
- En una regla de tipo `DIAS_SEMANA`, el arreglo `diasSemana` no puede estar vacío y debe contener enteros únicos en el rango `[0, 6]`.
- En una regla de tipo `FECHA_ESPECIFICA`, el campo `fechaEspecifica` es obligatorio en formato ISO (`YYYY-MM-DD`) válido.
- La hora de partida (`horaPartida`) debe ser una hora válida en formato `HH:mm` (24h: `00:00` a `23:59`).
- En una `Ruta`, el puerto de origen y el puerto de destino no pueden ser el mismo.

---

## 4. Contratos de Entrada y Salida (Domain Ports & Types)

```typescript
export interface PuertoProps {
  id: string; // ej. 'PTO-01'
  nombre: string;
  ubicacionTexto: string;
  latitud: number;
  longitud: number;
}

export interface RutaProps {
  id: string; // ej. 'RUT-01'
  origenPuertoId: string;
  destinoPuertoId: string;
  distanciaKm: number;
}

export interface EmbarcacionProps {
  id: string;
  codigo: string; // Código de matrícula / placa de la lancha (ej. 'ARSH-PE-001')
  nombre: string;
  capacidadFisica: number;
  activo?: boolean;
}

export enum TipoAplicacionItinerario {
  DIAS_SEMANA = 'DIAS_SEMANA',
  FECHA_ESPECIFICA = 'FECHA_ESPECIFICA',
}

export interface ReglaItinerarioProps {
  id: string;
  nombre: string;
  tipoAplicacion: TipoAplicacionItinerario;
  diasSemana?: number[]; // [0..6] (0 = Domingo)
  fechaEspecifica?: string; // 'YYYY-MM-DD'
  rutaId: string;
  horaPartida: string; // 'HH:mm'
  embarcacionDefaultId: string;
  activo?: boolean;
}
```

### Puertos de Salida (Repositories):
```typescript
export interface PuertoRepository {
  obtenerTodos(): Promise<Puerto[]>;
  buscarPorId(id: string): Promise<Puerto | null>;
}

export interface RutaRepository {
  obtenerTodas(): Promise<Ruta[]>;
  buscarPorId(id: string): Promise<Ruta | null>;
}

export interface EmbarcacionRepository {
  obtenerTodas(): Promise<Embarcacion[]>;
  buscarPorId(id: string): Promise<Embarcacion | null>;
}

export interface ReglaItinerarioRepository {
  obtenerTodas(): Promise<ReglaItinerario[]>;
  buscarPorId(id: string): Promise<ReglaItinerario | null>;
  guardar(regla: ReglaItinerario): Promise<void>;
}
```

---

## 5. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Creación y validación de regla regular por días de semana
- **Given** una ruta válida `RUT-01` y una embarcación `EMB-01` con capacidad 40
- **When** se define una regla de itinerario con `tipoAplicacion = DIAS_SEMANA`, `diasSemana = [1, 2, 3, 4, 5]` y hora `08:00`
- **Then** la regla se registra como activa y es aplicable de lunes a viernes.

### Escenario 2: Creación de regla especial para fecha específica (Feriado)
- **Given** una fecha festiva `'2026-12-25'`
- **When** se crea una regla con `tipoAplicacion = FECHA_ESPECIFICA`, `fechaEspecifica = '2026-12-25'` y hora `10:00`
- **Then** la regla queda asociada exclusivamente a esa fecha festiva.

### Escenario 3: Rechazo de regla con parámetros inválidos
- **Given** una solicitud de regla `DIAS_SEMANA` con arreglo de días vacío o inválido
- **When** se intenta instanciar la entidad
- **Then** el dominio lanza `InvalidItineraryRuleException`.

### Escenario 4: Evaluación de prioridad de Feriado sobre Días Regulares
- **Given** una regla regular para los viernes (`diasSemana = [5]`) a las `08:00` y una regla especial para `'2026-12-25'` (que cae viernes) a las `11:00`
- **When** el `EvaluadorItinerario` evalúa la fecha `'2026-12-25'`
- **Then** devuelve únicamente la regla especial de las `11:00`, ignorando la regla regular de las `08:00`.

### Escenario 5: Validación de Puertos y Rutas
- **Given** una ruta con origen y destino idénticos (`PTO-01` -> `PTO-01`) o distancia negativa
- **When** se intenta instanciar la entidad `Ruta`
- **Then** el dominio lanza `InvalidRouteException`.

---

## 6. Checklist de Implementación
- [x] Entidades de dominio: `Puerto`, `Ruta`, `Embarcacion`, `ReglaItinerario`.
- [x] Excepciones de dominio: `InvalidItineraryRuleException`, `InvalidRouteException`, `InvalidPortException`.
- [x] Servicio de Dominio: `EvaluadorItinerario`.
- [x] Puertos e Implementaciones de Repositorio en Memoria con Semillas iniciales (`InMemoryPuertoRepository`, `InMemoryRutaRepository`, `InMemoryEmbarcacionRepository`, `InMemoryReglaItinerarioRepository`).
- [x] Pruebas unitarias completas en Vitest pasando al 100%.
