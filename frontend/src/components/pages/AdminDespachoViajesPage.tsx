import React, { useState } from 'react';
import { AdminDespachoViajesTemplate } from '../templates/AdminDespachoViajesTemplate';
import { CabeceraPanelOperativo } from '../organisms/CabeceraPanelOperativo';
import { SelectorFechaOperativa } from '../molecules/SelectorFechaOperativa';
import { GrillaViajesDiaAdmin } from '../organisms/GrillaViajesDiaAdmin';
import type { ViajeAdminItem } from '../molecules/TarjetaViajeAdmin';
import type { EstadoViajeType } from '../atoms/BadgeEstadoViaje';

const INITIAL_VIAJES: Record<string, ViajeAdminItem[]> = {
  '2026-10-11': [
    {
      id: 'V-20261011-0800-RUT-01',
      fecha: '2026-10-11',
      horaPartida: '08:00',
      rutaId: 'RUT-01',
      rutaNombre: 'Terminal Marítimo de Guanta -> El Guamache (Margarita)',
      origenPuertoNombre: 'Terminal Marítimo de Guanta',
      destinoPuertoNombre: 'Puerto Internacional El Guamache',
      embarcacionId: 'EMB-01',
      embarcacionCodigo: 'ARSH-PE-001',
      embarcacionNombre: 'Gran Cacique Express I',
      capacidadMaxima: 50,
      boletosVendidos: 48,
      puestosDisponibles: 2,
      porcentajeOcupacion: 96,
      estado: 'EN_EMBARQUE',
    },
    {
      id: 'V-20261011-1100-RUT-02',
      fecha: '2026-10-11',
      horaPartida: '11:00',
      rutaId: 'RUT-02',
      rutaNombre: 'El Guamache (Margarita) -> Guanta',
      origenPuertoNombre: 'Puerto Internacional El Guamache',
      destinoPuertoNombre: 'Terminal Marítimo de Guanta',
      embarcacionId: 'EMB-01',
      embarcacionCodigo: 'ARSH-PE-001',
      embarcacionNombre: 'Gran Cacique Express I',
      capacidadMaxima: 50,
      boletosVendidos: 35,
      puestosDisponibles: 15,
      porcentajeOcupacion: 70,
      estado: 'PROGRAMADO',
    },
    {
      id: 'V-20261011-1400-RUT-01',
      fecha: '2026-10-11',
      horaPartida: '14:00',
      rutaId: 'RUT-01',
      rutaNombre: 'Terminal Marítimo de Guanta -> El Guamache (Margarita)',
      origenPuertoNombre: 'Terminal Marítimo de Guanta',
      destinoPuertoNombre: 'Puerto Internacional El Guamache',
      embarcacionId: 'EMB-02',
      embarcacionCodigo: 'ARSH-PE-002',
      embarcacionNombre: 'Gran Cacique Express II',
      capacidadMaxima: 60,
      boletosVendidos: 12,
      puestosDisponibles: 48,
      porcentajeOcupacion: 20,
      estado: 'PROGRAMADO',
    },
    {
      id: 'V-20261011-1700-RUT-02',
      fecha: '2026-10-11',
      horaPartida: '17:00',
      rutaId: 'RUT-02',
      rutaNombre: 'El Guamache (Margarita) -> Guanta',
      origenPuertoNombre: 'Puerto Internacional El Guamache',
      destinoPuertoNombre: 'Terminal Marítimo de Guanta',
      embarcacionId: 'EMB-02',
      embarcacionCodigo: 'ARSH-PE-002',
      embarcacionNombre: 'Gran Cacique Express II',
      capacidadMaxima: 60,
      boletosVendidos: 0,
      puestosDisponibles: 60,
      porcentajeOcupacion: 0,
      estado: 'PROGRAMADO',
    },
  ],
};

