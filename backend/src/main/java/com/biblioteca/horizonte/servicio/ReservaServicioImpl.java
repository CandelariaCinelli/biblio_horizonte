package com.biblioteca.horizonte.servicio;

import com.biblioteca.horizonte.dominio.entidades.Equipo;
import com.biblioteca.horizonte.dominio.entidades.Reserva;
import com.biblioteca.horizonte.dominio.entidades.Usuario;
import com.biblioteca.horizonte.dominio.modelo.EstadoEquipo;
import com.biblioteca.horizonte.dominio.modelo.EstadoReserva;
import com.biblioteca.horizonte.dto.DisponibilidadEquipoDTO;
import com.biblioteca.horizonte.dto.ReservaCreacionDTO;
import com.biblioteca.horizonte.dto.ReservaRespuestaDTO;
import com.biblioteca.horizonte.excepcion.RecursoNoEncontradoException;
import com.biblioteca.horizonte.excepcion.ReglaNegocioException;
import com.biblioteca.horizonte.excepcion.SolapamientoReservaException;
import com.biblioteca.horizonte.repositorio.EquipoRepositorio;
import com.biblioteca.horizonte.repositorio.ReservaRepositorio;
import com.biblioteca.horizonte.repositorio.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaServicioImpl implements ReservaServicio {

    private final ReservaRepositorio reservaRepositorio;
    private final EquipoRepositorio equipoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;

    @Override
    @Transactional
    public ReservaRespuestaDTO solicitarReserva(ReservaCreacionDTO dto) {
        // Validar existencia de usuario docente
        Usuario docente = usuarioRepositorio.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario docente no encontrado con ID: " + dto.getUsuarioId()));

        // Validar existencia de equipo
        Equipo equipo = equipoRepositorio.findById(dto.getEquipoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Equipo tecnológico no encontrado con ID: " + dto.getEquipoId()));

        // Validar que el equipo no esté en mantenimiento
        if (equipo.getEstado() == EstadoEquipo.EN_MANTENIMIENTO) {
            throw new ReglaNegocioException("El equipo '" + equipo.getNombre() + "' se encuentra en mantenimiento y no admite reservas.");
        }

        // Regla de Negocio Crítica (RF06, RF07): Verificar si ya hay una reserva CONFIRMADA en la misma fecha y módulo
        boolean yaConfirmada = reservaRepositorio.existsByEquipoIdAndFechaAndModuloHorarioAndEstado(
                equipo.getId(), dto.getFecha(), dto.getModuloHorario(), EstadoReserva.CONFIRMADA);

        if (yaConfirmada) {
            throw new SolapamientoReservaException(String.format(
                    "Conflicto de solapamiento: El equipo '%s' ya posee una reserva CONFIRMADA para la fecha %s en el %s.",
                    equipo.getNombre(), dto.getFecha(), dto.getModuloHorario()
            ));
        }

        // Crear la reserva en estado inicial PENDIENTE
        Reserva nuevaReserva = Reserva.builder()
                .usuario(docente)
                .equipo(equipo)
                .fecha(dto.getFecha())
                .moduloHorario(dto.getModuloHorario())
                .estado(EstadoReserva.PENDIENTE)
                .motivo(dto.getMotivo() != null ? dto.getMotivo().trim() : "Reserva solicitada")
                .build();

        Reserva guardada = reservaRepositorio.save(nuevaReserva);
        return mapearADTO(guardada);
    }

    @Override
    @Transactional
    public ReservaRespuestaDTO confirmarReserva(Long reservaId, String observacion) {
        Reserva reserva = reservaRepositorio.findById(reservaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con ID: " + reservaId));

        if (reserva.getEstado() != EstadoReserva.PENDIENTE) {
            throw new ReglaNegocioException("Únicamente pueden confirmarse solicitudes en estado PENDIENTE. Estado actual: " + reserva.getEstado());
        }

        if (reserva.getEquipo().getEstado() == EstadoEquipo.EN_MANTENIMIENTO) {
            throw new ReglaNegocioException("No se puede confirmar. El equipo asignado ha pasado a mantenimiento.");
        }

        // Control estricto de solapamiento anti-concurrencia
        boolean existeConfirmada = reservaRepositorio.existsByEquipoIdAndFechaAndModuloHorarioAndEstado(
                reserva.getEquipo().getId(), reserva.getFecha(), reserva.getModuloHorario(), EstadoReserva.CONFIRMADA);

        if (existeConfirmada) {
            throw new SolapamientoReservaException(String.format(
                    "No es posible confirmar. Ya existe otra reserva CONFIRMADA para el equipo '%s' en la fecha %s y módulo %s.",
                    reserva.getEquipo().getNombre(), reserva.getFecha(), reserva.getModuloHorario()
            ));
        }

        // Confirmar la reserva seleccionada
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        if (observacion != null && !observacion.isBlank()) {
            reserva.setMotivo(reserva.getMotivo() + " | Confirmación: " + observacion.trim());
        }
        Reserva confirmada = reservaRepositorio.save(reserva);

        // REGLA CRÍTICA: "Si una reserva se confirma, cualquier otra solicitud PENDIENTE
        // sobre el mismo recurso, fecha y módulo debe ser rechazada o bloqueada de forma automática."
        List<Reserva> pendientesSolapadas = reservaRepositorio.findByEquipoIdAndFechaAndModuloHorarioAndEstadoAndIdNot(
                reserva.getEquipo().getId(),
                reserva.getFecha(),
                reserva.getModuloHorario(),
                EstadoReserva.PENDIENTE,
                reserva.getId()
        );

        for (Reserva solapada : pendientesSolapadas) {
            solapada.setEstado(EstadoReserva.RECHAZADA);
            solapada.setMotivo("Rechazo automático: el recurso fue asignado a la reserva #" + confirmada.getId() + " (" + confirmada.getUsuario().getNombre() + ")");
            reservaRepositorio.save(solapada);
        }

        return mapearADTO(confirmada);
    }

    @Override
    @Transactional
    public ReservaRespuestaDTO rechazarReserva(Long reservaId, String motivo) {
        Reserva reserva = reservaRepositorio.findById(reservaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con ID: " + reservaId));

        if (reserva.getEstado() != EstadoReserva.PENDIENTE) {
            throw new ReglaNegocioException("Únicamente pueden rechazarse solicitudes en estado PENDIENTE.");
        }

        reserva.setEstado(EstadoReserva.RECHAZADA);
        String motivoRechazo = (motivo != null && !motivo.isBlank()) ? motivo.trim() : "Solicitud denegada por la bibliotecaria";
        reserva.setMotivo(motivoRechazo);

        Reserva rechazada = reservaRepositorio.save(reserva);
        return mapearADTO(rechazada);
    }

    @Override
    @Transactional
    public void cancelarReservaDocente(Long reservaId, Long usuarioId) {
        Reserva reserva = reservaRepositorio.findById(reservaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con ID: " + reservaId));

        if (!reserva.getUsuario().getId().equals(usuarioId)) {
            throw new ReglaNegocioException("No posee autorización para cancelar solicitudes de otros docentes.");
        }

        if (reserva.getEstado() != EstadoReserva.PENDIENTE) {
            throw new ReglaNegocioException("Solo puede cancelar solicitudes que aún estén PENDIENTES.");
        }

        reservaRepositorio.delete(reserva);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservaRespuestaDTO> obtenerSolicitudesPendientesCronologicas() {
        return reservaRepositorio.findByEstadoOrderByCreadoEnAsc(EstadoReserva.PENDIENTE).stream()
                .map(this::mapearADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservaRespuestaDTO> obtenerReservasPorDocente(Long usuarioId) {
        return reservaRepositorio.findByUsuarioIdOrderByFechaDescCreadoEnDesc(usuarioId).stream()
                .map(this::mapearADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisponibilidadEquipoDTO> consultarDisponibilidad(LocalDate fecha, String moduloHorario) {
        // Optimización RNF03: Recuperar todos los equipos y las reservas de esa fecha/módulo en una sola consulta
        List<Equipo> todosLosEquipos = equipoRepositorio.findAll();
        List<Reserva> reservasModulo = reservaRepositorio.findByFechaAndModuloHorario(fecha, moduloHorario);

        // Agrupar reservas por equipo
        Map<Long, List<Reserva>> reservasPorEquipo = reservasModulo.stream()
                .collect(Collectors.groupingBy(r -> r.getEquipo().getId()));

        return todosLosEquipos.stream().map(equipo -> {
            List<Reserva> reservasEquipo = reservasPorEquipo.getOrDefault(equipo.getId(), List.of());
            
            Optional<Reserva> confirmadaOpt = reservasEquipo.stream()
                    .filter(r -> r.getEstado() == EstadoReserva.CONFIRMADA)
                    .findFirst();

            long pendientesCount = reservasEquipo.stream()
                    .filter(r -> r.getEstado() == EstadoReserva.PENDIENTE)
                    .count();

            boolean disponible = equipo.getEstado() == EstadoEquipo.DISPONIBLE && confirmadaOpt.isEmpty();

            return DisponibilidadEquipoDTO.builder()
                    .equipoId(equipo.getId())
                    .equipoNombre(equipo.getNombre())
                    .tipo(equipo.getTipo())
                    .estadoOperativo(equipo.getEstado())
                    .fecha(fecha)
                    .moduloHorario(moduloHorario)
                    .disponibleParaReserva(disponible)
                    .reservaConfirmadaId(confirmadaOpt.map(Reserva::getId).orElse(null))
                    .reservadoPorDocente(confirmadaOpt.map(r -> r.getUsuario().getNombre()).orElse(null))
                    .cantidadSolicitudesPendientes((int) pendientesCount)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservaRespuestaDTO> filtrarReservas(LocalDate fecha, String modulo, EstadoReserva estado) {
        return reservaRepositorio.filtrarReservas(fecha, modulo, estado).stream()
                .map(this::mapearADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReservaRespuestaDTO obtenerPorId(Long id) {
        Reserva reserva = reservaRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada con ID: " + id));
        return mapearADTO(reserva);
    }

    private ReservaRespuestaDTO mapearADTO(Reserva reserva) {
        return ReservaRespuestaDTO.builder()
                .id(reserva.getId())
                .usuarioId(reserva.getUsuario().getId())
                .usuarioNombre(reserva.getUsuario().getNombre())
                .usuarioEmail(reserva.getUsuario().getEmail())
                .equipoId(reserva.getEquipo().getId())
                .equipoNombre(reserva.getEquipo().getNombre())
                .equipoTipo(reserva.getEquipo().getTipo())
                .fecha(reserva.getFecha())
                .moduloHorario(reserva.getModuloHorario())
                .estado(reserva.getEstado())
                .motivo(reserva.getMotivo())
                .creadoEn(reserva.getCreadoEn())
                .actualizadoEn(reserva.getActualizadoEn())
                .build();
    }
}
