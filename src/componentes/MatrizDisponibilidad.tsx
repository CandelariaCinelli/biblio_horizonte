import React, { useState, useEffect } from 'react';
import { Equipo, ModuloHorario, Reserva } from '../tipos';
import { MODULOS_HORARIOS_LISTA } from '../datos/datosIniciales';
import { BadgeTipoEquipo } from './BadgeEstado';

interface PropsMatrizDisponibilidad {
  equipos: Equipo[];
  reservas: Reserva[];
  alReservarSlot: (equipoId: number, modulo: ModuloHorario, fecha: string) => void;
}

export const MatrizDisponibilidad: React.FC<PropsMatrizDisponibilidad> = ({
  equipos,
  reservas,
  alReservarSlot,
}) => {
  const hoy = new Date().toISOString().split('T')[0];
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(hoy);
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'PROYECTOR' | 'NOTEBOOK'>('TODOS');
  const [tiempoRespuestaMs, setTiempoRespuestaMs] = useState<number>(12);

  // Simulación de métrica de rendimiento RNF03 (< 1s)
  useEffect(() => {
    const inicio = performance.now();
    // Operación de filtrado
    const filtradas = reservas.filter((r) => r.fecha === fechaSeleccionada);
    const fin = performance.now();
    setTiempoRespuestaMs(Math.max(1, Math.round(fin - inicio) + 8));
  }, [fechaSeleccionada, reservas]);

  const equiposFiltrados = equipos.filter((e) => {
    if (filtroTipo === 'TODOS') return true;
    return e.tipo === filtroTipo;
  });

  return (
    <div className="space-y-5">
      {/* Controles de Consulta y Filtros */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#2D231E]">
              Matriz de Disponibilidad Escolar
            </h2>
          </div>
          <p className="text-xs text-[#76685E]">
            Consulta en tiempo real el estado de cada recurso por módulo horario. Haz clic en un casillero libre para solicitar reserva.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Fecha */}
          <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#D9CEBE]">
            <span className="text-xs font-medium text-[#76685E]">Fecha:</span>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#2D231E] focus:outline-none cursor-pointer"
            />
          </div>

          {/* Filtro por Tipo de Equipo */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-[#D9CEBE]">
            <button
              onClick={() => setFiltroTipo('TODOS')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filtroTipo === 'TODOS'
                  ? 'bg-white text-[#2D231E] shadow-xs'
                  : 'text-[#76685E] hover:text-[#2D231E]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo('PROYECTOR')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filtroTipo === 'PROYECTOR'
                  ? 'bg-white text-[#2D231E] shadow-xs'
                  : 'text-[#76685E] hover:text-[#2D231E]'
              }`}
            >
              Proyectores
            </button>
            <button
              onClick={() => setFiltroTipo('NOTEBOOK')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filtroTipo === 'NOTEBOOK'
                  ? 'bg-white text-[#2D231E] shadow-xs'
                  : 'text-[#76685E] hover:text-[#2D231E]'
              }`}
            >
              Notebooks
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda Visual */}
      <div className="flex flex-wrap items-center gap-4 px-2 text-xs text-[#76685E]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#166534] border border-[#14532D]" />
          <span>Libre / Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#C2410C] border border-[#9A3412]" />
          <span>Solicitud Pendiente en Revisión</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#B91C1C] border border-[#991B1B]" />
          <span>Confirmado (Ocupado)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#4B5563] border border-[#374151]" />
          <span>En Mantenimiento</span>
        </div>
      </div>

      {/* Tabla Matriz */}
      <div className="bg-white rounded-xl border border-[#E8E0D5] shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-[#E8E0D5] bg-[#F7F4EE] text-xs font-semibold text-[#4A3E35]">
              <th className="py-3 px-4 w-60 sticky left-0 bg-[#F7F4EE] z-10">Equipo / Recurso</th>
              {MODULOS_HORARIOS_LISTA.map((mod, i) => (
                <th key={mod} className="py-3 px-3 text-center border-l border-[#E8E0D5]/70">
                  <div className="text-[11px] font-bold text-[#2D231E]">M{i + 1}</div>
                  <div className="text-[10px] text-[#76685E] font-normal">
                    {mod.split('(')[1]?.replace(')', '') || mod}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D5] text-xs">
            {equiposFiltrados.map((equipo) => {
              const enMantenimiento = equipo.estado === 'EN_MANTENIMIENTO';

              return (
                <tr key={equipo.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                  {/* Celda Recurso */}
                  <td className="py-3 px-4 sticky left-0 bg-white z-10 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-[#2D231E]">{equipo.nombre}</div>
                        <div className="text-[11px] text-[#76685E] line-clamp-1">
                          {equipo.descripcion || 'Recurso escolar'}
                        </div>
                      </div>
                      <BadgeTipoEquipo tipo={equipo.tipo} />
                    </div>
                  </td>

                  {/* Celdas por Módulo */}
                  {MODULOS_HORARIOS_LISTA.map((mod) => {
                    if (enMantenimiento) {
                      return (
                        <td
                          key={mod}
                          className="py-2.5 px-2 text-center border-l border-[#374151] bg-[#4B5563] text-white"
                        >
                          <div className="text-[11px] font-medium">Mantenimiento</div>
                        </td>
                      );
                    }

                    // Buscar reservas para este equipo, fecha y módulo
                    const reservasSlot = reservas.filter(
                      (r) =>
                        r.equipoId === equipo.id &&
                        r.fecha === fechaSeleccionada &&
                        r.moduloHorario === mod
                    );

                    const confirmada = reservasSlot.find((r) => r.estado === 'CONFIRMADA');
                    const pendientes = reservasSlot.filter((r) => r.estado === 'PENDIENTE');

                    if (confirmada) {
                      return (
                        <td
                          key={mod}
                          className="py-2 px-2 text-center border-l border-[#991B1B] bg-[#B91C1C]"
                        >
                          <div className="font-semibold text-white text-[11px] leading-tight truncate max-w-[130px] mx-auto">
                            Ocupado
                          </div>
                          <div className="text-[10px] text-red-100 truncate max-w-[130px] mx-auto">
                            {confirmada.usuarioNombre}
                          </div>
                        </td>
                      );
                    }

                    if (pendientes.length > 0) {
                      return (
                        <td
                          key={mod}
                          className="py-2 px-2 text-center border-l border-[#9A3412] bg-[#C2410C]"
                        >
                          <button
                            onClick={() => alReservarSlot(equipo.id, mod, fechaSeleccionada)}
                            className="w-full p-1 rounded hover:bg-[#9A3412] text-left transition-colors group"
                          >
                            <div className="text-[11px] font-semibold text-white flex items-center justify-between">
                              <span>Pendiente</span>
                              <span className="text-[10px] bg-[#FED7AA] px-1 rounded-full text-[#7C2D12]">
                                {pendientes.length}
                              </span>
                            </div>
                            <div className="text-[10px] text-orange-100 truncate">
                              + Solicitar también
                            </div>
                          </button>
                        </td>
                      );
                    }

                    // Casillero libre
                    return (
                      <td
                        key={mod}
                        className="py-2 px-2 text-center border-l border-[#166534] bg-[#166534]/20 hover:bg-[#166534]/35 transition-colors"
                      >
                        <button
                          onClick={() => alReservarSlot(equipo.id, mod, fechaSeleccionada)}
                          className="w-full py-1.5 px-2 rounded font-medium text-[11px] text-[#14532D] hover:font-semibold transition-all"
                        >
                          + Reservar
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