export const AdminDespachoViajesPage: React.FC = () => {
  const getFechaHoyISO = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(getFechaHoyISO());
  const [almacenViajes, setAlmacenViajes] = useState<Record<string, ViajeAdminItem[]>>(INITIAL_VIAJES);
  const [isLoading, setIsLoading] = useState(false);
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo: 'success' | 'info';
  } | null>(null);

  const viajesDelDia = almacenViajes[fechaSeleccionada] || [];

  const mostrarMensaje = (mensaje: string, tipo: 'success' | 'info' = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3500);
  };

  // Métricas rápidas
  const metricas = {
    totalViajes: viajesDelDia.length,
    enEmbarque: viajesDelDia.filter((v) => v.estado === 'EN_EMBARQUE').length,
    enTransito: viajesDelDia.filter((v) => v.estado === 'EN_TRANSITO').length,
    finalizados: viajesDelDia.filter((v) => v.estado === 'FINALIZADO').length,
    totalVendidos: viajesDelDia.reduce((acc, v) => acc + v.boletosVendidos, 0),
    capacidadTotal: viajesDelDia.reduce((acc, v) => acc + v.capacidadMaxima, 0),
  };

  const handleInicializarViajes = async () => {
    setIsLoading(true);
    setTimeout(() => {
      if (viajesDelDia.length > 0) {
        mostrarMensaje(
          `Los viajes para el ${fechaSeleccionada} ya se encontraban inicializados (${viajesDelDia.length} salidas).`,
          'info',
        );
      } else {
        const fechaClean = fechaSeleccionada.replace(/-/g, '');
        const nuevos: ViajeAdminItem[] = [
          {
            id: `V-${fechaClean}-0800-RUT-01`,
            fecha: fechaSeleccionada,
            horaPartida: '08:00',
            rutaId: 'RUT-01',
            rutaNombre: 'Terminal Marítimo de Guanta -> El Guamache (Margarita)',
            origenPuertoNombre: 'Terminal Marítimo de Guanta',
            destinoPuertoNombre: 'Puerto Internacional El Guamache',
            embarcacionId: 'EMB-01',
            embarcacionCodigo: 'ARSH-PE-001',
            embarcacionNombre: 'Gran Cacique Express I',
            capacidadMaxima: 50,
            boletosVendidos: 0,
            puestosDisponibles: 50,
            porcentajeOcupacion: 0,
            estado: 'PROGRAMADO',
          },
          {
            id: `V-${fechaClean}-1100-RUT-02`,
            fecha: fechaSeleccionada,
            horaPartida: '11:00',
            rutaId: 'RUT-02',
            rutaNombre: 'El Guamache (Margarita) -> Guanta',
            origenPuertoNombre: 'Puerto Internacional El Guamache',
            destinoPuertoNombre: 'Terminal Marítimo de Guanta',
            embarcacionId: 'EMB-01',
            embarcacionCodigo: 'ARSH-PE-001',
            embarcacionNombre: 'Gran Cacique Express I',
            capacidadMaxima: 50,
            boletosVendidos: 0,
            puestosDisponibles: 50,
            porcentajeOcupacion: 0,
            estado: 'PROGRAMADO',
          },
          {
            id: `V-${fechaClean}-1400-RUT-01`,
            fecha: fechaSeleccionada,
            horaPartida: '14:00',
            rutaId: 'RUT-01',
            rutaNombre: 'Terminal Marítimo de Guanta -> El Guamache (Margarita)',
            origenPuertoNombre: 'Terminal Marítimo de Guanta',
            destinoPuertoNombre: 'Puerto Internacional El Guamache',
            embarcacionId: 'EMB-02',
            embarcacionCodigo: 'ARSH-PE-002',
            embarcacionNombre: 'Gran Cacique Express II',
            capacidadMaxima: 60,
            boletosVendidos: 0,
            puestosDisponibles: 60,
            porcentajeOcupacion: 0,
            estado: 'PROGRAMADO',
          },
          {
            id: `V-${fechaClean}-1700-RUT-02`,
            fecha: fechaSeleccionada,
            horaPartida: '17:00',
            rutaId: 'RUT-02',
            rutaNombre: 'El Guamache (Margarita) -> Guanta',
            origenPuertoNombre: 'Puerto Internacional El Guamache',
            destinoPuertoNombre: 'Terminal Marítimo de Guanta',
            embarcacionId: 'EMB-02',
            embarcacionCodigo: 'ARSH-PE-002',
            embarcacionNombre: 'Gran Cacique Express II',
            capacidadMaxima: 60,
            boletosVendidos: 0,
            puestosDisponibles: 60,
            porcentajeOcupacion: 0,
            estado: 'PROGRAMADO',
          },
        ];

        setAlmacenViajes((prev) => ({
          ...prev,
          [fechaSeleccionada]: nuevos,
        }));

        mostrarMensaje(
          `¡Éxito! Se generaron 4 salidas programadas para el ${fechaSeleccionada}.`,
        );
      }
      setIsLoading(false);
    }, 400);
  };

  const handleCambiarEstado = (viajeId: string, nuevoEstado: EstadoViajeType) => {
    setAlmacenViajes((prev) => {
      const actuales = prev[fechaSeleccionada] || [];
      const actualizados = actuales.map((v) =>
        v.id === viajeId ? { ...v, estado: nuevoEstado } : v,
      );
      return {
        ...prev,
        [fechaSeleccionada]: actualizados,
      };
    });

    const nombresEstados: Record<EstadoViajeType, string> = {
      PROGRAMADO: 'Programado',
      EN_EMBARQUE: 'En Embarque (Puertas Abiertas)',
      EN_TRANSITO: 'Zarpado / En Tránsito (Ventas Cerradas)',
      FINALIZADO: 'Arribo Finalizado',
      CANCELADO: 'Cancelado',
    };

    mostrarMensaje(
      `Viaje ${viajeId} actualizado a: ${nombresEstados[nuevoEstado]}.`,
    );
  };

  return (
    <div className="space-y-4">
      {notificacion && (
        <div className="fixed top-18 right-6 z-50 bg-teal-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-teal-500 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span>🔔</span>
          <span>{notificacion.mensaje}</span>
        </div>
      )}

      <AdminDespachoViajesTemplate
        header={
          <CabeceraPanelOperativo
            fecha={fechaSeleccionada}
            metricas={metricas}
            onInicializarViajes={handleInicializarViajes}
            isLoading={isLoading}
          />
        }
        selectorFecha={
          <SelectorFechaOperativa
            fechaSeleccionada={fechaSeleccionada}
            onCambiarFecha={setFechaSeleccionada}
          />
        }
        grilla={
          <GrillaViajesDiaAdmin
            viajes={viajesDelDia}
            onCambiarEstado={handleCambiarEstado}
            onInicializarViajes={handleInicializarViajes}
            isLoading={isLoading}
          />
        }
      />
    </div>
  );
};
