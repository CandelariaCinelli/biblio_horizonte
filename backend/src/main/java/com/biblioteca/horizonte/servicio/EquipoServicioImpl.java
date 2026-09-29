package com.biblioteca.horizonte.servicio;

import com.biblioteca.horizonte.dominio.entidades.Equipo;
import com.biblioteca.horizonte.dominio.modelo.EstadoEquipo;
import com.biblioteca.horizonte.dto.EquipoDTO;
import com.biblioteca.horizonte.excepcion.RecursoNoEncontradoException;
import com.biblioteca.horizonte.excepcion.ReglaNegocioException;
import com.biblioteca.horizonte.repositorio.EquipoRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipoServicioImpl implements EquipoServicio {

    private final EquipoRepositorio equipoRepositorio;

    @Override
    @Transactional(readOnly = true)
    public List<EquipoDTO> listarTodos() {
        return equipoRepositorio.findAll().stream()
                .map(this::mapearADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EquipoDTO obtenerPorId(Long id) {
        Equipo equipo = equipoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Equipo tecnológico no encontrado con ID: " + id));
        return mapearADTO(equipo);
    }

    @Override
    @Transactional
    public EquipoDTO crear(EquipoDTO dto) {
        if (equipoRepositorio.existsByNombreIgnoreCase(dto.getNombre())) {
            throw new ReglaNegocioException("Ya existe un equipo registrado con el nombre: " + dto.getNombre());
        }

        Equipo nuevo = Equipo.builder()
                .nombre(dto.getNombre().trim())
                .tipo(dto.getTipo())
                .estado(dto.getEstado() != null ? dto.getEstado() : EstadoEquipo.DISPONIBLE)
                .descripcion(dto.getDescripcion())
                .build();

        Equipo guardado = equipoRepositorio.save(nuevo);
        return mapearADTO(guardado);
    }

    @Override
    @Transactional
    public EquipoDTO actualizar(Long id, EquipoDTO dto) {
        Equipo existente = equipoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Equipo no encontrado con ID: " + id));

        existente.setNombre(dto.getNombre().trim());
        existente.setTipo(dto.getTipo());
        existente.setEstado(dto.getEstado());
        existente.setDescripcion(dto.getDescripcion());

        Equipo actualizado = equipoRepositorio.save(existente);
        return mapearADTO(actualizado);
    }

    @Override
    @Transactional
    public EquipoDTO alternarEstadoMantenimiento(Long id) {
        Equipo existente = equipoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Equipo no encontrado con ID: " + id));

        if (existente.getEstado() == EstadoEquipo.DISPONIBLE) {
            existente.setEstado(EstadoEquipo.EN_MANTENIMIENTO);
        } else {
            existente.setEstado(EstadoEquipo.DISPONIBLE);
        }

        return mapearADTO(equipoRepositorio.save(existente));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!equipoRepositorio.existsById(id)) {
            throw new RecursoNoEncontradoException("No se puede eliminar. Equipo inexistente con ID: " + id);
        }
        equipoRepositorio.deleteById(id);
    }

    private EquipoDTO mapearADTO(Equipo equipo) {
        return EquipoDTO.builder()
                .id(equipo.getId())
                .nombre(equipo.getNombre())
                .tipo(equipo.getTipo())
                .estado(equipo.getEstado())
                .descripcion(equipo.getDescripcion())
                .build();
    }
}
