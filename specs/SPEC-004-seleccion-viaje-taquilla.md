# SPEC-004: Gestión de Viaje Activo y Venta en Taquilla

## 1. Metadata
- **ID:** SPEC-004
- **Título:** Selección de Viaje Próximo a Salir y Proceso de Venta en Taquilla
- **Estado:** VERIFICADO
- **Dependencias:** SPEC-001 (Tarifas), SPEC-002 (Menores), SPEC-003 (Aforo)
- **Fecha:** 2026-09-13
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
En las taquillas de las terminales o puntos de control de transporte punto a punto, la operación debe ser ágil y minimizar errores humanos del cajero. Por esta razón, el sistema debe seleccionar automáticamente el **viaje actual (el próximo programado para salir)** en dicho punto.
- Las ventas solo se autorizan para el viaje activo.
- **Soporte Físico del Pasaje:** Los boletos no se imprimen en papel. La empresa utiliza tarjetas plásticas reusables identificadas por código/número que se entregan al abordar y se devuelven al descender. Por lo tanto, el sistema **no debe generar ni enviar comandos de impresión de comprobantes de pasaje**.

---

## 3. Reglas de Negocio e Invariantes

### Reglas de Negocio:
1. **Preselección de Viaje Actual:**
   - Al abrir la sesión de taquilla o consultar el estado de ventas, el sistema resuelve automáticamente el viaje con estado `PROGRAMADO` o `EMBARCANDO` cuya fecha/hora de salida sea la más próxima.
2. **Restricción de Venta Única por Viaje Activo:**
   - La cajera no puede vender pasajes para viajes cerrados, cancelados o viajes futuros más allá del próximo inmediato a salir.
3. **Datos de la Venta en Taquilla:**
   - Se recolecta la información del cliente/pagador: Cédula/Identificación, Nombre completo, Correo electrónico (destinado a la facturación electrónica).
   - Se ingresa la lista de pasajeros asociados (Cédula, Edad, y si aplica, reglas de menor de edad de SPEC-002).
4. **Asignación de Tarjeta Reusable:**
   - A cada viajero se le asocia un número de asiento y un identificador simbólico de tarjeta/token de abordaje.
5. **No Impresión Física:**
   - La respuesta del caso de uso de venta debe confirmar la emisión del pasaje y actualizar el aforo del viaje, sin desencadenar ningún proceso de impresión de tickets.

### Invariantes del Dominio:
- No se puede iniciar ni confirmar una venta si no existe un viaje activo disponible en el punto de control.
- Si el viaje activo se encuentra en estado `PARTIDO`, `CANCELADO` o `CERRADO`, el sistema DEBE rechazar la venta con `TripNotAvailableForSaleException`.
- Todos los boletos vendidos deben quedar vinculados de forma inmutable al viaje activo correspondiente.

---

## 4. Contratos de Entrada y Salida (Domain Ports & Types)

```typescript
export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  BOARDING = 'BOARDING',
  DEPARTED = 'DEPARTED',
  CANCELLED = 'CANCELLED'
}

export interface ActiveTripDto {
  tripId: string;
  origin: string;
  destination: string;
  departureTime: Date;
  status: TripStatus;
  basePrice: number;
  totalCapacity: number;
  availableSeats: number;
  busPlate: string;
  unitName: string;
}

export interface SellTicketsCommand {
  tripId: string;
  buyerDocumentId: string;
  buyerFullName: string;
  buyerEmail: string;
  passengers: {
    documentId?: string;
    fullName: string;
    birthDate: string; // Fecha de nacimiento ISO YYYY-MM-DD
    isTravelingWithRepresentative: boolean;
    representativeDocumentId?: string;
    hasTravelAuthorizationPresented?: boolean;
  }[];
}

export interface IssuedTicket {
  ticketId: string;
  seatNumber: number;
  passengerName: string;
  passengerDocumentId?: string;
  passengerCategory: string;
  finalPrice: number;
  reusableCardToken: string; // Identificador de la tarjeta reusable
}

export interface SaleOrderResult {
  orderId: string;
  tripId: string;
  buyerDocumentId: string;
  buyerEmail: string;
  issuedTickets: IssuedTicket[];
  totalAmount: number;
  status: 'CONFIRMED';
  createdAt: Date;
}
```

---

## 5. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Consulta del viaje actual en taquilla
- **Given** una estación con viajes programados a las 14:00 (en embarque) y 15:00 (programado).
- **When** la cajera abre el sistema de taquilla.
- **Then** el sistema presenta automáticamente el viaje de las 14:00 como preseleccionado.
- **And** muestra los cupos disponibles de ese autobús.

### Escenario 2: Procesamiento exitoso de venta completa
- **Given** un viaje activo a las 14:00 con 10 cupos disponibles.
- **When** se envían los datos de 2 pasajeros válidos con un comprador con correo "cliente@test.com".
- **Then** se reduce el aforo disponible a 8.
- **And** se generan 2 boletos con sus respectivos tokens de tarjeta reusable.
- **And** el sistema no ejecuta ninguna acción de impresión de pasajes.

### Escenario 3: Rechazo de venta por viaje cerrado o ya partido
- **Given** un viaje cuya hora de salida ya pasó y su estado cambió a `DEPARTED`.
- **When** se intenta emitir un boleto para dicho viaje.
- **Then** el sistema arroja `TripNotAvailableForSaleException`.
- **And** ninguna reserva ni venta es realizada.

---

## 6. Plan de Pruebas Automatizadas
1. `GetActiveTripUseCase.spec.ts`:
   - Selección correcta del viaje más próximo en estado activo.
   - Manejo de ausencia de viajes activos.
2. `SellTicketsUseCase.spec.ts`:
   - Integración del cálculo de tarifas (SPEC-001), validación de menores (SPEC-002) y aforo (SPEC-003).
   - Verificación de la no emisión de documentos impresos.

---

## 7. Checklist de Evaluación y Criterio de "Done"
- [x] Especificación aprobada por el evaluador.
- [x] Caso de uso `SellTicketsUseCase` implementado en `backend/src/core/use-cases/`.
- [x] Pruebas unitarias de orquestación de venta pasando al 100%.
