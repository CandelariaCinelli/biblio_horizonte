package com.biblioteca.horizonte.controlador;

import com.biblioteca.horizonte.dominio.modelo.EstadoReserva;
import com.biblioteca.horizonte.dto.CambioEstadoReservaDTO;
import com.biblioteca.horizonte.dto.ReservaCreacionDTO;
import com.biblioteca.horizonte.dto.ReservaRespuestaDTO;
import com.biblioteca.horizonte.servicio.ReservaServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservaControlador {

    private final ReservaServicio reservaServicio;

    /**
     * Solicitar reserva de un equipo (RF02, RF03, HU01).
     */
    @PostMapping
    public ResponseEntity<ReservaRespuestaDTO> solicitarReserva(@Valid @RequestBody ReservaCreacionDTO dto) {
        ReservaRespuestaDTO respuesta = reservaServicio.solicitarReserva(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    /**
     * Panel cronológico de solicitudes pendientes para la bibliotecaria (RF04, HU03).
     */
    @GetMapping("/pendientes")
    public ResponseEntity<List<ReservaRespuestaDTO>> listarPendientes() {
        return ResponseEntity.ok(reservaServicio.obtenerSolicitudesPendientesCronologicas());
    }

    /**
     * Listado de reservas de un docente (RF08, HU02).
     */
    @GetMapping("/docente/{usuarioId}")
    public ResponseEntity<List<ReservaRespuestaDTO>> listarPorDocente(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(reservaServicio.obtenerReservasPorDocente(usuarioId));
    }

    /**
     * Confirmación rápida en 2 clics por la bibliotecaria (RF05, HU04).
     */
    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<ReservaRespuestaDTO> confirmarReserva(
            @PathVariable Long id,
            @RequestBody(required = false) CambioEstadoReservaDTO dto) {
        String observacion = (dto != null) ? dto.getObservacion() : "";
        return ResponseEntity.ok(reservaServicio.confirmarReserva(id, observacion));
    }

    /**
     * Rechazo de reserva por la bibliotecaria (RF05, HU05).
     */
    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<ReservaRespuestaDTO> rechazarReserva(
            @PathVariable Long id,
            @RequestBody(required = false) CambioEstadoReservaDTO dto) {
        String motivo = (dto != null && dto.getObservacion() != null) ? dto.getObservacion() : "Rechazado por bibliotecaria";
        return ResponseEntity.ok(reservaServicio.rechazarReserva(id, motivo));
    }

    /**
     * Cancelación por el propio docente solicitante (HU09).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelarReserva(
            @PathVariable Long id,
            @RequestParam Long usuarioId) {
        reservaServicio.cancelarReservaDocente(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Búsqueda y filtrado dinámico de reservas (HU07).
     */
    @GetMapping
    public ResponseEntity<List<ReservaRespuestaDTO>> filtrarReservas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) EstadoReserva estado) {
        return ResponseEntity.ok(reservaServicio.filtrarReservas(fecha, modulo, estado));
    }

    /**
     * Consulta individual por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReservaRespuestaDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(reservaServicio.obtenerPorId(id));
    }
}
