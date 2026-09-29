package com.biblioteca.horizonte.repositorio;

import com.biblioteca.horizonte.dominio.entidades.Usuario;
import com.biblioteca.horizonte.dominio.modelo.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findByRol(RolUsuario rol);
}
