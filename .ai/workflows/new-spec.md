# Workflow: Creación de Nueva Especificación (new-spec)

Este workflow define el procedimiento para formalizar una nueva micro-especificación bajo la metodología SDD antes de escribir cualquier línea de código.

---

## Pasos a Ejecutar:

1. **Identificar el Alcance Atómico:**
   - La nueva especificación debe abordar **una sola** regla o caso de uso (ej. `SPEC-001-calculo-tarifas-viajeros.md`).
   - Si la funcionalidad es compleja, subdividirla en especificaciones dependientes (`SPEC-001`, `SPEC-002`, etc.).

2. **Crear el Archivo en `specs/`:**
   - Ubicación: `specs/SPEC-XXX-[nombre-en-kebab-case].md`.
   - Utilizar la plantilla estándar definida en el skill `spec-driven-development`.

3. **Completar las Secciones Obligatorias:**
   - **Contexto de Negocio:** Breve justificación.
   - **Reglas de Negocio e Invariantes:** Qué está permitido y qué está terminantemente prohibido.
   - **Contratos (DTOs / Ports):** Tipado de entrada y salida con tipado estricto de TypeScript.
   - **Criterios de Aceptación (BDD):** Escenarios `Given / When / Then` cubriendo caminos felices y casos de error/borde.
   - **Plan de Pruebas:** Enumerar qué tests unitarios o de integración validarán esta especificación.

4. **Revisión y Aprobación:**
   - Presentar la especificación al usuario/evaluador.
   - No iniciar la implementación hasta que el estado cambie a `APROBADO`.
