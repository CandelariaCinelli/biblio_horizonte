/**
 * Definición de tipos y modelos de datos en español para Biblioteca Horizonte.
 * Refleja estrictamente las entidades del dominio y los DTOs del backend Spring Boot.
 */

export type RolUsuario = 'DOCENTE' | 'BIBLIOTECARIA';

export type TipoEquipo = 'PROYECTOR' | 'NOTEBOOK';

export type EstadoEquipo = 'DISPONIBLE' | 'EN_MANTENIMIENTO';

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';

export type ModuloHorario =
  | 'Módulo 1 (07:30 - 08:50)'
  | 'Módulo 2 (09:00 - 10:20)'
  | 'Módulo 3 (10:30 - 11:50)'
  | 'Módulo 4 (13:30 - 14:50)'
  | 'Módulo 5 (15:00 - 16:20)'
  | 'Módulo 6 (16:30 - 17:50)';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  avatarUrl?: string;
}

export interface Equipo {
  id: number;
  nombre: string;
  tipo: TipoEquipo;
  estado: EstadoEquipo;
  descripcion?: string;
  creadoEn?: string;
}

export interface Reserva {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioEmail: string;
  equipoId: number;
  equipoNombre: string;
  equipoTipo: TipoEquipo;
  fecha: string; // Formato YYYY-MM-DD (LocalDate)
  moduloHorario: ModuloHorario;
  estado: EstadoReserva;
  motivo?: string;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface DisponibilidadEquipo {
  equipoId: number;
  equipoNombre: string;
  tipo: TipoEquipo;
  estadoOperativo: EstadoEquipo;
  fecha: string;
  moduloHorario: ModuloHorario;
  disponibleParaReserva: boolean;
  reservaConfirmadaId?: number;
  reservadoPorDocente?: string;
  cantidadSolicitudesPendientes: number;
}

export interface FiltrosReserva {
  fecha?: string;
  modulo?: string;
  estado?: EstadoReserva | 'TODAS';
  busqueda?: string;
}
