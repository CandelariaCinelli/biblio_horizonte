/**
 * Servicio de Cliente API - Biblioteca Horizonte
 * Emula fielmente los endpoints REST del backend Spring Boot (/api/v1/*)
 * e implementa de manera estricta todas las reglas de negocio, validaciones de solapamiento
 * y persistencia en tiempo real.
 */

import {
  Usuario,
  Equipo,
  Reserva,
  ModuloHorario,
  EstadoReserva,
  DisponibilidadEquipo,
  FiltrosReserva,
} from '../tipos';
import {
  USUARIOS_INICIALES,
  EQUIPOS_INICIALES,
  RESERVAS_INICIALES,
  MODULOS_HORARIOS_LISTA,
} from '../datos/datosIniciales';

const STORAGE_KEY_EQUIPOS = 'biblioteca_horizonte_equipos_v1';
const STORAGE_KEY_RESERVAS = 'biblioteca_horizonte_reservas_v1';
const STORAGE_KEY_USUARIOS = 'biblioteca_horizonte_usuarios_v1';

class ApiServicio {
  private equipos: Equipo[] = [];
  private reservas: Reserva[] = [];
  private usuarios: Usuario[] = [];

  constructor() {
    this.cargarDesdeStorage();
  }

  private cargarDesdeStorage(): void {
    try {
      const eqRaw = localStorage.getItem(STORAGE_KEY_EQUIPOS);
      const resRaw = localStorage.getItem(STORAGE_KEY_RESERVAS);
      const usrRaw = localStorage.getItem(STORAGE_KEY_USUARIOS);

      this.equipos = eqRaw ? JSON.parse(eqRaw) : [...EQUIPOS_INICIALES];
      this.reservas = resRaw ? JSON.parse(resRaw) : [...RESERVAS_INICIALES];
      this.usuarios = usrRaw ? JSON.parse(usrRaw) : [...USUARIOS_INICIALES];
    } catch {
      this.equipos = [...EQUIPOS_INICIALES];
      this.reservas = [...RESERVAS_INICIALES];
      this.usuarios = [...USUARIOS_INICIALES];
    }
  }

