# SPEC-011: Interfaces Administrativas para Plantillas de Itinerario y Control de Viajes

## 1. Metadata
- **ID:** SPEC-011
- **Título:** Pantallas de Administración de Plantillas de Itinerario y Panel de Despacho de Viajes
- **Estado:** APROBADO
- **Dependencias:** SPEC-006 (Diseño Atómico), SPEC-009 (CRUD Reglas), SPEC-010 (Control Viajes)
- **Fecha:** 2026-10-04
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio
Para que los administradores y despachadores interactúen con el sistema sin depender de llamadas directas a APIs, se requiere implementar interfaces gráficas web modernas, intuitivas y responsivas construidas bajo la metodología **Atomic Design** en React y Tailwind CSS.

Se estructuran dos vistas principales:
1. **Vista de Plantillas de Itinerario (`/admin/itinerarios`):** Visualización en tabla/tarjetas de las reglas de salida por día de la semana y feriados, modal interactivo para crear/editar reglas, y conmutador (*switch*) de activación/desactivación rápida.
2. **Panel de Despacho y Viajes del Día (`/admin/viajes`):** Selector interactivo de fecha (calendario/píldoras de días), botón de acción prominente *"Generar / Inicializar Viajes"*, listado en tiempo real de viajes con barra de progreso de aforo (verde, amarillo, rojo según saturación de puestos), y botones rápidos para cambiar estado (`Iniciar Embarque`, `Zarpar / En Tránsito`, `Finalizar`).

---

## 3. Jerarquía Atomic Design para Vistas Administrativas

```
frontend/src/components/
├── atoms/
│   ├── BadgeEstadoViaje.tsx         # Badge visual ('PROGRAMADO', 'EN_EMBARQUE', etc.)
│   ├── BarraProgresoAforo.tsx       # Barra de progreso de ocupación de la lancha
│   ├── SwitchActivo.tsx             # Toggle switch para activar/desactivar reglas
│   ├── BotonAccionOperativa.tsx     # Botones con micro-interacción ('Inicializar', 'Zarpar')
│   └── InputHora.tsx                # Input especializado para selección de hora 24h
├── molecules/
│   ├── SelectorFechaOperativa.tsx   # Navegador de fechas (Hoy, Mañana, Calendario)
│   ├── FilaReglaItinerario.tsx       # Fila con datos de la regla y acciones
│   ├── TarjetaViajeAdmin.tsx        # Card del viaje con hora, lancha, matrícula y aforo
│   └── ModalEditarRegla.tsx         # Modal con formulario de regla de itinerario
├── organisms/
│   ├── TablaReglasItinerario.tsx    # Listado completo con filtros por ruta y tipo
│   ├── GrillaViajesDiaAdmin.tsx     # Grilla/lista de viajes para la fecha seleccionada
│   └── CabeceraPanelOperativo.tsx   # Título, métricas rápidas del día y botón de generación
└── templates/
    ├── AdminItinerariosTemplate.tsx # Layout estructurado de gestión de reglas
    └── AdminDespachoViajesTemplate.tsx # Layout estructurado de control de viajes
```

---

## 4. Criterios de Aceptación (BDD - Given / When / Then)

### Escenario 1: Navegación y generación de viajes en la pantalla de despacho
- **Given** el administrador en `/admin/viajes` seleccionando la fecha de mañana
- **When** presiona el botón *"Generar / Inicializar Viajes"*
- **Then** el panel realiza la petición POST a la API, muestra feedback de carga (*skeleton/spinner*) y renderiza los viajes recién programados con sus barras de aforo en 0%.

### Escenario 2: Cambio rápido de estado operativo en una tarjeta de viaje
- **Given** una tarjeta de viaje en estado `PROGRAMADO`
- **When** el despachador hace clic en *"Iniciar Embarque"*
- **Then** el badge cambia dinámicamente a color ámbar (`EN_EMBARQUE`) y se habilita el botón *"Zarpar"*.

### Escenario 3: Creación de regla especial feriado en el modal
- **Given** el modal abierto en `/admin/itinerarios`
- **When** se selecciona tipo `FECHA_ESPECIFICA`, fecha `'2026-12-25'`, hora `'10:00'` y lancha `ARSH-PE-001`
- **Then** se valida el formulario, se envía la petición y la tabla se actualiza automáticamente mostrando la nueva regla en la pestaña de *Salidas Especiales / Feriados*.

---

## 5. Checklist de Implementación
- [ ] Átomos y moléculas de administración creados en frontend.
- [ ] Organismos de tabla de reglas y grilla de viajes operativos.
- [ ] Vistas/Páginas integradas en el router del frontend (`/admin/itinerarios` y `/admin/viajes`).
- [ ] Manejo de estados de carga, confirmaciones y mensajes de éxito/error.
