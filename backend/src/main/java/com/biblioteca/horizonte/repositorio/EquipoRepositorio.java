package com.biblioteca.horizonte.repositorio;

import com.biblioteca.horizonte.dominio.entidades.Equipo;
import com.biblioteca.horizonte.dominio.modelo.EstadoEquipo;
import com.biblioteca.horizonte.dominio.modelo.TipoEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipoRepositorio extends JpaRepository<Equipo, Long> {
    List<Equipo> findByEstado(EstadoEquipo estado);
    List<Equipo> findByTipo(TipoEquipo tipo);
    boolean existsByNombreIgnoreCase(String nombre);
}
