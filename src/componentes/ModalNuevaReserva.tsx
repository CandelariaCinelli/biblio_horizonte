import React, { useState } from 'react';
import { Equipo, ModuloHorario, Usuario } from '../tipos';
import { MODULOS_HORARIOS_LISTA } from '../datos/datosIniciales';

interface PropsModalNuevaReserva {
  abierto: boolean;
  alCerrar: () => void;
  equipos: Equipo[];
  usuarioActual: Usuario;
  equipoPreseleccionadoId?: number;
  moduloPreseleccionado?: ModuloHorario;
  fechaPreseleccionada?: string;
  alCrear: (datos: {
    usuarioId: number;
    equipoId: number;
    fecha: string;
    moduloHorario: ModuloHorario;
    motivo: string;
  }) => Promise<void>;
}

export const ModalNuevaReserva: React.FC<PropsModalNuevaReserva> = ({
  abierto,
  alCerrar,
  equipos,
  usuarioActual,
  equipoPreseleccionadoId,
  moduloPreseleccionado,
  fechaPreseleccionada,
  alCrear,
}) => {
  const hoy = new Date().toISOString().split('T')[0];
  const [equipoId, setEquipoId] = useState<number>(
    equipoPreseleccionadoId || (equipos.find((e) => e.estado === 'DISPONIBLE')?.id || 1)
  );
  const [fecha, setFecha] = useState<string>(fechaPreseleccionada || hoy);
  const [moduloHorario, setModuloHorario] = useState<ModuloHorario>(
    moduloPreseleccionado || MODULOS_HORARIOS_LISTA[0]
  );
  const [motivo, setMotivo] = useState<string>('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  // Sync props if modal reopened with preselected values
  React.useEffect(() => {
    if (equipoPreseleccionadoId) setEquipoId(equipoPreseleccionadoId);
    if (moduloPreseleccionado) setModuloHorario(moduloPreseleccionado);
    if (fechaPreseleccionada) setFecha(fechaPreseleccionada);
  }, [equipoPreseleccionadoId, moduloPreseleccionado, fechaPreseleccionada]);

  if (!abierto) return null;

  const equipoSeleccionado = equipos.find((e) => e.id === Number(equipoId));

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (equipoSeleccionado?.estado === 'EN_MANTENIMIENTO') {
      setErrorLocal('El equipo seleccionado se encuentra en mantenimiento y no puede reservarse.');
      return;
    }

    try {
      setEnviando(true);
      await alCrear({
        usuarioId: usuarioActual.id,
        equipoId: Number(equipoId),
        fecha,
        moduloHorario,
        motivo,
      });
      setMotivo('');
      alCerrar();
    } catch (err: any) {
      setErrorLocal(err.message || 'Error al procesar la reserva');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF7F2] rounded-xl border border-[#E8E0D5] shadow-xl overflow-hidden">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-[#E8E0D5] flex items-center justify-between bg-[#F4EFE6]">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#C85A32]">
              Módulo Docente
            </span>
            <h3 className="text-base font-semibold text-[#2D231E]">
              Solicitar Reserva de Recurso
            </h3>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="text-[#76685E] hover:text-[#2D231E] text-sm p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="p-6 space-y-4">
          {errorLocal && (
            <div className="rounded-lg bg-[#FEF2F2] border border-[#FECACA] p-3 text-xs text-[#991B1B]">
              <strong>Atención:</strong> {errorLocal}
            </div>
          )}

          {/* Docente Solicitante */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
              Docente Solicitante:
            </label>
            <div className="px-3 py-2 text-sm bg-[#EFE8DD] rounded-lg border border-[#E0D7C9] text-[#2D231E] font-medium flex items-center justify-between">
              <span>{usuarioActual.nombre}</span>
              <span className="text-xs text-[#76685E]">{usuarioActual.email}</span>
            </div>
          </div>

          {/* Equipo a reservar */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
              Seleccionar Recurso Tecnológico:
            </label>
            <select
              value={equipoId}
              onChange={(e) => setEquipoId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D9CEBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40 text-[#2D231E]"
            >
              {equipos.map((eq) => (
                <option
                  key={eq.id}
                  value={eq.id}
                  disabled={eq.estado === 'EN_MANTENIMIENTO'}
                >
                  {eq.nombre} ({eq.tipo}) {eq.estado === 'EN_MANTENIMIENTO' ? '— [EN MANTENIMIENTO]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                Fecha de la clase:
              </label>
              <input
                type="date"
                value={fecha}
                min={hoy}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-[#D9CEBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40 text-[#2D231E]"
              />
            </div>

            {/* Módulo Horario */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                Módulo Horario:
              </label>
              <select
                value={moduloHorario}
                onChange={(e) => setModuloHorario(e.target.value as ModuloHorario)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D9CEBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40 text-[#2D231E]"
              >
                {MODULOS_HORARIOS_LISTA.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Motivo Pedagógico */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
              Finalidad pedagógica o materia (opcional):
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Proyección documental en 3er año A"
              className="w-full px-3 py-2 text-sm bg-white border border-[#D9CEBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40 text-[#2D231E]"
            />
          </div>

          {/* Botones */}
          <div className="pt-3 border-t border-[#E8E0D5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={alCerrar}
              disabled={enviando}
              className="px-4 py-2 text-xs font-medium text-[#5A4D41] hover:bg-[#EFE8DD] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#A33E1A] rounded-lg transition-colors shadow-xs"
            >
              {enviando ? 'Verificando y enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
