# SPEC-006: Interfaz de Usuario de Taquilla (Atomic Design)

## 1. Metadata
- **ID:** SPEC-006
- **Título:** Interfaz de Punto de Venta en Taquilla con React, Tailwind CSS y Atomic Design
- **Estado:** VERIFICADO
- **Dependencias:** SPEC-001, SPEC-002, SPEC-003, SPEC-004, SPEC-005
- **Fecha:** 2026-09-13
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
La operadora o cajera en taquilla necesita una interfaz moderna, de carga ultrarrápida y libre de distracciones que le permita atender a los clientes en cuestión de segundos. La pantalla debe:
- Mostrar prominentemente el viaje activo preseleccionado y los puestos restantes.
- Capturar los datos del comprador para la factura electrónica enviada a su correo.
- Permitir la adición rápida de viajeros con cálculo automático de tarifas y descuentos en tiempo real.
- Mostrar y exigir de manera condicional los campos de menores de edad (cédula del representante o checkbox de autorización física validada).
- Bloquear la confirmación si se excede la capacidad del vehículo.
- Confirmar la venta sin opción a impresión física de boletos (notificando que la factura fue despachada al correo).

---

## 3. Jerarquía y Desglose de Componentes (Atomic Design)

### 3.1 Átomos (`frontend/src/components/atoms/`)
- `Button.tsx`: Botón con variantes (primary, secondary, danger, ghost) y estado loading/disabled.
- `Input.tsx`: Campo de texto estilizado con foco accesible y estados de error.
- `Badge.tsx`: Etiqueta de estado para viaje (`PROGRAMADO`, `EMBARCANDO`, `LLENO`) y tipo de pasajero (`REGULAR`, `TERCERA EDAD`, `INFANTE`).
- `Checkbox.tsx`: Control de selección accesible para la confirmación de autorización de menores.
- `Typography.tsx`: Componentes para títulos, subtítulos, precios y textos de ayuda con escala tipográfica limpia.

### 3.2 Moléculas (`frontend/src/components/molecules/`)
- `FormField.tsx`: Agrupación accesible de `Label` + `Input` + `ErrorMessage`.
- `CapacityIndicator.tsx`: Barra de progreso y contador visual de puestos disponibles vs ocupados con alertas de color (verde > 50%, amarillo < 20%, rojo lleno).
- `PassengerRowItem.tsx`: Fila o tarjeta individual de pasajero que incluye Cédula, Nombre, Edad, badge de categoría calculado en vivo y eliminación.
- `MinorAuthToggle.tsx`: Componente condicional que aparece si la edad es menor de 18:
  - Radio/Switch: ¿Viaja con representante? (Sí / No).
  - Si Sí: Input para cédula del representante.
  - Si No: Checkbox obligatorio "Constancia física de autorización de viaje presentada y verificada".

### 3.3 Organismos (`frontend/src/components/organisms/`)
- `ActiveTripBanner.tsx`: Encabezado que detalla el viaje activo (Ruta, Hora, Autobús, Capacidad en vivo).
- `BuyerContactForm.tsx`: Sección de datos del cliente pagador (Cédula, Nombre, Correo para factura).
- `PassengerFormList.tsx`: Lista interactiva de pasajeros con botón para añadir viajeros y cálculo individual instantáneo.
- `SaleSummarySidebar.tsx`: Resumen de costos en tiempo real (Subtotal, Descuentos por tercera edad/infantes, Total a pagar) y botón principal "Confirmar Venta y Facturar".
- `SaleSuccessModal.tsx`: Diálogo modal que confirma la emisión, los números de asientos asignados (tarjetas reusables) y la notificación de factura electrónica enviada por correo.

### 3.4 Plantillas (`frontend/src/components/templates/`)
- `BoxOfficeLayout.tsx`: Estructura responsiva de dos columnas (Panel principal de entrada a la izquierda, barra lateral de resumen y capacidad a la derecha).

### 3.5 Páginas (`frontend/src/components/pages/`)
- `BoxOfficePage.tsx`: Vista principal que conecta el estado local, validaciones y las llamadas a los endpoints del backend.

---

## 4. Contratos de Estado y Propiedades (UI State)

```typescript
export interface PassengerFormState {
  id: string;
  fullName: string;
  documentId: string;
  age: number | '';
  isTravelingWithRepresentative: boolean;
  representativeDocumentId: string;
  hasTravelAuthorizationPresented: boolean;
}

export interface BoxOfficeFormState {
  buyerDocumentId: string;
  buyerFullName: string;
  buyerEmail: string;
  passengers: PassengerFormState[];
}
```

---

## 5. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Renderizado del viaje activo y capacidad inicial
- **Given** que la cajera accede a la aplicación de taquilla.
- **When** se carga la página principal.
- **Then** se observa el encabezado con el viaje próximo a salir y el aforo actual.

### Escenario 2: Despliegue condicional de validación de menores
- **Given** la cajera añade un nuevo pasajero.
- **When** ingresa una edad menor a 18 años (ej. 12 años).
- **Then** el componente despliega inmediatamente las opciones de representante legal y autorización de viaje.
- **And** si no se marca la autorización ni se ingresa la cédula del representante, el botón de confirmación permanece deshabilitado.

### Escenario 3: Actualización reactiva del total y descuentos
- **Given** un viaje con precio base de 15.00 USD.
- **When** se agrega un pasajero de 68 años (tercera edad).
- **Then** el resumen lateral muestra el subtotal (15.00 USD), el descuento del 50% (-7.50 USD) y el total a pagar (7.50 USD) sin recargar la página.

### Escenario 4: Bloqueo de adición de pasajeros si se alcanza la capacidad
- **Given** un autobús con solo 2 asientos disponibles.
- **When** la cajera intenta añadir un 3er pasajero.
- **Then** la interfaz emite una alerta visual de aforo excedido.
- **And** no permite procesar la venta.

---

## 6. Plan de Pruebas y Validación
1. Pruebas de renderizado de componentes atómicos con Vitest + Testing Library o Playwright.
2. Verificación de diseño responsivo y sin desbordamientos visuales usando Tailwind CSS.
3. Validación estricta de formularios y tipos TypeScript en tiempo de compilación.

---

## 7. Checklist de Evaluación y Criterio de "Done"
- [x] Especificación aprobada por el evaluador.
- [x] Jerarquía completa de Atomic Design creada en `frontend/src/components/`.
- [x] Interfaz completamente funcional y reactiva en pantalla.
- [x] Compilación limpia con `npm run build`.
