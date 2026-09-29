import React, { useState } from 'react';
import { Reserva, Usuario } from '../tipos';
import { BadgeEstadoReserva, BadgeTipoEquipo } from './BadgeEstado';

interface PropsDocenteVista {
  docenteActual: Usuario;
  reservasDocente: Reserva[];
  alAbrirNuevaReserva: () => void;
  alCancelarReserva: (reservaId: number) => Promise<void>;
  alVerDisponibilidad: () => void;
}

export const DocenteVista: React.FC<PropsDocenteVista> = ({
  docenteActual,
  reservasDocente,
  alAbrirNuevaReserva,
  alCancelarReserva,
  alVerDisponibilidad,
}) => {
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA'>('TODAS');
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  const reservasFiltradas = reservasDocente.filter((r) => {
    if (filtroEstado === 'TODAS') return true;
    return r.estado === filtroEstado;
  });

  const contarPorEstado = (estado: 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA') =>
    reservasDocente.filter((r) => r.estado === estado).length;

  const manejarCancelar = async (reservaId: number) => {
    if (window.confirm('¿Seguro que deseas cancelar esta solicitud pendiente de reserva?')) {
      try {
        setCancelandoId(reservaId);
        await alCancelarReserva(reservaId);
      } finally {
        setCancelandoId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Acciones Rápidas */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#C85A32]">
            Módulo de Gestión Docente
          </span>
          <h2 className="text-xl font-bold text-[#2D231E] mt-0.5">
            Mis Solicitudes de Recursos Tecnológicos
          </h2>
          <p className="text-xs text-[#76685E] mt-1">
            Docente activo: <strong>{docenteActual.nombre}</strong> ({docenteActual.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={alVerDisponibilidad}
            className="px-4 py-2 text-xs font-medium text-[#2D231E] bg-[#EFE8DD] hover:bg-[#E2D9CB] rounded-lg transition-colors"
          >
            Ver Disponibilidad
          </button>
          <button
            onClick={alAbrirNuevaReserva}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#A33E1A] rounded-lg transition-colors shadow-xs"
          >
            + Solicitar Equipo
          </button>
        </div>
      </div>

      {/* Contadores y Filtros Segmentados */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Métricas rápidas */}
        <div className="flex items-center gap-2 text-xs text-[#76685E]">
          <span>Total: <strong>{reservasDocente.length}</strong></span>
          <span>·</span>
          <span className="text-[#9A3412]">Pendientes: <strong>{contarPorEstado('PENDIENTE')}</strong></span>
          <span>·</span>
          <span className="text-[#166534]">Confirmadas: <strong>{contarPorEstado('CONFIRMADA')}</strong></span>
          <span>·</span>
          <span className="text-[#991B1B]">Rechazadas: <strong>{contarPorEstado('RECHAZADA')}</strong></span>
        </div>

        {/* Filtro segmentado interactivo */}
        <div className="flex items-center gap-1 bg-[#EFE8DD] p-1 rounded-lg border border-[#E0D7C9] self-start sm:self-auto">
          {(['TODAS', 'PENDIENTE', 'CONFIRMADA', 'RECHAZADA'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filtroEstado === estado
                  ? 'bg-white text-[#2D231E] shadow-xs'
                  : 'text-[#76685E] hover:text-[#2D231E]'
              }`}
            >
              {estado === 'TODAS' ? 'Todas' : estado.charAt(0) + estado.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Reservas del Docente */}
      {reservasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E0D5] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8E0D5] flex items-center justify-center mx-auto text-lg text-[#76685E]">
            📅
          </div>
          <h3 className="text-sm font-semibold text-[#2D231E]">
            No hay solicitudes registradas con este filtro
          </h3>
          <p className="text-xs text-[#76685E] max-w-md mx-auto">
            Puedes solicitar un proyector o notebook para tus próximas clases pedagógicas usando el botón "+ Solicitar Equipo".
          </p>
          <button
            onClick={alAbrirNuevaReserva}
            className="px-4 py-2 text-xs font-medium text-white bg-[#C85A32] rounded-lg hover:bg-[#A33E1A] transition-colors"
          >
            Nueva Solicitud
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservasFiltradas.map((reserva) => (
            <div
              key={reserva.id}
              className="bg-white rounded-xl border border-[#E8E0D5] p-5 shadow-xs hover:border-[#D9CEBE] transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#2D231E]">
                        {reserva.equipoNombre}
                      </h4>
                      <BadgeTipoEquipo tipo={reserva.equipoTipo} />
                    </div>
                    <span className="text-[11px] font-mono text-[#76685E] block mt-0.5">
                      Solicitud #{reserva.id}
                    </span>
                  </div>
                  <BadgeEstadoReserva estado={reserva.estado} />
                </div>

                {/* Detalles de Fecha y Módulo */}
                <div className="mt-3 pt-3 border-t border-[#E8E0D5]/60 grid grid-cols-2 gap-2 text-xs text-[#5A4D41]">
                  <div>
                    <span className="text-[#76685E] text-[11px] block">Fecha de Clase:</span>
                    <span className="font-semibold text-[#2D231E]">{reserva.fecha}</span>
                  </div>
                  <div>
                    <span className="text-[#76685E] text-[11px] block">Módulo Horario:</span>
                    <span className="font-semibold text-[#2D231E]">{reserva.moduloHorario}</span>
                  </div>
                </div>

                {/* Motivo Pedagógico */}
                {reserva.motivo && (
                  <div className="mt-2.5 text-xs bg-[#FAF7F2] p-2 rounded-lg border border-[#E8E0D5]/70 text-[#4A3E35]">
                    <span className="font-medium text-[#76685E]">Motivo: </span>
                    {reserva.motivo}
                  </div>
                )}
              </div>

              {/* Pie de tarjeta con acción de cancelación (HU09) */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E8E0D5]/50 text-xs">
                <span className="text-[11px] text-[#76685E]">
                  Enviada el {new Date(reserva.creadoEn).toLocaleDateString()}
                </span>

                {reserva.estado === 'PENDIENTE' ? (
                  <button
                    onClick={() => manejarCancelar(reserva.id)}
                    disabled={cancelandoId === reserva.id}
                    className="text-xs font-semibold text-[#991B1B] hover:text-[#7F1D1D] hover:underline"
                  >
                    {cancelandoId === reserva.id ? 'Cancelando...' : 'Cancelar Solicitud (HU09)'}
                  </button>
                ) : reserva.estado === 'CONFIRMADA' ? (
                  <span className="text-[11px] text-[#166534] font-medium">
                    ✓ Aprobada por Bibliotecaria
                  </span>
                ) : (
                  <span className="text-[11px] text-[#991B1B]">
                    ✗ Denegada
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
