package com.biblioteca.horizonte.controlador;

import com.biblioteca.horizonte.dto.DisponibilidadEquipoDTO;
import com.biblioteca.horizonte.servicio.ReservaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/disponibilidad")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DisponibilidadControlador {

    private final ReservaServicio reservaServicio;

    /**
     * Consulta de disponibilidad de equipos por fecha y módulo (RF10, HU08, RNF03).
     * Respuesta optimizada para ejecutarse en menos de 1 segundo mediante índices en PostgreSQL.
     */
    @GetMapping
    public ResponseEntity<List<DisponibilidadEquipoDTO>> consultarDisponibilidad(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam String modulo) {
        return ResponseEntity.ok(reservaServicio.consultarDisponibilidad(fecha, modulo));
    }
}
