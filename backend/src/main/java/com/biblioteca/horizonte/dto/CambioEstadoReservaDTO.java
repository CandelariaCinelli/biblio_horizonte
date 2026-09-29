package com.biblioteca.horizonte.dto;

import com.biblioteca.horizonte.dominio.modelo.EstadoReserva;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO para la confirmación o rechazo de una reserva en 2 clics por parte de la bibliotecaria (RF05).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CambioEstadoReservaDTO {

    @NotNull(message = "El nuevo estado es obligatorio (CONFIRMADA o RECHAZADA)")
    private EstadoReserva nuevoEstado;

    private String observacion;
}