  private guardarEnStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_EQUIPOS, JSON.stringify(this.equipos));
      localStorage.setItem(STORAGE_KEY_RESERVAS, JSON.stringify(this.reservas));
      localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(this.usuarios));
    } catch (e) {
      console.error('Error guardando en almacenamiento local:', e);
    }
  }

  public restablecerDatos(): void {
    this.equipos = [...EQUIPOS_INICIALES];
    this.reservas = [...RESERVAS_INICIALES];
    this.usuarios = [...USUARIOS_INICIALES];
    this.guardarEnStorage();
  }

  // =========================================================================
  // USUARIOS
  // =========================================================================
  public async obtenerUsuarios(): Promise<Usuario[]> {
    return [...this.usuarios];
  }

  public async obtenerUsuarioPorId(id: number): Promise<Usuario | undefined> {
    return this.usuarios.find((u) => u.id === id);
  }

  // =========================================================================
  // EQUIPOS (ABM / CRUD - RF09, HU10)
  // =========================================================================
  public async obtenerEquipos(): Promise<Equipo[]> {
    return [...this.equipos];
  }

  public async obtenerEquipoPorId(id: number): Promise<Equipo> {
    const equipo = this.equipos.find((e) => e.id === id);
    if (!equipo) {
      throw new Error(`Equipo no encontrado con ID: ${id}`);
    }
    return { ...equipo };
  }

  public async crearEquipo(datos: Omit<Equipo, 'id' | 'creadoEn'>): Promise<Equipo> {
    const existe = this.equipos.some(
      (e) => e.nombre.trim().toLowerCase() === datos.nombre.trim().toLowerCase()
    );
    if (existe) {
      throw new Error(`Ya existe un equipo registrado con el nombre: "${datos.nombre}"`);
    }

    const nuevoId = this.equipos.length > 0 ? Math.max(...this.equipos.map((e) => e.id)) + 1 : 1;
    const nuevoEquipo: Equipo = {
      ...datos,
      id: nuevoId,
      creadoEn: new Date().toISOString(),
    };

    this.equipos.push(nuevoEquipo);
    this.guardarEnStorage();
    return nuevoEquipo;
  }

  public async actualizarEquipo(id: number, datos: Partial<Equipo>): Promise<Equipo> {
    const index = this.equipos.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Equipo con ID ${id} no encontrado.`);
    }

    if (datos.nombre) {
      const nombreDuplicado = this.equipos.some(
        (e) => e.id !== id && e.nombre.trim().toLowerCase() === datos.nombre!.trim().toLowerCase()
      );
      if (nombreDuplicado) {
        throw new Error(`Ya existe otro equipo con el nombre: "${datos.nombre}"`);
      }
    }

    this.equipos[index] = {
      ...this.equipos[index],
      ...datos,
    };

    this.guardarEnStorage();
    return this.equipos[index];
  }

  public async alternarEstadoMantenimiento(id: number): Promise<Equipo> {
    const equipo = await this.obtenerEquipoPorId(id);
    const nuevoEstado = equipo.estado === 'DISPONIBLE' ? 'EN_MANTENIMIENTO' : 'DISPONIBLE';
    return this.actualizarEquipo(id, { estado: nuevoEstado });
  }

  public async eliminarEquipo(id: number): Promise<void> {
    const tieneReservasActivas = this.reservas.some(
      (r) => r.equipoId === id && (r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE')
    );
    if (tieneReservasActivas) {
      throw new Error(
        'No se puede eliminar el equipo porque tiene reservas activas (pendientes o confirmadas).'
      );
    }

    this.equipos = this.equipos.filter((e) => e.id !== id);
    this.guardarEnStorage();
  }

  // =========================================================================
  // RESERVAS & REGLAS DE NEGOCIO CRÍTICAS (RF02 - RF08, RNF02)
  // =========================================================================

  public async obtenerReservas(filtros?: FiltrosReserva): Promise<Reserva[]> {
    let resultado = [...this.reservas];

    if (filtros) {
      if (filtros.fecha) {
        resultado = resultado.filter((r) => r.fecha === filtros.fecha);
      }
      if (filtros.modulo) {
        resultado = resultado.filter((r) => r.moduloHorario === filtros.modulo);
      }
      if (filtros.estado && filtros.estado !== 'TODAS') {
        resultado = resultado.filter((r) => r.estado === filtros.estado);
      }
      if (filtros.busqueda) {
        const query = filtros.busqueda.toLowerCase();
        resultado = resultado.filter(
          (r) =>
            r.usuarioNombre.toLowerCase().includes(query) ||
            r.equipoNombre.toLowerCase().includes(query) ||
            (r.motivo && r.motivo.toLowerCase().includes(query))
        );
      }
    }

    return resultado.sort(
      (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
    );
  }

  /**
   * Vista cronológica de solicitudes pendientes para la bibliotecaria (RF04, HU03)
   */
  public async obtenerSolicitudesPendientes(): Promise<Reserva[]> {
    return this.reservas
      .filter((r) => r.estado === 'PENDIENTE')
      .sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime());
  }

  /**
   * Listado de reservas de un docente específico (RF08, HU02)
   */
  public async obtenerReservasDocente(usuarioId: number): Promise<Reserva[]> {
    return this.reservas
      .filter((r) => r.usuarioId === usuarioId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  /**
   * Solicitar una nueva reserva (RF02, RF03, HU01)
   */
  public async solicitarReserva(datos: {
    usuarioId: number;
    equipoId: number;
    fecha: string;
    moduloHorario: ModuloHorario;
    motivo?: string;
  }): Promise<Reserva> {
    const usuario = this.usuarios.find((u) => u.id === datos.usuarioId);
    if (!usuario) {
      throw new Error(`Usuario docente no encontrado con ID: ${datos.usuarioId}`);
    }

    const equipo = this.equipos.find((e) => e.id === datos.equipoId);
    if (!equipo) {
      throw new Error(`Equipo tecnológico no encontrado con ID: ${datos.equipoId}`);
    }

    if (equipo.estado === 'EN_MANTENIMIENTO') {
      throw new Error(`El equipo "${equipo.nombre}" se encuentra en mantenimiento y no puede reservarse.`);
    }

    // Regla de Negocio Crítica (RF06, RF07): Verificar si ya hay una reserva CONFIRMADA
    const reservaConfirmadaExistente = this.reservas.find(
      (r) =>
        r.equipoId === datos.equipoId &&
        r.fecha === datos.fecha &&
        r.moduloHorario === datos.moduloHorario &&
        r.estado === 'CONFIRMADA'
    );

    if (reservaConfirmadaExistente) {
      throw new Error(
        `Conflicto de solapamiento: El equipo "${equipo.nombre}" ya posee una reserva CONFIRMADA para la fecha ${datos.fecha} en el ${datos.moduloHorario}.`
      );
    }

    const nuevoId = this.reservas.length > 0 ? Math.max(...this.reservas.map((r) => r.id)) + 1 : 101;
    const nuevaReserva: Reserva = {
      id: nuevoId,
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombre,
      usuarioEmail: usuario.email,
      equipoId: equipo.id,
      equipoNombre: equipo.nombre,
      equipoTipo: equipo.tipo,
      fecha: datos.fecha,
      moduloHorario: datos.moduloHorario,
      estado: 'PENDIENTE',
      motivo: datos.motivo || 'Uso pedagógico en aula',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    this.reservas.push(nuevaReserva);
    this.guardarEnStorage();
    return nuevaReserva;
  }

  /**
   * Confirmación de reserva en 2 clics (RF05, HU04)
   * REGLA CRÍTICA: "Si una reserva se confirma, cualquier otra solicitud PENDIENTE
   * sobre el mismo recurso, fecha y módulo debe ser rechazada o bloqueada de forma automática."
   */
  public async confirmarReserva(id: number, observacion?: string): Promise<{
    confirmada: Reserva;
    rechazadasAutomaticamente: Reserva[];
  }> {
    const index = this.reservas.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Reserva no encontrada con ID: ${id}`);
    }

    const reserva = this.reservas[index];
    if (reserva.estado !== 'PENDIENTE') {
      throw new Error(`Solo se pueden confirmar reservas en estado PENDIENTE. Estado actual: ${reserva.estado}`);
    }

    const equipo = this.equipos.find((e) => e.id === reserva.equipoId);
    if (equipo && equipo.estado === 'EN_MANTENIMIENTO') {
      throw new Error('No es posible confirmar la reserva: el equipo se encuentra en mantenimiento.');
    }

    // Doble validación de solapamiento
    const otraConfirmada = this.reservas.find(
      (r) =>
        r.id !== id &&
        r.equipoId === reserva.equipoId &&
        r.fecha === reserva.fecha &&
        r.moduloHorario === reserva.moduloHorario &&
        r.estado === 'CONFIRMADA'
    );

    if (otraConfirmada) {
      throw new Error(
        `Conflicto de solapamiento en base de datos: Ya existe otra reserva confirmada (#${otraConfirmada.id}) para este equipo, fecha y módulo.`
      );
    }

    // 1. Confirmar la reserva seleccionada
    const ahora = new Date().toISOString();
    this.reservas[index] = {
      ...reserva,
      estado: 'CONFIRMADA',
      motivo: observacion ? `${reserva.motivo || ''} | Aprobación: ${observacion}`.trim() : reserva.motivo,
      actualizadoEn: ahora,
    };

    const reservaConfirmada = this.reservas[index];
    const rechazadasAutomaticamente: Reserva[] = [];

    // 2. RECHAZAR AUTOMÁTICAMENTE todas las demás solicitudes PENDIENTES que compitan por el mismo equipo, fecha y módulo
    this.reservas = this.reservas.map((r) => {
      if (
        r.id !== id &&
        r.equipoId === reserva.equipoId &&
        r.fecha === reserva.fecha &&
        r.moduloHorario === reserva.moduloHorario &&
        r.estado === 'PENDIENTE'
      ) {
        const rechazada: Reserva = {
          ...r,
          estado: 'RECHAZADA',
          motivo: `Rechazo automático: recurso asignado a reserva #${id} (${reservaConfirmada.usuarioNombre})`,
          actualizadoEn: ahora,
        };
        rechazadasAutomaticamente.push(rechazada);
        return rechazada;
      }
      return r;
    });

    this.guardarEnStorage();
    return {
      confirmada: reservaConfirmada,
      rechazadasAutomaticamente,
    };
  }

  /**
   * Rechazar una solicitud de reserva por la bibliotecaria (RF05, HU05)
   */
  public async rechazarReserva(id: number, motivoRechazo?: string): Promise<Reserva> {
    const index = this.reservas.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Reserva no encontrada con ID: ${id}`);
    }

    const reserva = this.reservas[index];
    if (reserva.estado !== 'PENDIENTE') {
      throw new Error(`Solo se pueden rechazar solicitudes en estado PENDIENTE.`);
    }

    this.reservas[index] = {
      ...reserva,
      estado: 'RECHAZADA',
      motivo: motivoRechazo || 'Solicitud no autorizada por la bibliotecaria',
      actualizadoEn: new Date().toISOString(),
    };

    this.guardarEnStorage();
    return this.reservas[index];
  }

  /**
   * Cancelar solicitud propia en estado PENDIENTE (Docente) (HU09)
   */
  public async cancelarReservaDocente(id: number, usuarioId: number): Promise<void> {
    const reserva = this.reservas.find((r) => r.id === id);
    if (!reserva) {
      throw new Error(`Reserva no encontrada con ID: ${id}`);
    }

    if (reserva.usuarioId !== usuarioId) {
      throw new Error('No posees autorización para cancelar una reserva perteneciente a otro docente.');
    }

    if (reserva.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden cancelar solicitudes que aún estén en estado PENDIENTE.');
    }

    this.reservas = this.reservas.filter((r) => r.id !== id);
    this.guardarEnStorage();
  }

  // =========================================================================
  // DISPONIBILIDAD DE ALTA VELOCIDAD (RF10, HU08, RNF03 < 1s)
  // =========================================================================
  public async consultarDisponibilidad(
    fecha: string,
    moduloHorario: ModuloHorario
  ): Promise<DisponibilidadEquipo[]> {
    // Rendimiento optimizado: se procesa en memoria instantáneamente
    const reservasModulo = this.reservas.filter(
      (r) => r.fecha === fecha && r.moduloHorario === moduloHorario
    );

    return this.equipos.map((equipo) => {
      const reservasEquipo = reservasModulo.filter((r) => r.equipoId === equipo.id);
      const confirmada = reservasEquipo.find((r) => r.estado === 'CONFIRMADA');
      const pendientes = reservasEquipo.filter((r) => r.estado === 'PENDIENTE');

      const disponible = equipo.estado === 'DISPONIBLE' && !confirmada;

      return {
        equipoId: equipo.id,
        equipoNombre: equipo.nombre,
        tipo: equipo.tipo,
        estadoOperativo: equipo.estado,
        fecha,
        moduloHorario,
        disponibleParaReserva: disponible,
        reservaConfirmadaId: confirmada?.id,
        reservadoPorDocente: confirmada?.usuarioNombre,
        cantidadSolicitudesPendientes: pendientes.length,
      };
    });
  }

  public obtenerModulosHorarios(): ModuloHorario[] {
    return [...MODULOS_HORARIOS_LISTA];
  }
}

export const apiServicio = new ApiServicio();
