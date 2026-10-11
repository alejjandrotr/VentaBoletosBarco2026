import React, { useState } from 'react';
import { AdminItinerariosTemplate } from '../templates/AdminItinerariosTemplate';
import { TablaReglasItinerario } from '../organisms/TablaReglasItinerario';
import { ModalEditarRegla } from '../molecules/ModalEditarRegla';
import type { ReglaItinerarioItem } from '../molecules/FilaReglaItinerario';

const INITIAL_REGLAS: ReglaItinerarioItem[] = [
  {
    id: 'REG-LV-0800-GUA-GUA',
    nombre: 'Guanta -> El Guamache 08:00 AM (L-V)',
    tipoAplicacion: 'DIAS_SEMANA',
    diasSemana: [1, 2, 3, 4, 5],
    rutaId: 'RUT-01',
    rutaNombre: 'Terminal Marítimo de Guanta -> El Guamache',
    horaPartida: '08:00',
    embarcacionDefaultId: 'EMB-01',
    embarcacionNombre: 'Gran Cacique Express I',
    embarcacionCodigo: 'ARSH-PE-001',
    activo: true,
  },
  {
    id: 'REG-LV-1100-GUA-GUA',
    nombre: 'El Guamache -> Guanta 11:00 AM (L-V)',
    tipoAplicacion: 'DIAS_SEMANA',
    diasSemana: [1, 2, 3, 4, 5],
    rutaId: 'RUT-02',
    rutaNombre: 'El Guamache -> Terminal Marítimo de Guanta',
    horaPartida: '11:00',
    embarcacionDefaultId: 'EMB-01',
    embarcacionNombre: 'Gran Cacique Express I',
    embarcacionCodigo: 'ARSH-PE-001',
    activo: true,
  },
  {
    id: 'REG-LV-1400-GUA-GUA',
    nombre: 'Guanta -> El Guamache 02:00 PM (L-V)',
    tipoAplicacion: 'DIAS_SEMANA',
    diasSemana: [1, 2, 3, 4, 5],
    rutaId: 'RUT-01',
    rutaNombre: 'Terminal Marítimo de Guanta -> El Guamache',
    horaPartida: '14:00',
    embarcacionDefaultId: 'EMB-02',
    embarcacionNombre: 'Gran Cacique Express II',
    embarcacionCodigo: 'ARSH-PE-002',
    activo: true,
  },
  {
    id: 'REG-LV-1700-GUA-GUA',
    nombre: 'El Guamache -> Guanta 05:00 PM (L-V)',
    tipoAplicacion: 'DIAS_SEMANA',
    diasSemana: [1, 2, 3, 4, 5],
    rutaId: 'RUT-02',
    rutaNombre: 'El Guamache -> Terminal Marítimo de Guanta',
    horaPartida: '17:00',
    embarcacionDefaultId: 'EMB-02',
    embarcacionNombre: 'Gran Cacique Express II',
    embarcacionCodigo: 'ARSH-PE-002',
    activo: true,
  },
  {
    id: 'REG-FER-20261225',
    nombre: 'Salida Especial Navidad Guanta -> El Guamache',
    tipoAplicacion: 'FECHA_ESPECIFICA',
    fechaEspecifica: '2026-12-25',
    rutaId: 'RUT-01',
    rutaNombre: 'Terminal Marítimo de Guanta -> El Guamache',
    horaPartida: '10:00',
    embarcacionDefaultId: 'EMB-01',
    embarcacionNombre: 'Gran Cacique Express I',
    embarcacionCodigo: 'ARSH-PE-001',
    activo: true,
  },
];

export const AdminItinerariosPage: React.FC = () => {
  const [reglas, setReglas] = useState<ReglaItinerarioItem[]>(INITIAL_REGLAS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<ReglaItinerarioItem | null>(null);
  const [notificacion, setNotificacion] = useState<{
    tipo: 'success' | 'info';
    mensaje: string;
  } | null>(null);

  const mostrarMensaje = (mensaje: string, tipo: 'success' | 'info' = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3500);
  };

  const handleToggleActivo = async (id: string, activo: boolean) => {
    setReglas((prev) =>
      prev.map((r) => (r.id === id ? { ...r, activo } : r)),
    );
    mostrarMensaje(
      `Regla ${id} ${activo ? 'activada' : 'desactivada'} correctamente.`,
      'info',
    );
  };

  const handleEditarRegla = (regla: ReglaItinerarioItem) => {
    setReglaEnEdicion(regla);
    setIsModalOpen(true);
  };

  const handleNuevaRegla = () => {
    setReglaEnEdicion(null);
    setIsModalOpen(true);
  };

  const handleGuardarRegla = async (datos: Partial<ReglaItinerarioItem>) => {
    if (reglaEnEdicion) {
      // Editar existente
      setReglas((prev) =>
        prev.map((r) =>
          r.id === reglaEnEdicion.id
            ? {
                ...r,
                ...datos,
              }
            : r,
        ),
      );
      mostrarMensaje(`Regla "${datos.nombre}" actualizada exitosamente.`);
    } else {
      // Crear nueva
      const nueva: ReglaItinerarioItem = {
        id: `REG-${Date.now().toString(36).toUpperCase()}`,
        nombre: datos.nombre || 'Nueva Salida',
        tipoAplicacion: datos.tipoAplicacion || 'DIAS_SEMANA',
        diasSemana: datos.diasSemana,
        fechaEspecifica: datos.fechaEspecifica,
        rutaId: datos.rutaId || 'RUT-01',
        rutaNombre:
          datos.rutaId === 'RUT-02'
            ? 'El Guamache -> Guanta'
            : 'Guanta -> El Guamache',
        horaPartida: datos.horaPartida || '08:00',
        embarcacionDefaultId: datos.embarcacionDefaultId || 'EMB-01',
        embarcacionNombre:
          datos.embarcacionDefaultId === 'EMB-02'
            ? 'Gran Cacique Express II'
            : 'Gran Cacique Express I',
        embarcacionCodigo:
          datos.embarcacionDefaultId === 'EMB-02'
            ? 'ARSH-PE-002'
            : 'ARSH-PE-001',
        activo: datos.activo !== undefined ? datos.activo : true,
      };
      setReglas((prev) => [nueva, ...prev]);
      mostrarMensaje(`Nueva regla "${nueva.nombre}" registrada exitosamente.`);
    }
  };

  return (
    <AdminItinerariosTemplate
      header={
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <h1 className="text-xl font-black text-[#243C4C]">
                Plantillas y Reglas de Itinerario
              </h1>
            </div>
            <p className="text-xs text-[#698696] font-medium mt-1">
              Configure las salidas recurrentes semanales y excepciones por fechas festivas.
            </p>
          </div>

          {notificacion && (
            <div className="px-3.5 py-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold animate-fade-in">
              ✅ {notificacion.mensaje}
            </div>
          )}
        </div>
      }
      content={
        <TablaReglasItinerario
          reglas={reglas}
          onToggleActivo={handleToggleActivo}
          onEditarRegla={handleEditarRegla}
          onNuevaRegla={handleNuevaRegla}
        />
      }
      modal={
        <ModalEditarRegla
          isOpen={isModalOpen}
          reglaEdicion={reglaEnEdicion}
          onClose={() => setIsModalOpen(false)}
          onGuardar={handleGuardarRegla}
        />
      }
    />
  );
};
