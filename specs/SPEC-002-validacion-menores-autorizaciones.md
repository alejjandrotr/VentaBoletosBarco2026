# SPEC-002: Validación de Menores de Edad y Permisos de Viaje

## 1. Metadata
- **ID:** SPEC-002
- **Título:** Validación de Pasajeros Menores de Edad y Constancia de Autorización
- **Estado:** VERIFICADO
- **Dependencias:** SPEC-001 (Modelado de Viajeros)
- **Fecha:** 2026-09-13
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
Por regulaciones legales y protección de niños, niñas y adolescentes (LOPNNA y normativas de transporte), ningún menor de edad puede viajar sin el debido resguardo legal:
- Si viaja acompañado de su representante legal (padre, madre o tutor), debe quedar registrada la identificación del representante en el pasaje.
- Si viaja solo o acompañado por un tercero que no es su representante legal, debe presentar un documento formal de autorización de viaje emitido por los padres o autoridades competentes.
- **Políticas de Taquilla:** La empresa de transporte no almacena copias digitales ni archivos de dichos permisos. El cajero/operador en taquilla es el responsable de verificar físicamente el documento y registrar en el sistema que el permiso fue presentado y validado.

---

## 3. Reglas de Negocio e Invariantes

### Reglas de Negocio:
1. **Definición de Menor:** La edad se calcula en **años cumplidos** comparando `birthDate` contra la fecha de evaluación. Toda persona con edad `< 18` años se considera menor de edad.
2. **Menor con Representante:**
   - Si se indica que viaja con su representante legal (`isTravelingWithRepresentative = true`), es **obligatorio** registrar la cédula/documento del representante (`representativeDocumentId`).
   - La cédula del representante no puede ser idéntica a la del menor (si este ya posee cédula).
3. **Menor sin Representante (Viaje Solo o con Terceros):**
   - Si no viaja con su representante (`isTravelingWithRepresentative = false`), es **obligatorio** que el operador confirme que se presentó la autorización de viaje marcando `hasTravelAuthorizationPresented = true`.
   - Si el operador marca `hasTravelAuthorizationPresented = false`, la venta para ese menor queda **estrictamente bloqueada**.
4. **Viajero Mayor de Edad:**
   - Para viajeros de 18 años o más (`age >= 18`), los campos de representante y permiso de viaje son opcionales o ignorados (`null` / `undefined`).

### Invariantes del Dominio:
- Ningún menor de edad puede tener un boleto emitido sin cumplir la condición:
  `hasRepresentativeAttached === true OR hasTravelAuthorizationPresented === true`.
- Si `isMinor === true` y `hasRepresentativeAttached === false` y `hasTravelAuthorizationPresented === false`, el sistema DEBE lanzar `MissingTravelAuthorizationException`.
- Si `isMinor === true` y `isTravelingWithRepresentative === true` y `representativeDocumentId` está vacío o ausente, el sistema DEBE lanzar `MissingRepresentativeDocumentException`.
- Si `isMinor === true`, `isTravelingWithRepresentative === true` y `representativeDocumentId === passengerDocumentId`, el sistema DEBE lanzar `InvalidRepresentativeDocumentException`.

---

## 4. Contratos de Entrada y Salida (Domain Ports & Types)

```typescript
export interface MinorValidationInput {
  birthDate: string;                            // Fecha de nacimiento ISO (YYYY-MM-DD)
  passengerDocumentId?: string;
  isTravelingWithRepresentative: boolean;
  representativeDocumentId?: string;
  hasTravelAuthorizationPresented?: boolean;    // Checkbox marcado por la cajera
}

export interface MinorValidationResult {
  isValid: boolean;
  isMinor: boolean;
  calculatedAge: number;
  requiresAuthorizationDoc: boolean;
  authorizationVerified: boolean;
  representativeDocumentId?: string;
}

// Excepciones de Dominio
export class MissingTravelAuthorizationException extends Error {
  constructor(passengerNameOrId?: string) {
    super(`El menor ${passengerNameOrId || ''} no viaja con su representante y no presentó autorización de viaje válida.`);
    this.name = 'MissingTravelAuthorizationException';
  }
}

export class MissingRepresentativeDocumentException extends Error {
  constructor(passengerNameOrId?: string) {
    super(`El menor ${passengerNameOrId || ''} viaja con su representante, pero no se ingresó la cédula del mismo.`);
    this.name = 'MissingRepresentativeDocumentException';
  }
}

export class InvalidRepresentativeDocumentException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRepresentativeDocumentException';
  }
}
```

---

## 5. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Menor que viaja con su representante legal
- **Given** un viajero nacido el "2016-09-13" (10 años).
- **And** se indica que viaja con su representante (`isTravelingWithRepresentative = true`).
- **When** se provee la cédula del representante "V-15890123".
- **Then** el viajero es validado exitosamente (`isValid = true`, `isMinor = true`).
- **And** queda asociada la cédula del representante "V-15890123".

### Escenario 2: Menor con representante pero sin cédula de este
- **Given** un viajero nacido el "2019-09-13" (7 años).
- **And** se indica que viaja con su representante.
- **When** el campo de cédula del representante se deja vacío o sólo espacios.
- **Then** el sistema arroja `MissingRepresentativeDocumentException`.
- **And** no se permite emitir el boleto.

### Escenario 3: Menor que viaja solo con autorización validada por cajera
- **Given** un adolescente nacido el "2011-09-13" (15 años) que viaja solo (`isTravelingWithRepresentative = false`).
- **When** la cajera valida el documento físico y marca `hasTravelAuthorizationPresented = true`.
- **Then** el viajero es validado exitosamente (`isValid = true`, `authorizationVerified = true`).
- **And** se registra que la autorización fue verificada en taquilla.

### Escenario 4: Menor que viaja solo SIN autorización
- **Given** un adolescente nacido el "2011-09-13" (15 años) que viaja solo.
- **When** la cajera marca `hasTravelAuthorizationPresented = false` o no lo suministra.
- **Then** el sistema arroja `MissingTravelAuthorizationException`.
- **And** la venta queda bloqueada para ese menor.

### Escenario 5: Viajero mayor de edad
- **Given** un viajero nacido el "2001-09-13" (25 años).
- **When** se evalúa su documentación.
- **Then** `isMinor = false` y no se exige cédula de representante ni autorización de viaje.

### Escenario 6: Cédula de representante igual a la del menor
- **Given** un menor de 16 años con cédula "V-30111222".
- **When** se ingresa la misma cédula "V-30111222" como representante.
- **Then** el sistema arroja `InvalidRepresentativeDocumentException`.

---

## 6. Plan de Pruebas Automatizadas
1. `MinorPassengerValidator.spec.ts`:
   - Pruebas para menores acompañados con y sin cédula de representante.
   - Pruebas para menores solos con flag de permiso activo e inactivo.
   - Pruebas de no aplicación de reglas de menores para adultos.
   - Pruebas de validación de cédulas idénticas.

---

## 7. Checklist de Evaluación y Criterio de "Done"
- [x] Especificación aprobada por el evaluador.
- [x] Implementado validador de dominio puro en `backend/src/core/domain/`.
- [x] Pruebas unitarias de dominio pasando al 100%.
- [x] Sin almacenamiento de archivos ni persistencia de documentos no requerida.

