package com.biblioteca.horizonte.repositorio;

import com.biblioteca.horizonte.dominio.entidades.Equipo;
import com.biblioteca.horizonte.dominio.entidades.Reserva;
import com.biblioteca.horizonte.dominio.entidades.Usuario;
import com.biblioteca.horizonte.dominio.modelo.EstadoEquipo;
import com.biblioteca.horizonte.dominio.modelo.EstadoReserva;
import com.biblioteca.horizonte.dominio.modelo.RolUsuario;
import com.biblioteca.horizonte.dominio.modelo.TipoEquipo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@DisplayName("Pruebas de Integración - Persistencia PostgreSQL y Restricción de Unicidad")
class ReservaRepositorioIntegracionTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("biblioteca_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void propiedadesPostgres(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
    }

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ReservaRepositorio reservaRepositorio;

    @Test
    @DisplayName("Debe lanzar DataIntegrityViolationException al intentar persistir dos reservas CONFIRMADAS con mismo equipo, fecha y módulo")
    void testRestriccionUnicidadPostgres_SolapamientoConfirmado() {
        // Arrange: Crear usuarios y equipo
        Usuario docente1 = entityManager.persist(Usuario.builder()
                .nombre("Prof. Martín Gómez")
                .email("martin@test.edu.ar")
                .rol(RolUsuario.DOCENTE)
                .build());

        Usuario docente2 = entityManager.persist(Usuario.builder()
                .nombre("Prof. Mariana Castro")
                .email("mariana@test.edu.ar")
                .rol(RolUsuario.DOCENTE)
                .build());

        Equipo proyector = entityManager.persist(Equipo.builder()
                .nombre("Proyector 1")
                .tipo(TipoEquipo.PROYECTOR)
                .estado(EstadoEquipo.DISPONIBLE)
                .build());

        LocalDate fecha = LocalDate.now().plusDays(5);
        String modulo = "Módulo 1 (07:30 - 08:50)";

        // Persistir primera reserva CONFIRMADA
        Reserva primeraConfirmada = Reserva.builder()
                .usuario(docente1)
                .equipo(proyector)
                .fecha(fecha)
                .moduloHorario(modulo)
                .estado(EstadoReserva.CONFIRMADA)
                .motivo("Primera reserva")
                .build();
        entityManager.persistAndFlush(primeraConfirmada);

        // Act & Assert: Intentar persistir segunda reserva CONFIRMADA para idéntico equipo, fecha y módulo
        Reserva segundaConfirmada = Reserva.builder()
                .usuario(docente2)
                .equipo(proyector)
                .fecha(fecha)
                .moduloHorario(modulo)
                .estado(EstadoReserva.CONFIRMADA)
                .motivo("Intento solapado")
                .build();

        assertThatThrownBy(() -> {
            entityManager.persistAndFlush(segundaConfirmada);
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Debe permitir múltiples reservas en estado PENDIENTE para el mismo equipo, fecha y módulo (índice parcial PostgreSQL)")
    void testPermitirMultiplesPendientes() {
        Usuario docente1 = entityManager.persist(Usuario.builder()
                .nombre("Prof. A")
                .email("a@test.edu.ar")
                .rol(RolUsuario.DOCENTE)
                .build());

        Usuario docente2 = entityManager.persist(Usuario.builder()
                .nombre("Prof. B")
                .email("b@test.edu.ar")
                .rol(RolUsuario.DOCENTE)
                .build());

        Equipo equipo = entityManager.persist(Equipo.builder()
                .nombre("Notebook 1")
                .tipo(TipoEquipo.NOTEBOOK)
                .estado(EstadoEquipo.DISPONIBLE)
                .build());

        LocalDate fecha = LocalDate.now().plusDays(3);
        String modulo = "Módulo 2 (09:00 - 10:20)";

        Reserva p1 = Reserva.builder()
                .usuario(docente1)
                .equipo(equipo)
                .fecha(fecha)
                .moduloHorario(modulo)
                .estado(EstadoReserva.PENDIENTE)
                .build();

        Reserva p2 = Reserva.builder()
                .usuario(docente2)
                .equipo(equipo)
                .fecha(fecha)
                .moduloHorario(modulo)
                .estado(EstadoReserva.PENDIENTE)
                .build();

        entityManager.persistAndFlush(p1);
        entityManager.persistAndFlush(p2);

        assertThat(p1.getId()).isNotNull();
        assertThat(p2.getId()).isNotNull();
    }
}
