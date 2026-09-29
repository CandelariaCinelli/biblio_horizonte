import React, { useState } from 'react';
import { Reserva } from '../tipos';
import { BadgeEstadoReserva, BadgeTipoEquipo } from './BadgeEstado';

interface PropsModalConfirmacion {
  abierto: boolean;
  reserva: Reserva | null;
  tipoAccion: 'CONFIRMAR' | 'RECHAZAR' | null;
  solicitudesSolapadas: Reserva[];
  alCerrar: () => void;
  alEjecutar: (reservaId: number, accion: 'CONFIRMAR' | 'RECHAZAR', observacion?: string) => Promise<void>;
}

export const ModalConfirmacion: React.FC<PropsModalConfirmacion> = ({
  abierto,
  reserva,
  tipoAccion,
  solicitudesSolapadas,
  alCerrar,
  alEjecutar,
}) => {
  const [observacion, setObservacion] = useState('');
  const [procesando, setProcesando] = useState(false);

  if (!abierto || !reserva || !tipoAccion) return null;

  const esConfirmacion = tipoAccion === 'CONFIRMAR';

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProcesando(true);
      await alEjecutar(reserva.id, tipoAccion, observacion);
      setObservacion('');
      alCerrar();
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#FAF7F2] rounded-xl border border-[#E8E0D5] shadow-xl overflow-hidden">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-[#E8E0D5] flex items-center justify-between bg-[#F4EFE6]">
          <div>
            <h3 className="text-base font-semibold text-[#2D231E]">
              {esConfirmacion ? 'Confirmar Reserva de Recurso' : 'Rechazar Solicitud de Reserva'}
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
          {/* Ficha Resumen de la Solicitud */}
          <div className="bg-white rounded-lg p-4 border border-[#E8E0D5] space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#2D231E]">{reserva.equipoNombre}</span>
              <BadgeTipoEquipo tipo={reserva.equipoTipo} />
            </div>
            <div className="text-xs text-[#76685E] space-y-1">
              <div>
                <span className="font-semibold text-[#4A3E35]">Docente:</span> {reserva.usuarioNombre}
              </div>
              <div>
                <span className="font-semibold text-[#4A3E35]">Fecha y Módulo:</span> {reserva.fecha} · {reserva.moduloHorario}
              </div>
              {reserva.motivo && (
                <div>
                  <span className="font-semibold text-[#4A3E35]">Motivo pedagógico:</span> {reserva.motivo}
                </div>
              )}
            </div>
          </div>

          {/* Aviso de Regla de Negocio Crítica: Auto-rechazo */}
          {esConfirmacion && solicitudesSolapadas.length > 0 && (
            <div className="rounded-lg bg-[#FFF7ED] border border-[#FED7AA] p-3.5 text-xs text-[#9A3412] space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5">
              </div>
              <p>
                Al confirmar esta reserva, el sistema <strong>rechazará automáticamente</strong> las otras{' '}
                <strong>{solicitudesSolapadas.length}</strong> solicitud(es) pendiente(s) que compiten por el mismo recurso, fecha y módulo:
              </p>
              <ul className="list-disc list-inside pl-1 text-[#7C2D12]">
                {solicitudesSolapadas.map((s) => (
                  <li key={s.id}>
                    Solicitud #{s.id} de {s.usuarioNombre}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Campo opcional de observación */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3E35] mb-1.5">
              {esConfirmacion ? 'Nota o indicación de entrega (opcional):' : 'Motivo del rechazo (obligatorio para el docente):'}
            </label>
            <input
              type="text"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder={
                esConfirmacion
                  ? 'Ej: Retirar 5 minutos antes del inicio de módulo'
                  : 'Ej: Recurso comprometido para acto escolar prioritario'
              }
              required={!esConfirmacion}
              className="w-full px-3 py-2 text-sm bg-white border border-[#D9CEBE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40 text-[#2D231E]"
            />
          </div>

          {/* Acciones (2º Clic de ejecución) */}
          <div className="pt-3 border-t border-[#E8E0D5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={alCerrar}
              disabled={procesando}
              className="px-4 py-2 text-xs font-medium text-[#5A4D41] hover:bg-[#EFE8DD] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={procesando}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs ${
                esConfirmacion
                  ? 'bg-[#166534] hover:bg-[#14532D]'
                  : 'bg-[#991B1B] hover:bg-[#7F1D1D]'
              }`}
            >
              {procesando
                ? 'Procesando...'
                : esConfirmacion
                ? '2º Clic: Confirmar Asignación'
                : '2º Clic: Confirmar Rechazo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
