import React, { useState } from 'react';
import { Reserva } from '../tipos';
import { MODULOS_HORARIOS_LISTA } from '../datos/datosIniciales';
import { BadgeEstadoReserva, BadgeTipoEquipo } from './BadgeEstado';

interface PropsBibliotecariaVista {
  solicitudesPendientes: Reserva[];
  todasLasReservas: Reserva[];
  alAbrirModalConfirmacion: (reserva: Reserva, accion: 'CONFIRMAR' | 'RECHAZAR') => void;
  alIrAInventario: () => void;
}

export const BibliotecariaVista: React.FC<PropsBibliotecariaVista> = ({
  solicitudesPendientes,
  todasLasReservas,
  alAbrirModalConfirmacion,
  alIrAInventario,
}) => {
  const [subPestaña, setSubPestaña] = useState<'PENDIENTES' | 'HISTORIAL'>('PENDIENTES');
  const [filtroFecha, setFiltroFecha] = useState<string>('');
  const [filtroModulo, setFiltroModulo] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS');

  // Filtrado de reservas históricas (HU07)
  const reservasFiltradas = todasLasReservas.filter((r) => {
    if (filtroFecha && r.fecha !== filtroFecha) return false;
    if (filtroModulo && r.moduloHorario !== filtroModulo) return false;
    if (filtroEstado !== 'TODAS' && r.estado !== filtroEstado) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado del Panel de Bibliotecaria */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#C85A32]">
            Administración Escolar (Lucía Méndez)
          </span>
          <h2 className="text-xl font-bold text-[#2D231E] mt-0.5">
            Panel Centralizado de Solicitudes y Reservas
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={alIrAInventario}
            className="px-4 py-2 text-xs font-medium text-[#2D231E] bg-[#EFE8DD] hover:bg-[#E2D9CB] rounded-lg transition-colors whitespace-nowrap"
          >
            Gestionar Inventario
          </button>
        </div>
      </div>

      {/* Selector de sub-pestañas: Cola de Pendientes vs Historial Completo */}
      <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubPestaña('PENDIENTES')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              subPestaña === 'PENDIENTES'
                ? 'bg-[#C85A32] text-white'
                : 'text-[#76685E] hover:bg-[#EFE8DD]'
            }`}
          >
            <span>Pendientes</span>
            <span
              className={`px-1.5 py-0.5 text-[11px] rounded-full font-bold ${
                subPestaña === 'PENDIENTES'
                  ? 'bg-white text-[#C85A32]'
                  : 'bg-[#FED7AA] text-[#9A3412]'
              }`}
            >
              {solicitudesPendientes.length}
            </span>
          </button>

          <button
            onClick={() => setSubPestaña('HISTORIAL')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              subPestaña === 'HISTORIAL'
                ? 'bg-[#C85A32] text-white'
                : 'text-[#76685E] hover:bg-[#EFE8DD]'
            }`}
          >
            Todas las Reservas
          </button>
        </div>
      </div>

      {/* CONTENIDO SUB-PESTAÑA 1: COLA CRONOLÓGICA DE PENDIENTES */}
      {subPestaña === 'PENDIENTES' && (
        <div className="space-y-4">
          <div className="text-xs text-[#76685E] flex items-center justify-between px-1">
            <span>
              Ordenadas cronológicamente por orden de llegada (las más antiguas primero para priorización justa).
            </span>
          </div>

          {solicitudesPendientes.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E8E0D5] p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center mx-auto text-lg text-[#166534]">
                ✓
              </div>
              <h3 className="text-sm font-semibold text-[#2D231E]">
                ¡No hay solicitudes pendientes!
              </h3>
              <p className="text-xs text-[#76685E] max-w-sm mx-auto">
                Todos los pedidos docentes están respondidos y los equipos asignados sin conflictos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitudesPendientes.map((solicitud) => {
                // Verificar si hay otras pendientes que compiten
                const solicitudesHermanas = solicitudesPendientes.filter(
                  (s) =>
                    s.id !== solicitud.id &&
                    s.equipoId === solicitud.equipoId &&
                    s.fecha === solicitud.fecha &&
                    s.moduloHorario === solicitud.moduloHorario
                );

                return (
                  <div
                    key={solicitud.id}
                    className="bg-white rounded-xl border border-[#E8E0D5] p-5 shadow-xs hover:border-[#D9CEBE] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-[#76685E] font-semibold">
                          #{solicitud.id}
                        </span>
                        <h4 className="text-sm font-bold text-[#2D231E]">
                          {solicitud.equipoNombre}
                        </h4>
                        <BadgeTipoEquipo tipo={solicitud.equipoTipo} />
                        <BadgeEstadoReserva estado={solicitud.estado} tamano="sm" />
                      </div>

                      <div className="text-xs text-[#5A4D41] flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div>
                          <span className="text-[#76685E]">Docente:</span>{' '}
                          <strong className="text-[#2D231E]">{solicitud.usuarioNombre}</strong>
                        </div>
                        <div>
                          <span className="text-[#76685E]">Fecha:</span>{' '}
                          <strong className="text-[#2D231E]">{solicitud.fecha}</strong>
                        </div>
                        <div>
                          <span className="text-[#76685E]">Módulo:</span>{' '}
                          <strong className="text-[#2D231E]">{solicitud.moduloHorario}</strong>
                        </div>
                      </div>

                      {solicitud.motivo && (
                        <p className="text-xs text-[#76685E] italic">
                          "{solicitud.motivo}"
                        </p>
                      )}

                      {solicitudesHermanas.length > 0 && (
                        <div className="text-[11px] text-[#C2410C] font-semibold bg-[#FFF7ED] px-2 py-0.5 rounded inline-block border border-[#FED7AA]">
                          ⚠️ Hay {solicitudesHermanas.length} otra(s) solicitud(es) compitiendo por este módulo. Al confirmar esta, las demás se auto-rechazarán.
                        </div>
                      )}
                    </div>

                    {/* Acciones de 2 Clics para la Bibliotecaria */}
                    <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#E8E0D5]">
                      <button
                        onClick={() => alAbrirModalConfirmacion(solicitud, 'RECHAZAR')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2] rounded-lg border border-[#FECACA] transition-colors"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => alAbrirModalConfirmacion(solicitud, 'CONFIRMAR')}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors shadow-xs"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO SUB-PESTAÑA 2: HISTORIAL Y FILTRADO (HU07) */}
      {subPestaña === 'HISTORIAL' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white rounded-xl border border-[#E8E0D5] p-4 shadow-xs flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#76685E] mb-1">
                Filtrar por Fecha:
              </label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#D9CEBE] rounded-lg text-[#2D231E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#76685E] mb-1">
                Módulo Horario:
              </label>
              <select
                value={filtroModulo}
                onChange={(e) => setFiltroModulo(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#D9CEBE] rounded-lg text-[#2D231E] focus:outline-none"
              >
                <option value="">Todos los Módulos</option>
                {MODULOS_HORARIOS_LISTA.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#76685E] mb-1">
                Estado:
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#D9CEBE] rounded-lg text-[#2D231E] focus:outline-none"
              >
                <option value="TODAS">Todos los Estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="CONFIRMADA">Confirmadas</option>
                <option value="RECHAZADA">Rechazadas</option>
              </select>
            </div>

            {(filtroFecha || filtroModulo || filtroEstado !== 'TODAS') && (
              <button
                onClick={() => {
                  setFiltroFecha('');
                  setFiltroModulo('');
                  setFiltroEstado('TODAS');
                }}
                className="self-end mb-1 text-xs text-[#C85A32] font-semibold hover:underline"
              >
                Limpiar Filtros
              </button>
            )}
          </div>

          {/* Tabla de Reservas */}
          <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F4EE] border-b border-[#E8E0D5] text-[#4A3E35] font-semibold">
                  <th className="py-3 px-4"># ID</th>
                  <th className="py-3 px-4">Equipo</th>
                  <th className="py-3 px-4">Docente</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Motivo / Resolución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D5]">
                {reservasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#76685E]">
                      No se encontraron reservas que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  reservasFiltradas.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#76685E]">
                        #{r.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#2D231E]">
                        {r.equipoNombre}
                      </td>
                      <td className="py-3 px-4 text-[#2D231E]">
                        {r.usuarioNombre}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#2D231E]">
                        {r.fecha}
                      </td>
                      <td className="py-3 px-4 text-[#5A4D41]">
                        {r.moduloHorario}
                      </td>
                      <td className="py-3 px-4">
                        <BadgeEstadoReserva estado={r.estado} tamano="sm" />
                      </td>
                      <td className="py-3 px-4 text-[#76685E] max-w-xs truncate">
                        {r.motivo || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
