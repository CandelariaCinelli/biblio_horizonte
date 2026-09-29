package com.biblioteca.horizonte.controlador;

import com.biblioteca.horizonte.dto.EquipoDTO;
import com.biblioteca.horizonte.servicio.EquipoServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EquipoControlador {

    private final EquipoServicio equipoServicio;

    @GetMapping
    public ResponseEntity<List<EquipoDTO>> listarTodos() {
        return ResponseEntity.ok(equipoServicio.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(equipoServicio.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<EquipoDTO> crear(@Valid @RequestBody EquipoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipoServicio.crear(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipoDTO> actualizar(@PathVariable Long id, @Valid @RequestBody EquipoDTO dto) {
        return ResponseEntity.ok(equipoServicio.actualizar(id, dto));
    }

    @PatchMapping("/{id}/alternar-mantenimiento")
    public ResponseEntity<EquipoDTO> alternarMantenimiento(@PathVariable Long id) {
        return ResponseEntity.ok(equipoServicio.alternarEstadoMantenimiento(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        equipoServicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
