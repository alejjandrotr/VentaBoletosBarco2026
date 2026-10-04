# Workflow: Implementación y Verificación de Especificación (implement-spec)

Este workflow define el procedimiento estricto para revisar, refinar mediante interrogatorio interactivo (*Grill-Me*), codificar, probar y evaluar una especificación aprobada.

---

## Pasos a Ejecutar:

### Fase 0: Análisis Crítico y Bucle de Refinamiento ("Grill-Me")
1. **Lectura y Diagnóstico Exhaustivo:**
   - Leer íntegramente la especificación objetivo en `specs/SPEC-XXX-[nombre].md`.
   - Mapear el contexto de negocio, invariantes, contratos de entrada/salida y escenarios BDD (`Given-When-Then`).

2. **Bucle Interactivo de Preguntas y Desafío de Diseño ("Grill-Me"):**
   - El agente no debe empezar a programar inmediatamente.
   - Formular preguntas incisivas y aclaratorias sobre:
     - **Casos borde y de error:** ¿Qué ocurre con valores límite, nulos o formatos no previstos?
     - **Invariantes del Dominio:** ¿Hay ambigüedades en las reglas que puedan romper el aislamiento hexagonal?
     - **Contratos y DTOs:** ¿Están todos los tipos de respuesta y excepciones de dominio explícitamente definidos?
     - **Integración con specs previas:** ¿Afecta o depende de especificaciones existentes?
   - Usar preguntas interactivas estructuradas para confirmar las decisiones con el usuario.

3. **Cierre y Actualización de la Especificación:**
   - Incorporar las decisiones y ajustes resultantes del interrogatorio directamente en `specs/SPEC-XXX-[nombre].md`.
   - Solicitar confirmación explícita para pasar a la fase de implementación. **No avanzar sin la aprobación final del usuario.**

---

### Fase 1: Implementación Guiada por Tests (TDD / BDD)
4. **Diseño de Tests Unitarios (TDD / BDD):**
   - Escribir las pruebas unitarias en `backend/test/` o junto al dominio en `backend/src/core/.../*.spec.ts`.
   - Mapear directamente cada escenario `Given-When-Then` a un bloque `it('Given... When... Then...')`.
   - Verificar que los tests fallen o no compilen (estado Red).

5. **Implementación en el Núcleo de Dominio (Hexagonal Core):**
   - Crear o actualizar las Entidades y Value Objects en `backend/src/core/domain/`.
   - Implementar el Caso de Uso en `backend/src/core/use-cases/`.
   - **Regla estricta:** Cero dependencias de infraestructura, base de datos o NestJS en esta capa.

6. **Implementación de Puertos y Adaptadores (si aplica):**
   - Definir interfaces de puertos en `backend/src/ports/`.
   - Implementar adaptadores en `backend/src/adapters/` (Controladores HTTP, Persistencia, Servicios externos).
   - Conectar los providers en el módulo NestJS correspondiente.

---

### Fase 2: Verificación y Cierre
7. **Ejecución y Verificación de Pruebas:**
   - Ejecutar la suite de pruebas del backend:
     ```bash
     cd backend && npm test
     ```
   - Todos los tests deben pasar en verde (100% de éxito en los criterios de la spec).

8. **Checklist de Evaluación y Actualización de Estado:**
   - Marcar el checklist dentro de `specs/SPEC-XXX-[nombre].md`.
   - Cambiar el estado de la especificación a `VERIFICADO` (o `IMPLEMENTADO`).
