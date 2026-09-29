package com.biblioteca.horizonte.dto;

import com.biblioteca.horizonte.dominio.modelo.EstadoEquipo;
import com.biblioteca.horizonte.dominio.modelo.TipoEquipo;
import lombok.*;
import java.time.LocalDate;

/**
 * DTO optimizado para la consulta rápida de disponibilidad por fecha y módulo (RF10, RNF03).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisponibilidadEquipoDTO {

    private Long equipoId;
    private String equipoNombre;
    private TipoEquipo tipo;
    private EstadoEquipo estadoOperativo;
    private LocalDate fecha;
    private String moduloHorario;
    private boolean disponibleParaReserva;
    private Long reservaConfirmadaId;
    private String reservadoPorDocente;
    private int cantidadSolicitudesPendientes;
}
