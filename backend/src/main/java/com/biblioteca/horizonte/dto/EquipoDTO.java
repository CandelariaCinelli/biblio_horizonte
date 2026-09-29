package com.biblioteca.horizonte.dto;

import com.biblioteca.horizonte.dominio.modelo.EstadoEquipo;
import com.biblioteca.horizonte.dominio.modelo.TipoEquipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO para el ABM y consulta de equipos (RF09, HU10).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipoDTO {

    private Long id;

    @NotBlank(message = "El nombre del equipo es obligatorio")
    private String nombre;

    @NotNull(message = "El tipo de equipo es obligatorio (PROYECTOR o NOTEBOOK)")
    private TipoEquipo tipo;

    @NotNull(message = "El estado operativo es obligatorio (DISPONIBLE o EN_MANTENIMIENTO)")
    private EstadoEquipo estado;

    private String descripcion;
}
