# SPEC-003: Control de Capacidad y Aforo de Unidades de Transporte

## 1. Metadata
- **ID:** SPEC-003
- **Título:** Control de Aforo y Límite de Capacidad por Medio de Transporte
- **Estado:** VERIFICADO
- **Dependencias:** SPEC-001 (Modelado de Viajeros)
- **Fecha:** 2026-09-13
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
Cada unidad de transporte (autobús, microbús, van) asignada a una ruta tiene una capacidad fija de puestos o asientos autorizados. Para evitar sobreventa (overbooking) e infracciones a las leyes viales y de seguridad ciudadana, el sistema debe garantizar que bajo ninguna circunstancia se vendan más boletos que la capacidad disponible del vehículo asignado al viaje.

---

## 3. Reglas de Negocio e Invariantes

### Reglas de Negocio:
1. **Capacidad Fija:** Cada medio de transporte posee una capacidad total (`totalCapacity`) inmutable durante el viaje (ej. 32 puestos).
2. **Ocupación Actual:** El viaje mantiene un contador de boletos ya vendidos (`soldSeats`).
3. **Puestos Disponibles:** Se calculan en todo momento como:
   $$\text{availableSeats} = \text{totalCapacity} - \text{soldSeats}$$
4. **Infantes:** Los infantes (0 a 3 años) que no ocupan asiento individual pueden o no descontar aforo según la política de la empresa (por defecto, solo quienes pagan asiento o ocupan plaza física descuentan asiento; los viajeros con asiento asignado descuentan 1 cupo).
5. **Validación de Cupo:**
   - Si una orden de compra solicita $K$ boletos con asiento y $K \le \text{availableSeats}$, la orden es admitida y los asientos se descuentan.
   - Si $K > \text{availableSeats}$, la operación debe ser **rechazada en su totalidad** (no se venden pasajes parciales del grupo).

### Invariantes del Dominio:
- La capacidad total debe ser mayor a cero ($\text{totalCapacity} > 0$).
- En ningún momento la cantidad de asientos vendidos puede superar la capacidad total:
  $$\text{soldSeats} \le \text{totalCapacity}$$
- Si $\text{availableSeats} < 0$, el estado del viaje es inconsistente y debe lanzar `CorruptedTripCapacityException`.
- Si se solicitan más asientos de los disponibles, el sistema DEBE lanzar `CapacityExceededException`.

---

## 4. Contratos de Entrada y Salida (Domain Ports & Types)

```typescript
export interface TransportUnit {
  id: string;
  unitName: string;       // Nombre o número comercial de la unidad (ej. "Unidad 04", "El Llanero Express")
  plateNumber: string;    // Placa del autobús
  model: string;          // Modelo / Fabricante
  totalCapacity: number;  // Capacidad de asientos (ej. 32)
}

export interface TripCapacitySnapshot {
  tripId: string;
  transportUnit: TransportUnit;
  totalCapacity: number;
  soldSeats: number;
  availableSeats: number;
  isFull: boolean;
}

export interface ReserveSeatsInput {
  tripId: string;
  seatsToReserve: number;
}

export class CapacityExceededException extends Error {
  constructor(public readonly requested: number, public readonly available: number) {
    super(`No hay suficiente capacidad disponible. Solicitados: ${requested}, Disponibles: ${available}.`);
    this.name = 'CapacityExceededException';
  }
}
```

---

## 5. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Venta exitosa dentro de la capacidad disponible
- **Given** un viaje con un autobús de capacidad de 30 asientos.
- **And** se han vendido previamente 20 asientos (quedan 10 disponibles).
- **When** una persona solicita comprar 3 boletos en taquilla.
- **Then** la solicitud es aprobada.
- **And** el viaje pasa a tener 23 asientos vendidos y 7 asientos disponibles.

### Escenario 2: Intento de compra que excede el aforo disponible
- **Given** un viaje con capacidad total de 20 asientos.
- **And** se han vendido 18 asientos (quedan 2 disponibles).
- **When** un cliente solicita comprar 3 boletos para su grupo familiar.
- **Then** el sistema arroja `CapacityExceededException`.
- **And** la venta es rechazada.
- **And** la cantidad de asientos vendidos se mantiene inalterada en 18.

### Escenario 3: Venta hasta agotar exactamente la capacidad
- **Given** un viaje con 4 asientos disponibles.
- **When** se solicita la compra de exactamente 4 boletos.
- **Then** la venta es aprobada.
- **And** los asientos disponibles quedan en 0.
- **And** el estado del viaje se marca como `isFull = true`.

### Escenario 4: Intento de compra en un viaje agotado (Lleno)
- **Given** un viaje con 0 asientos disponibles (`isFull = true`).
- **When** se intenta comprar 1 boleto.
- **Then** el sistema rechaza la solicitud de inmediato arrojando `CapacityExceededException` (solicitados: 1, disponibles: 0).

---

## 6. Plan de Pruebas Automatizadas
1. `TripCapacity.spec.ts`:
   - Pruebas unitarias de reserva de cupos incremental.
   - Pruebas de borde al llegar exactamente a la capacidad máxima.
   - Pruebas de rechazo con excepción cuando se intenta sobrepasar el aforo.
   - Verificación de no modificación del estado interno ante excepciones.

---

## 7. Checklist de Evaluación y Criterio de "Done"
- [x] Especificación aprobada por el evaluador.
- [x] Entidad de dominio `TripCapacity` implementada en `backend/src/core/domain/`.
- [x] Casos de prueba BDD ejecutados y pasando al 100%.
- [x] Control de concurrencia e invariantes de aforo garantizados.
