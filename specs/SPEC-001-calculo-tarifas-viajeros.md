# SPEC-001: Modelado de Viajeros y Cálculo de Tarifas

## 1. Metadata
- **ID:** SPEC-001
- **Título:** Modelado de Viajeros y Cálculo de Tarifas por Categoría
- **Estado:** VERIFICADO
- **Dependencias:** Ninguna
- **Fecha:** 2026-09-13
- **Autor / Implementador:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
En el sistema de venta de boletos para transporte terrestre punto a punto, cada boleto tiene un precio base fijado para la ruta del viaje. Sin embargo, el costo final aplicable a cada viajero depende de su perfil demográfico (determinado mediante su fecha de nacimiento) y su condición legal, aplicando beneficios sociales o descuentos establecidos por la regulación de transporte.

---

## 3. Reglas de Negocio e Invariantes

### Reglas de Categorización:
La edad del viajero se calcula en **años cumplidos** comparando su fecha de nacimiento (`birthDate`) contra la fecha de evaluación del viaje.
1. **Adulto Regular:** Personas entre 18 y 59 años. Pagan el **100%** de la tarifa base.
2. **Tercera Edad (Adulto Mayor):** Personas de 60 años o más. Tienen derecho a una exoneración parcial del **50%** de la tarifa base.
3. **Menor de Edad (Niño/Adolescente):**
   - **Infante (0 a 3 años):** No ocupa asiento individual o tiene tarifa de infante (100% exonerado / $0, o tarifa fija simbólica).
   - **Niño / Menor Regular (4 a 17 años):** Paga el 100% de la tarifa (o porcentaje reglamentario).

### Invariantes del Dominio:
- El precio base de un viaje debe ser un valor estrictamente positivo (`precioBase > 0`).
- El precio final calculado para cualquier viajero nunca puede ser negativo (`precioCalculado >= 0`).
- La fecha de nacimiento (`birthDate`) debe ser una fecha válida en formato ISO (`YYYY-MM-DD`) en el pasado o presente.
- La edad calculada a partir de `birthDate` debe ser un entero válido en el rango de `[0, 120]` años.
- La cédula / documento de identidad debe ser un identificador válido no vacío para mayores de edad (18 años o más).

---

## 4. Contratos de Entrada y Salida (Domain Ports & Types)

### Entidades y Value Objects:
```typescript
export enum PassengerCategory {
  REGULAR = 'REGULAR',
  TERCERA_EDAD = 'TERCERA_EDAD',
  MENOR = 'MENOR',
  INFANTE = 'INFANTE'
}

export interface PassengerInput {
  documentId: string;       // Cédula o pasaporte
  fullName: string;
  birthDate: string;        // Fecha de nacimiento en formato ISO (YYYY-MM-DD)
}

export interface CalculatedFareItem {
  passenger: PassengerInput;
  calculatedAge: number;    // Edad en años cumplidos derivada de birthDate
  category: PassengerCategory;
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
}

export interface FareCalculationResult {
  items: CalculatedFareItem[];
  totalBasePrice: number;
  totalDiscount: number;
  totalToPay: number;
  passengerCount: number;
}
```

---

## 5. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Cálculo de tarifa para viajero regular
- **Given** un viaje con precio base de 10.00 USD evaluado a la fecha actual (2026-09-13).
- **When** se evalúa un viajero con `birthDate` "1996-05-15" (30 años) y cédula "V-12345678".
- **Then** su edad calculada es 30 años y su categoría asignada es `REGULAR`.
- **And** el porcentaje de descuento es 0%.
- **And** el precio final a pagar es 10.00 USD.

### Escenario 2: Cálculo con descuento de tercera edad (50%)
- **Given** un viaje con precio base de 10.00 USD evaluado a la fecha actual (2026-09-13).
- **When** se evalúa un viajero con `birthDate` "1961-02-10" (65 años) y cédula "V-3456789".
- **Then** su edad calculada es 65 años y su categoría asignada es `TERCERA_EDAD`.
- **And** el porcentaje de descuento es 50%.
- **And** el descuento aplicado es de 5.00 USD.
- **And** el precio final a pagar es 5.00 USD.

### Escenario 3: Cálculo para infante (menor a 4 años)
- **Given** un viaje con precio base de 10.00 USD evaluado a la fecha actual (2026-09-13).
- **When** se evalúa un niño con `birthDate` "2024-08-01" (2 años).
- **Then** su edad calculada es 2 años y su categoría asignada es `INFANTE`.
- **And** el precio final a pagar es 0.00 USD (exonerado).

### Escenario 4: Cálculo de grupo mixto en taquilla
- **Given** un viaje con precio base de 20.00 USD evaluado a la fecha actual (2026-09-13).
- **When** se procesa un grupo de 3 viajeros:
  - 1 Regular (`birthDate`: "1986-01-10", 40 años)
  - 1 Tercera Edad (`birthDate`: "1958-05-20", 68 años)
  - 1 Infante (`birthDate`: "2024-03-15", 2 años)
- **Then** el monto base total es 60.00 USD.
- **And** el total de descuentos es 30.00 USD (10.00 USD tercera edad + 20.00 USD infante).
- **And** el total a pagar en taquilla es 30.00 USD.

### Escenario 5: Validación de fecha de nacimiento inválida o edad fuera de rango
- **Given** un viajero con `birthDate` en el futuro ("2030-01-01") o con fecha que resulta en más de 120 años ("1890-01-01").
- **When** se intenta calcular la tarifa.
- **Then** el sistema arroja una excepción de dominio `InvalidPassengerBirthDateException`.

---

## 6. Plan de Pruebas Automatizadas
1. `Passenger.spec.ts`: Pruebas unitarias del cálculo de años cumplidos a partir de `birthDate` (casos de borde: día exacto de cumpleaños, bisiestos, formato invalidador) y determinación de categoría por edad.
2. `FareCalculator.spec.ts`: Pruebas de cálculo matemático de descuentos, subtotales y redondeos a 2 decimales para evitar problemas de coma flotante.

---

## 7. Checklist de Evaluación y Criterio de "Done"
- [x] Especificación revisada y aprobada por el usuario.
- [x] Entidades `Passenger`, `PassengerCategory` y `FareCalculator` implementadas en `backend/src/core/domain/`.
- [x] Casos de prueba unitarios escritos y pasando al 100%.
- [x] No existen dependencias externas en el cálculo de tarifas.
