# SPEC-005: Integración Fiscal Electrónica (SENIAT) y Notificación por Correo

## 1. Metadata
- **ID:** SPEC-005
- **Título:** Emisión de Factura Fiscal Electrónica (SENIAT) y Despacho Digital por Correo
- **Estado:** VERIFICADO
- **Dependencias:** SPEC-004 (Venta en Taquilla)
- **Fecha:** 2026-09-13
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
Una vez confirmada la venta en taquilla, la normativa fiscal venezolana (SENIAT) exige la emisión del comprobante fiscal correspondiente bajo las providencias de facturación electrónica. Dado que en taquilla no se imprime papel físico (los pasajeros usan tarjetas reusables de plástico), la factura electrónica y su constancia digital deben ser enviadas directamente al correo electrónico suministrado por el comprador/cliente.
- **Diseño Hexagonal:** La integración con el SENIAT y con el servicio de correo electrónico se maneja a través de **Puertos de Salida (Outbound Ports)**, lo cual permite operar en modo Sandbox/Simulado durante las pruebas y cambiar a la API real o proveedor autorizado del SENIAT sin modificar el núcleo de la aplicación.

---

## 3. Reglas de Negocio e Invariantes

### Reglas Fiscales (SENIAT):
1. **Generación de Factura Fiscal:**
   - La factura debe contener: Número de Factura, Número de Control Fiscal, Fecha y Hora de emisión, Datos fiscales del emisor (RIF, Razón Social) y del receptor (Cédula/RIF, Nombre, Correo).
   - Desglose del monto exento / gravado e IVA (según aplique al transporte terrestre interurbano o urbano conforme a la ley).
2. **Resiliencia y Asincronía:**
   - Si el servicio fiscal del SENIAT presenta lentitud o caída temporal, el dominio debe contemplar una cola de reintentos o registro en estado `PENDING_FISCAL_SYNC` para no bloquear el abordaje físico inmediato de los pasajeros en taquilla.
3. **Notificación por Correo Electrónico:**
   - Una vez generada la factura fiscal electrónica, se despacha automáticamente un correo al cliente con el resumen de la compra, el desglose de pasajes, el número de control fiscal y el PDF o enlace de la factura digital.
   - Si el correo del comprador no tiene un formato RFC válido, el sistema debe alertar antes de confirmar la compra.

### Invariantes del Dominio:
- Ninguna factura puede emitirse con un monto negativo o con un número de control fiscal duplicado.
- El correo electrónico del comprador debe ser válido y obligatorio si se requiere entrega electrónica.

---

## 4. Contratos de Entrada y Salida (Ports & DTOs)

### Puertos de Salida (Outbound Ports):

```typescript
export interface FiscalInvoiceRequest {
  orderId: string;
  clientDocumentId: string;
  clientName: string;
  clientEmail: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
}

export interface FiscalInvoiceResponse {
  fiscalInvoiceNumber: string;
  fiscalControlNumber: string;
  fiscalDate: Date;
  digitalSignature: string;
  status: 'AUTHORIZED' | 'PENDING' | 'REJECTED';
}

/**
 * Puerto de Salida para el Proveedor Fiscal (SENIAT / Imprenta Digital)
 */
export interface FiscalInvoiceProviderPort {
  issueElectronicInvoice(request: FiscalInvoiceRequest): Promise<FiscalInvoiceResponse>;
}

/**
 * Puerto de Salida para el Envío de Correo Electrónico
 */
export interface EmailNotificationPort {
  sendInvoiceEmail(
    recipientEmail: string,
    recipientName: string,
    invoiceData: FiscalInvoiceResponse,
    orderDetails: FiscalInvoiceRequest
  ): Promise<boolean>;
}
```

---

## 5. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Emisión fiscal exitosa y envío de correo
- **Given** una orden de venta de pasajes confirmada por 20.00 USD con correo "viajero@example.com".
- **When** se ejecuta el caso de uso de facturación.
- **Then** el `FiscalInvoiceProviderPort` retorna un número de factura y número de control válidos.
- **And** el `EmailNotificationPort` envía el correo con la factura adjunta a "viajero@example.com".
- **And** el estado de la venta se actualiza a `INVOICED_AND_DELIVERED`.

### Escenario 2: Falla temporal del servicio fiscal (Fallback / Contingencia)
- **Given** que el servidor de la entidad fiscal no responde (Timeout).
- **When** se intenta emitir la factura electrónica.
- **Then** la orden de venta no se pierde; se registra en estado `PENDING_FISCAL_RETRY`.
- **And** se programa un reintento en segundo plano.

### Escenario 3: Rechazo por correo electrónico inválido
- **Given** un comprador con correo "correo-invalido-sin-arroba".
- **When** se intenta emitir la factura.
- **Then** el sistema arroja `InvalidEmailException`.

---

## 6. Plan de Pruebas Automatizadas
1. `FiscalInvoiceUseCase.spec.ts`:
   - Pruebas utilizando un `MockFiscalInvoiceProviderPort` y un `MockEmailNotificationPort`.
   - Simulación de respuesta exitosa de facturación.
   - Simulación de fallo de red en el proveedor fiscal y activación de contingencia.
2. `EmailNotificationAdapter.spec.ts`:
   - Prueba unitaria de formateo de plantilla HTML de factura para el cliente.

---

## 7. Checklist de Evaluación y Criterio de "Done"
- [x] Especificación aprobada por el evaluador.
- [x] Puertos `FiscalInvoiceProviderPort` y `EmailNotificationPort` definidos en `backend/src/ports/outbound/`.
- [x] Adaptador en memoria / sandbox implementado para pruebas locales.
- [x] Casos de uso y tests BDD completados y pasando.
