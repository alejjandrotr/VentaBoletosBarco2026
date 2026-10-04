---
name: hexagonal-atomic-arch
description: >-
  Estándar de arquitectura de software para el proyecto: Arquitectura Hexagonal (Ports & Adapters)
  en el backend con NestJS para aislamiento total del dominio y flexibilidad de plugins/servicios,
  y Atomic Design en el frontend con React + Tailwind CSS.
---

# Skill: Arquitectura Hexagonal (Backend) + Atomic Design (Frontend)

Esta habilidad establece las reglas arquitectónicas para mantener el código desacoplado, modular y altamente testeable.

---

## 1. Backend: Arquitectura Hexagonal (Puertos y Adaptadores) con NestJS

El objetivo principal es que **el núcleo de negocio no dependa de ningún framework, base de datos ni servicio externo** (como SENIAT, pasarelas de pago, mailing, etc.). Si se cambia un proveedor o plugin, el dominio permanece intacto.

### Estructura de Capas:

```text
backend/src/
├── core/                       <-- CAPA DE DOMINIO Y APLICACIÓN (Cero dependencias externas)
│   ├── domain/
│   │   ├── entities/           <-- Entidades puras (Ticket, Passenger, Trip, Bus)
│   │   ├── value-objects/      <-- Objetos de valor inmutables (Dni, Price, Age, Capacity)
│   │   └── exceptions/         <-- Excepciones de dominio (CapacityExceededException, etc.)
│   └── use-cases/              <-- Casos de uso de la aplicación (SellTicketUseCase, ValidatePassengerUseCase)
├── ports/                      <-- CONTRATOS E INTERFACES (Definidos por el dominio)
│   ├── inbound/                <-- Puertos de entrada (Interfaces que exponen los casos de uso)
│   └── outbound/               <-- Puertos de salida (Interfaces para repositorios, SENIAT, Mailer)
├── adapters/                   <-- ADAPTADORES E INFRAESTRUCTURA (Detalles técnicos cambiables)
│   ├── inbound/
│   │   └── http/               <-- NestJS Controllers, DTOs con class-validator, Swagger
│   └── outbound/
│       ├── persistence/        <-- Implementación de repositorios (In-Memory, TypeORM, Prisma, etc.)
│       ├── fiscal/             <-- Adaptador para facturación SENIAT (ficticio/sandbox o API real)
│       └── notification/       <-- Adaptador de envío de correo (Nodemailer, SES, Resend, etc.)
└── modules/                    <-- Módulos de NestJS para configurar la Inyección de Dependencias
```

### Reglas de Oro de Hexagonal:
1. **Regla de Dependencia:** Las dependencias siempre apuntan hacia adentro: `Adapters -> Ports -> Use Cases -> Domain Entities`. El dominio NUNCA importa nada de `@nestjs/*`, TypeORM ni librerías externas de I/O.
2. **Inversión de Dependencias (DIP):** Los casos de uso dependen de interfaces (`Ports`), nunca de implementaciones concretas.
3. **Sustituibilidad:** Se puede reemplazar el adaptador de persistencia (ej. de memoria a PostgreSQL) o el adaptador de SENIAT sin alterar una sola línea de lógica en `core/`.

---

## 2. Frontend: Atomic Design con React + Tailwind CSS

La interfaz de usuario se construye de forma ascendente mediante componentes desacoplados siguiendo la metodología **Atomic Design**.

### Jerarquía de Componentes:

```text
frontend/src/
├── components/
│   ├── atoms/                  <-- ÁTOMOS: Elementos UI indivisibles
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Checkbox.tsx
│   │   └── Typography.tsx
│   ├── molecules/              <-- MOLÉCULAS: Combinaciones de átomos con propósito simple
│   │   ├── FormField.tsx       <-- Label + Input + ErrorMessage
│   │   ├── PassengerTypeCard.tsx
│   │   └── CapacityProgress.tsx
│   ├── organisms/              <-- ORGANISMOS: Secciones funcionales complejas
│   │   ├── PassengerFormList.tsx
│   │   ├── ActiveTripHeader.tsx
│   │   ├── SaleSummaryCard.tsx
│   │   └── CheckoutModal.tsx
│   ├── templates/              <-- PLANTILLAS: Estructura de layout y wireframes sin datos duros
│   │   └── BoxOfficeLayout.tsx
│   └── pages/                  <-- PÁGINAS: Conexión de plantillas con estado y servicios
│       └── BoxOfficePage.tsx
├── core/                       <-- Modelos, hooks de negocio, adaptadores API del frontend
│   ├── domain/                 <-- Tipos e interfaces espejo del dominio
│   ├── hooks/                  <-- Custom hooks para lógica de taquilla
│   └── services/               <-- Clientes HTTP para comunicarse con el backend
└── ...
```

### Reglas de Atomic Design:
1. **Átomos:** 100% reutilizables, controlados por props, sin efectos secundarios ni llamadas API.
2. **Moléculas:** Encapsulan pequeñas unidades lógicas (ej. un input con su mensaje de error de validación).
3. **Organismos:** Representan bloques completos de la UI de la taquilla.
4. **Tailwind CSS:** Uso consistente de clases utilitarias, diseño accesible, responsivo y visualmente pulido para el operador de taquilla.
