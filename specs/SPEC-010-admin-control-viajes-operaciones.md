# SPEC-010: Panel de Control y Operaciones de Viajes del Día

## 1. Metadata
- **ID:** SPEC-010
- **Título:** Visualización, Disparador Manual de Viajes y Control de Ciclo de Vida Operativo
- **Estado:** APROBADO
- **Dependencias:** SPEC-008 (Generador de Viajes), SPEC-009 (Reglas de Itinerario)
- **Fecha:** 2026-10-04
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
El administrador de operaciones y el despachador de muelle necesitan una pantalla central de supervisión operativa para:
1. Consultar en tiempo real los viajes programados de cualquier fecha (con su aforo físico, asientos vendidos, disponibles y porcentaje de ocupación).
2. Forzar o inicializar manualmente la generación de viajes de una fecha determinada con un botón explícito ("Inicializar / Generar Viajes del Día").
3. Controlar la transición de estados de cada viaje:
   - `PROGRAMADO` -> `EN_EMBARQUE` (cuando la lancha abre el paso al muelle).
   - `EN_EMBARQUE` -> `EN_TRANSITO` (cuando la lancha zarpa del puerto).
   - `EN_TRANSITO` -> `FINALIZADO` (cuando arriba a su destino).
   - `CANCELADO` (por mal tiempo o avería mecánica).

---

## 3. Reglas de Negocio e Invariantes

### Reglas de Dominio:
1. **Inicialización Manual:**
   - Si un administrador presiona "Inicializar Viajes" para una fecha, se ejecuta el caso de uso `GenerarViajesDiaUseCase` (idempotente). Si ya existían viajes, retorna la lista sin duplicar.
2. **Monitoreo de Aforo:**
   - Cada viaje reporta: `capacidadMaxima`, `boletosVendidos`, `puestosDisponibles` y `porcentajeOcupacion` = `Math.round((boletosVendidos / capacidadMaxima) * 100)`.
3. **Transición de Estados de Operación:**
   - Solo se pueden vender boletos en estados `PROGRAMADO` y `EN_EMBARQUE`.
   - Cuando el viaje pasa a `EN_TRANSITO` o `FINALIZADO`, se bloquean nuevas ventas en taquilla.

### Invariantes del Dominio:
- No se puede cambiar a `EN_EMBARQUE` un viaje ya `FINALIZADO` o `CANCELADO`.
- Si se cancela un viaje, se deben emitir eventos de notificación de viaje cancelado.

---

## 4. Contratos de Entrada y Salida (Domain Ports & DTOs)

```typescript
export interface ViajeDetalleAdminDTO {
  id: string;
  fecha: string; // 'YYYY-MM-DD'
  horaPartida: string; // 'HH:mm'
  rutaId: string;
  rutaNombre: string;
  origenPuertoNombre: string;
  destinoPuertoNombre: string;
  embarcacionId: string;
  embarcacionCodigo: string; // Matrícula / Placa
  embarcacionNombre: string;
  capacidadMaxima: number;
  boletosVendidos: number;
  puestosDisponibles: number;
  porcentajeOcupacion: number;
  estado: 'PROGRAMADO' | 'EN_EMBARQUE' | 'EN_TRANSITO' | 'FINALIZADO' | 'CANCELADO';
}

export interface CambiarEstadoViajeDTO {
  nuevoEstado: 'PROGRAMADO' | 'EN_EMBARQUE' | 'EN_TRANSITO' | 'FINALIZADO' | 'CANCELADO';
  motivo?: string;
}
```

### Puertos de Entrada (Use Cases):
- `ConsultarViajesPorFechaUseCase.execute(fecha: string): Promise<ViajeDetalleAdminDTO[]>`
- `InicializarViajesFechaUseCase.execute(fecha: string): Promise<ViajeDetalleAdminDTO[]>`
- `CambiarEstadoViajeUseCase.execute(viajeId: string, dto: CambiarEstadoViajeDTO): Promise<ViajeDetalleAdminDTO>`

---

## 5. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Inicialización manual de viajes desde la pantalla administrativa
- **Given** una fecha `'2026-10-15'` sin viajes generados aún
- **When** el administrador presiona el botón "Inicializar Viajes del Día"
- **Then** el sistema evalúa las reglas, genera los viajes en base de datos y los retorna listos para visualización.

### Escenario 2: Cambio de estado a En Embarque
- **Given** un viaje en estado `PROGRAMADO`
- **When** el operador de muelle cambia el estado a `EN_EMBARQUE`
- **Then** el viaje actualiza su estado y permite seguir recibiendo pasajeros hasta zarpar.

### Escenario 3: Bloqueo de ventas al cambiar a En Tránsito
- **Given** un viaje en estado `EN_EMBARQUE`
- **When** el viaje pasa a `EN_TRANSITO`
- **Then** el sistema deshabilita la venta de nuevos boletos para este viaje en taquilla.

---

## 6. Checklist de Implementación
- [ ] Casos de uso de control operativo de viajes (`ConsultarViajesPorFecha`, `InicializarViajesFecha`, `CambiarEstadoViaje`).
- [ ] Endpoints REST (`GET /api/admin/viajes?fecha=YYYY-MM-DD`, `POST /api/admin/viajes/inicializar`, `PATCH /api/admin/viajes/:id/estado`).
- [ ] Pruebas unitarias de las transiciones de estado.
