import React, { useState, useEffect } from 'react';
import { Usuario, Equipo, Reserva, ModuloHorario } from './tipos';
import { apiServicio } from './servicios/apiServicio';
import { Cabecera } from './componentes/Cabecera';
import { MatrizDisponibilidad } from './componentes/MatrizDisponibilidad';
import { DocenteVista } from './componentes/DocenteVista';
import { BibliotecariaVista } from './componentes/BibliotecariaVista';
import { InventarioEquipos } from './componentes/InventarioEquipos';
import { ModalNuevaReserva } from './componentes/ModalNuevaReserva';
import { ModalConfirmacion } from './componentes/ModalConfirmacion';
import bannerImg from './assets/images/imagen1.jpg';

export default function App() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [pestañaActiva, setPestañaActiva] = useState<
    'disponibilidad' | 'docente' | 'bibliotecaria' | 'inventario' 
  >('disponibilidad');

  // Modales
  const [modalNuevaReservaAbierto, setModalNuevaReservaAbierto] = useState(false);
  const [preseleccionSlot, setPreseleccionSlot] = useState<{
    equipoId?: number;
    modulo?: ModuloHorario;
    fecha?: string;
  }>({});

  // Modal de confirmación en 2 clics
  const [modalConfirmacion, setModalConfirmacion] = useState<{
    abierto: boolean;
    reserva: Reserva | null;
    tipoAccion: 'CONFIRMAR' | 'RECHAZAR' | null;
    solicitudesSolapadas: Reserva[];
  }>({
    abierto: false,
    reserva: null,
    tipoAccion: null,
    solicitudesSolapadas: [],
  });

  // Notificación Toast
  const [toast, setToast] = useState<{
    mensaje: string;
    tipo: 'exito' | 'error' | 'info';
    visible: boolean;
  }>({
    mensaje: '',
    tipo: 'info',
    visible: false,
  });

  const mostrarToast = (mensaje: string, tipo: 'exito' | 'error' | 'info' = 'info') => {
    setToast({ mensaje, tipo, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4500);
  };

  // Carga de datos iniciales
  const cargarDatos = async () => {
    const usrs = await apiServicio.obtenerUsuarios();
    const eqs = await apiServicio.obtenerEquipos();
    const res = await apiServicio.obtenerReservas();

    setUsuarios(usrs);
    setEquipos(eqs);
    setReservas(res);

    if (!usuarioActual && usrs.length > 0) {
      // Default: Prof. Martín Gómez (docente) para interacción inmediata
      const docenteInicial = usrs.find((u) => u.rol === 'DOCENTE') || usrs[0];
      setUsuarioActual(docenteInicial);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ---------------------------------------------------------------------------
  // MANEJADORES DE ACCIONES
  // ---------------------------------------------------------------------------

  const manejarCrearReserva = async (datos: {
    usuarioId: number;
    equipoId: number;
    fecha: string;
    moduloHorario: ModuloHorario;
    motivo: string;
  }) => {
    try {
      const nueva = await apiServicio.solicitarReserva(datos);
      await cargarDatos();
      mostrarToast(
        `Solicitud #${nueva.id} enviada con éxito en estado PENDIENTE. Esperando confirmación de la bibliotecaria.`,
        'exito'
      );
    } catch (err: any) {
      mostrarToast(err.message || 'Error al solicitar reserva', 'error');
      throw err;
    }
  };

  const manejarAbrirModalConfirmacion = (
    reserva: Reserva,
    accion: 'CONFIRMAR' | 'RECHAZAR'
  ) => {
    // Buscar otras solicitudes pendientes que compiten por el mismo equipo, fecha y módulo
    const solapadas = reservas.filter(
      (r) =>
        r.id !== reserva.id &&
        r.equipoId === reserva.equipoId &&
        r.fecha === reserva.fecha &&
        r.moduloHorario === reserva.moduloHorario &&
        r.estado === 'PENDIENTE'
    );

    setModalConfirmacion({
      abierto: true,
      reserva,
      tipoAccion: accion,
      solicitudesSolapadas: solapadas,
    });
  };

  const manejarEjecutarConfirmacion = async (
    reservaId: number,
    accion: 'CONFIRMAR' | 'RECHAZAR',
    observacion?: string
  ) => {
    try {
      if (accion === 'CONFIRMAR') {
        const resultado = await apiServicio.confirmarReserva(reservaId, observacion);
        await cargarDatos();
        if (resultado.rechazadasAutomaticamente.length > 0) {
          mostrarToast(
            `✓ Reserva #${reservaId} CONFIRMADA. Se auto-rechazaron ${resultado.rechazadasAutomaticamente.length} solicitud(es) solapada(s) (RF06, RF07).`,
            'exito'
          );
        } else {
          mostrarToast(`✓ Reserva #${reservaId} CONFIRMADA exitosamente (RF05).`, 'exito');
        }
      } else {
        await apiServicio.rechazarReserva(reservaId, observacion);
        await cargarDatos();
        mostrarToast(`Solicitud #${reservaId} fue rechazada.`, 'info');
      }
    } catch (err: any) {
      mostrarToast(err.message || 'Error al procesar la acción', 'error');
    }
  };

  const manejarCancelarReservaDocente = async (reservaId: number) => {
    if (!usuarioActual) return;
    try {
      await apiServicio.cancelarReservaDocente(reservaId, usuarioActual.id);
      await cargarDatos();
      mostrarToast(`Solicitud #${reservaId} cancelada por el docente (HU09).`, 'info');
    } catch (err: any) {
      mostrarToast(err.message || 'Error cancelando reserva', 'error');
    }
  };

  // ABM de Equipos
  const manejarCrearEquipo = async (datos: Omit<Equipo, 'id' | 'creadoEn'>) => {
    try {
      const nuevo = await apiServicio.crearEquipo(datos);
      await cargarDatos();
      mostrarToast(`Equipo "${nuevo.nombre}" dado de alta con éxito (RF09).`, 'exito');
    } catch (err: any) {
      mostrarToast(err.message || 'Error creando equipo', 'error');
      throw err;
    }
  };

  const manejarActualizarEquipo = async (id: number, datos: Partial<Equipo>) => {
    try {
      await apiServicio.actualizarEquipo(id, datos);
      await cargarDatos();
      mostrarToast(`Equipo #${id} actualizado correctamente.`, 'exito');
    } catch (err: any) {
      mostrarToast(err.message || 'Error actualizando equipo', 'error');
      throw err;
    }
  };

  const manejarAlternarMantenimiento = async (id: number) => {
    try {
      const act = await apiServicio.alternarEstadoMantenimiento(id);
      await cargarDatos();
      mostrarToast(
        `Estado de "${act.nombre}" modificado a ${act.estado}.`,
        'info'
      );
    } catch (err: any) {
      mostrarToast(err.message || 'Error al modificar mantenimiento', 'error');
    }
  };

  const manejarEliminarEquipo = async (id: number) => {
    try {
      await apiServicio.eliminarEquipo(id);
      await cargarDatos();
      mostrarToast('Equipo eliminado del inventario escolar.', 'info');
    } catch (err: any) {
      mostrarToast(err.message || 'No se pudo eliminar el equipo', 'error');
    }
  };

  const manejarRestablecerDemo = () => {
    if (window.confirm('¿Deseas restablecer los datos de ejemplo originales (Flyway V2)?')) {
      apiServicio.restablecerDatos();
      cargarDatos();
      mostrarToast('Datos semilla restablecidos correctamente.', 'info');
    }
  };

  if (!usuarioActual) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-[#2D231E] p-4">
        <div className="text-sm font-medium animate-pulse text-[#76685E]">
          Cargando sistema escolar Biblioteca Horizonte...
        </div>
      </div>
    );
  }

  const cantidadPendientes = reservas.filter((r) => r.estado === 'PENDIENTE').length;
  const reservasDocenteActual = reservas.filter((r) => r.usuarioId === usuarioActual.id);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D231E] flex flex-col antialiased">
      {/* Barra de Navegación Principal (Top Bar Contract) */}
      <Cabecera
        pestañaActiva={pestañaActiva}
        alCambiarPestaña={setPestañaActiva}
        usuarioActual={usuarioActual}
        usuariosDisponibles={usuarios}
        alCambiarUsuario={setUsuarioActual}
        alAbrirNuevaReserva={() => {
          setPreseleccionSlot({});
          setModalNuevaReservaAbierto(true);
        }}
        cantidadPendientes={cantidadPendientes}
      />

      {/* Hero / Portada */}
      <div className="border-b border-[#E8E0D5] bg-[#F5EFE6]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 flex flex-col items-center gap-4">
          <div className="w-full max-w-3xl h-48 md:h-64 rounded-xl overflow-hidden border border-[#E0D7C9] bg-[#EFE8DD] relative shadow-xs">
            <img
              src={bannerImg}
              alt="Biblioteca Horizonte"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1.5 max-w-3xl text-center">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C85A32]">
              <span className="w-full">Sistema de Recursos Tecnológicos</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2D231E]">
              Gestión y Préstamo de Notebooks y Proyectores
            </h1>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {pestañaActiva === 'disponibilidad' && (
          <MatrizDisponibilidad
            equipos={equipos}
            reservas={reservas}
            alReservarSlot={(eqId, mod, fec) => {
              setPreseleccionSlot({
                equipoId: eqId,
                modulo: mod,
                fecha: fec,
              });
              setModalNuevaReservaAbierto(true);
            }}
          />
        )}

        {pestañaActiva === 'docente' && (
          <DocenteVista
            docenteActual={usuarioActual}
            reservasDocente={reservasDocenteActual}
            alAbrirNuevaReserva={() => {
              setPreseleccionSlot({});
              setModalNuevaReservaAbierto(true);
            }}
            alCancelarReserva={manejarCancelarReservaDocente}
            alVerDisponibilidad={() => setPestañaActiva('disponibilidad')}
          />
        )}

        {pestañaActiva === 'bibliotecaria' && (
          <BibliotecariaVista
            solicitudesPendientes={reservas.filter((r) => r.estado === 'PENDIENTE')}
            todasLasReservas={reservas}
            alAbrirModalConfirmacion={manejarAbrirModalConfirmacion}
            alIrAInventario={() => setPestañaActiva('inventario')}
          />
        )}

        {pestañaActiva === 'inventario' && (
          <InventarioEquipos
            equipos={equipos}
            alCrearEquipo={manejarCrearEquipo}
            alActualizarEquipo={manejarActualizarEquipo}
            alAlternarMantenimiento={manejarAlternarMantenimiento}
            alEliminarEquipo={manejarEliminarEquipo}
          />
        )}

      </main>

     
      

      {/* Modal Nueva Reserva */}
      <ModalNuevaReserva
        abierto={modalNuevaReservaAbierto}
        alCerrar={() => setModalNuevaReservaAbierto(false)}
        equipos={equipos}
        usuarioActual={usuarioActual}
        equipoPreseleccionadoId={preseleccionSlot.equipoId}
        moduloPreseleccionado={preseleccionSlot.modulo}
        fechaPreseleccionada={preseleccionSlot.fecha}
        alCrear={manejarCrearReserva}
      />

      {/* Modal Confirmación / Rechazo en 2 Clics */}
      <ModalConfirmacion
        abierto={modalConfirmacion.abierto}
        reserva={modalConfirmacion.reserva}
        tipoAccion={modalConfirmacion.tipoAccion}
        solicitudesSolapadas={modalConfirmacion.solicitudesSolapadas}
        alCerrar={() =>
          setModalConfirmacion({
            abierto: false,
            reserva: null,
            tipoAccion: null,
            solicitudesSolapadas: [],
          })
        }
        alEjecutar={manejarEjecutarConfirmacion}
      />

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2.5 max-w-md ${
              toast.tipo === 'exito'
                ? 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                : toast.tipo === 'error'
                ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                : 'bg-[#FAF7F2] text-[#2D231E] border-[#D9CEBE]'
            }`}
          >
            <span className="text-sm">
              {toast.tipo === 'exito' ? '✓' : toast.tipo === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            <span>{toast.mensaje}</span>
          </div>
        </div>
      )}
    </div>
  );
}
