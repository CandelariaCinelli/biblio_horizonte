package com.biblioteca.horizonte.servicio;

import com.biblioteca.horizonte.dominio.modelo.EstadoReserva;
import com.biblioteca.horizonte.dto.DisponibilidadEquipoDTO;
import com.biblioteca.horizonte.dto.ReservaCreacionDTO;
import com.biblioteca.horizonte.dto.ReservaRespuestaDTO;

import java.time.LocalDate;
import java.util.List;

public interface ReservaServicio {

    /**
     * Registra una nueva solicitud de reserva por parte de un docente (RF02, RF03, HU01).
     */
    ReservaRespuestaDTO solicitarReserva(ReservaCreacionDTO dto);

    /**
     * Confirma una reserva en 2 clics por la bibliotecaria y auto-rechaza las pendientes solapadas (RF05, RF06, HU04).
     */
    ReservaRespuestaDTO confirmarReserva(Long reservaId, String observacion);

    /**
     * Rechaza una solicitud de reserva pendiente con motivo explicativo (RF05, HU05).
     */
    ReservaRespuestaDTO rechazarReserva(Long reservaId, String motivo);

    /**
     * Permite al docente solicitante cancelar una reserva propia que esté en estado PENDIENTE (HU09).
     */
    void cancelarReservaDocente(Long reservaId, Long usuarioId);

    /**
     * Panel centralizado para la bibliotecaria con solicitudes pendientes en orden cronológico (RF04, HU03).
     */
    List<ReservaRespuestaDTO> obtenerSolicitudesPendientesCronologicas();

    /**
     * Lista histórica de reservas pertenecientes a un docente (RF08, HU02).
     */
    List<ReservaRespuestaDTO> obtenerReservasPorDocente(Long usuarioId);

    /**
     * Matriz de disponibilidad por fecha y módulo optimizada para respuesta < 1s (RF10, HU08, RNF03).
     */
    List<DisponibilidadEquipoDTO> consultarDisponibilidad(LocalDate fecha, String moduloHorario);

    /**
     * Filtro avanzado de reservas por criterios combinados (HU07).
     */
    List<ReservaRespuestaDTO> filtrarReservas(LocalDate fecha, String modulo, EstadoReserva estado);

    /**
     * Obtiene una reserva por su identificador primario.
     */
    ReservaRespuestaDTO obtenerPorId(Long id);
}
