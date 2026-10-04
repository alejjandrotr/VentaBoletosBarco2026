---
name: spec-driven-development
description: >-
  Metodología Spec-Driven Development (SDD / SCDD) para la descomposición y desarrollo
  de requerimientos en micro-especificaciones atómicas, contratos de dominio, criterios
  de aceptación BDD (Given-When-Then) y evaluación secuencial sin saltar etapas.
---

# Skill: Spec-Driven Development (SDD / SCDD)

Esta habilidad define el estándar riguroso para desarrollar software guiado por especificaciones (**SDD - Spec-Driven Development** o **SCDD - Specification-Centric Design & Development**).

---

## 1. Principios Fundamentales del SDD

1. **La Especificación es la Única Fuente de Verdad:**
   - No se escribe código de producción, endpoints ni componentes de UI sin una especificación formal aprobada previamente en la carpeta `specs/`.
2. **Micro-Especificaciones Atómicas (Small Specs):**
   - Nunca crear una macro-especificación que intente resolver todo el sistema a la vez.
   - Cada especificación se enfoca en **una sola regla de negocio**, invariante o flujo de interacción concreto.
   - Nomenclatura: `SPEC-XXX-nombre-descriptivo.md` (ej. `SPEC-001-calculo-tarifas-viajeros.md`).
3. **Ciclo de Vida Estricto por Especificación:**
   ```
   [ Redacción de Spec ] -> [ Evaluación & Aprobación ] -> [ Tests de Contrato ] -> [ Implementación ] -> [ Verificación / Done ]
   ```
4. **Desacoplamiento Tecnológico:**
   - La especificación define el comportamiento del negocio en términos de dominio puro, entradas, salidas y restricciones, independiente de la base de datos o frameworks.

---

## 2. Estructura Obligatoria de cada Especificación (`SPEC-XXX.md`)

Cada archivo en `specs/` debe contener:

```markdown
# SPEC-XXX: [Nombre de la Especificación]

## 1. Metadata
- **ID:** SPEC-XXX
- **Estado:** [BORRADOR | EN_REVISION | APROBADO | IMPLEMENTADO | VERIFICADO]
- **Dependencias:** [SPEC-YYY anterior o "Ninguna"]
- **Fecha:** YYYY-MM-DD

## 2. Contexto de Negocio
Breve descripción del problema del dominio y por qué es necesaria esta regla.

## 3. Reglas de Negocio e Invariantes
- Regla 1: ...
- Regla 2: ...
- Invariantes (condiciones que NUNCA pueden violarse en el sistema): ...

## 4. Contrato de Entrada y Salida (Ports / DTOs)
- **Inputs:** Campos, tipos de datos y validaciones de rango/formato.
- **Outputs:** Estructura de respuesta exitosa.
- **Errores esperados:** Códigos/tipos de error de negocio (Domain Exceptions).

## 5. Criterios de Aceptación (BDD - Given / When / Then)
### Escenario 1: [Caso Exitoso Típico]
- **Given** [Dado un estado inicial]
- **When** [Cuando ocurre una acción]
- **Then** [Entonces se espera este resultado]

### Escenario 2: [Caso Límite o Error]
- **Given** ...
- **When** ...
- **Then** ...

## 6. Plan de Pruebas Automatizadas
- Pruebas unitarias de dominio (Core Entity / Use Case).
- Pruebas de integración de adaptadores.

## 7. Checklist de Evaluación y Criterio de "Done"
- [ ] Spec revisada y coherente con el negocio.
- [ ] Tests escritos y fallando inicialmente (o pasando con mock).
- [ ] Implementación en Core/Adapters completada.
- [ ] Todos los tests de la especificación ejecutados y pasando al 100%.
- [ ] Sin regresiones ni acoplamientos prohibidos.
```

---

## 3. Reglas para el Asistente AI

- **Paso a paso:** Desarrollar e implementar una especificación a la vez. No avanzar a la siguiente sin la confirmación o pase de evaluación de la actual.
- **Trazabilidad:** Cualquier cambio en el código debe referenciar el ID de la especificación que lo originó.
- **Refactor seguro:** Las refactorizaciones no deben modificar los criterios de aceptación ya aprobados en especificaciones previas.
