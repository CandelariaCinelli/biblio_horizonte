package com.biblioteca.horizonte.repositorio;

import com.biblioteca.horizonte.dominio.entidades.Reserva;
import com.biblioteca.horizonte.dominio.modelo.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepositorio extends JpaRepository<Reserva, Long> {

    /**
     * Verifica si ya existe una reserva CONFIRMADA para el mismo equipo, fecha y módulo (RF06, RF07).
     */
    boolean existsByEquipoIdAndFechaAndModuloHorarioAndEstado(
            Long equipoId, LocalDate fecha, String moduloHorario, EstadoReserva estado);

    /**
     * Obtiene la reserva confirmada específica si existe.
     */
    Optional<Reserva> findFirstByEquipoIdAndFechaAndModuloHorarioAndEstado(
            Long equipoId, LocalDate fecha, String moduloHorario, EstadoReserva estado);

    /**
     * Lista de reservas para una fecha y módulo horario (usado para matriz de disponibilidad de alta velocidad).
     */
    List<Reserva> findByFechaAndModuloHorario(LocalDate fecha, String moduloHorario);

    /**
     * Vista cronológica de solicitudes para la bibliotecaria, ordenadas por tiempo de creación ascendente (RF04, HU03).
     */
    List<Reserva> findByEstadoOrderByCreadoEnAsc(EstadoReserva estado);

    /**
     * Consulta de solicitudes de un docente específico ordenadas por fecha (RF08, HU02).
     */
    List<Reserva> findByUsuarioIdOrderByFechaDescCreadoEnDesc(Long usuarioId);

    /**
     * Encuentra solicitudes pendientes sobre el mismo equipo, fecha y módulo horario (excluyendo una dada),
     * para auto-rechazarlas cuando una solicitud es confirmada.
     */
    List<Reserva> findByEquipoIdAndFechaAndModuloHorarioAndEstadoAndIdNot(
            Long equipoId, LocalDate fecha, String moduloHorario, EstadoReserva estado, Long idExcluido);

    /**
     * Filtro dinámico de reservas por fecha, módulo y estado opcionales (HU07).
     */
    @Query("SELECT r FROM Reserva r WHERE " +
           "(:fecha IS NULL OR r.fecha = :fecha) AND " +
           "(:modulo IS NULL OR r.moduloHorario = :modulo) AND " +
           "(:estado IS NULL OR r.estado = :estado) " +
           "ORDER BY r.creadoEn ASC")
    List<Reserva> filtrarReservas(
            @Param("fecha") LocalDate fecha,
            @Param("modulo") String modulo,
            @Param("estado") EstadoReserva estado);
}
