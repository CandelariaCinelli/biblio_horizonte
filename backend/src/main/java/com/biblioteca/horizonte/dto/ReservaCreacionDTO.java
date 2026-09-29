package com.biblioteca.horizonte.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

/**
 * DTO para la solicitud de creación de una nueva reserva (RF02, RF03).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaCreacionDTO {

    @NotNull(message = "El ID del usuario docente es obligatorio")
    private Long usuarioId;

    @NotNull(message = "El ID del equipo solicitado es obligatorio")
    private Long equipoId;

    @NotNull(message = "La fecha de reserva es obligatoria")
    @FutureOrPresent(message = "La fecha de la reserva no puede ser en el pasado")
    private LocalDate fecha;

    @NotBlank(message = "El módulo horario es obligatorio")
    private String moduloHorario;

    private String motivo;
}
