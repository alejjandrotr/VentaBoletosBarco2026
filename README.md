# Sistema de Venta de Boletos de Transporte

Sistema integral de venta de boletos punto a punto desarrollado bajo la metodología **SDD (Spec-Driven Development / Specification-Centric Design & Development)**, implementando **Arquitectura Hexagonal (Puertos y Adaptadores)** en el backend con **NestJS** y **Atomic Design** en el frontend con **React + Tailwind CSS**.

---

## 1. Estructura del Proyecto y Configuración `.ai`

El proyecto contiene una carpeta `.ai/` (replicada en `.agent/` para el descubrimiento automático de agentes) que define las habilidades, directrices y flujos de trabajo aplicados en este repositorio:

```text
venta-de-boletos/
├── .ai/                                # Skills y Workflows del proyecto
│   ├── skills/
│   │   ├── spec-driven-development/    # Metodología SDD, reglas de atomicidad y criterios BDD
│   │   │   └── SKILL.md
│   │   └── hexagonal-atomic-arch/      # Arquitectura Hexagonal en NestJS y Atomic Design en React
│   │       └── SKILL.md
│   └── workflows/
│       ├── new-spec.md                 # Procedimiento para formular y validar una nueva spec
│       └── implement-spec.md           # Procedimiento para codificar, testear y evaluar una spec
├── specs/                              # Especificaciones funcionales atómicas (SDD)
│   ├── SPEC-001-calculo-tarifas-viajeros.md
│   ├── SPEC-002-validacion-menores-autorizaciones.md
│   ├── SPEC-003-control-aforo-capacidad.md
│   ├── SPEC-004-seleccion-viaje-taquilla.md
│   ├── SPEC-005-facturacion-seniat-email.md
│   └── SPEC-006-ui-taquilla-atomic-design.md
├── backend/                            # API y Núcleo de Dominio con NestJS (Hexagonal)
│   ├── src/
│   │   ├── core/                       # Dominio puro y casos de uso (sin dependencias externas)
│   │   │   ├── domain/                 # Entidades, Value Objects y Excepciones
│   │   │   └── use-cases/              # Lógica de aplicación
│   │   ├── ports/                      # Contratos Inbound y Outbound
│   │   ├── adapters/                   # Implementaciones de infraestructura (HTTP, DB, SENIAT, Mailer)
│   │   └── modules/                    # Módulos NestJS para inyección de dependencias
│   └── test/                           # Pruebas automatizadas unitarias y de integración
└── frontend/                           # Aplicación Web de Taquilla (Atomic Design)
    ├── src/
    │   ├── components/
    │   │   ├── atoms/                  # Botones, Inputs, Badges, Indicadores
    │   │   ├── molecules/              # FormFields, Selector de Pasajeros
    │   │   ├── organisms/              # Lista de viajeros, Resumen de venta, Header de viaje
    │   │   ├── templates/              # Layout de Taquilla
    │   │   └── pages/                  # Página principal de venta en taquilla
    │   └── core/                       # Lógica de cliente, servicios y hooks
    └── ...
```

---

## 2. Metodología: Spec-Driven Development (SDD)

1. **Desarrollo Guiado por Especificaciones:** No se escribe código sin antes tener una especificación atómica aprobada en `specs/`.
2. **Evaluación Continua:** Cada caso de uso y regla de negocio se aborda individualmente en orden secuencial para permitir su revisión y validación antes de continuar con la siguiente.
3. **Criterios de Aceptación Formales:** Toda especificación incluye escenarios BDD (*Given-When-Then*) que se traducen directamente a pruebas automatizadas de software.

---

## 3. Arquitectura del Sistema

### Backend (NestJS + Hexagonal)
- **Dominio Desacoplado:** El núcleo de negocio no depende de NestJS ni de librerías externas.
- **Flexibilidad de Plugins:** Servicios externos como facturación electrónica (SENIAT), notificación por correo o almacenamiento son adaptadores reemplazables a través de puertos.

### Frontend (React + Tailwind CSS + Atomic Design)
- **Component-Driven:** Interfaz construida desde átomos hasta organismos para garantizar modularidad, consistencia visual y testeabilidad.
- **Experiencia de Taquilla:** Flujo ágil para el operador de taquilla con viaje preseleccionado, validaciones en tiempo real y cálculo automático de tarifas.
