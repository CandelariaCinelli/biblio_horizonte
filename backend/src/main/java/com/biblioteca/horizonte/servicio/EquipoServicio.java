package com.biblioteca.horizonte.servicio;

import com.biblioteca.horizonte.dto.EquipoDTO;
import java.util.List;

public interface EquipoServicio {
    List<EquipoDTO> listarTodos();
    EquipoDTO obtenerPorId(Long id);
    EquipoDTO crear(EquipoDTO dto);
    EquipoDTO actualizar(Long id, EquipoDTO dto);
    EquipoDTO alternarEstadoMantenimiento(Long id);
    void eliminar(Long id);
}
