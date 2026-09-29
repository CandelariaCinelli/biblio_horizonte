package com.biblioteca.horizonte.dto;

import com.biblioteca.horizonte.dominio.modelo.EstadoReserva;
import com.biblioteca.horizonte.dominio.modelo.TipoEquipo;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para la respuesta con datos completos de la reserva.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaRespuestaDTO {

    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioEmail;
    private Long equipoId;
    private String equipoNombre;
    private TipoEquipo equipoTipo;
    private LocalDate fecha;
    private String moduloHorario;
    private EstadoReserva estado;
    private String motivo;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
}
