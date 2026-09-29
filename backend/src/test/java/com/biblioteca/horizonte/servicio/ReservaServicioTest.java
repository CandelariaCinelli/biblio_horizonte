package com.biblioteca.horizonte.servicio;

import com.biblioteca.horizonte.dominio.entidades.Equipo;
import com.biblioteca.horizonte.dominio.entidades.Reserva;
import com.biblioteca.horizonte.dominio.entidades.Usuario;
import com.biblioteca.horizonte.dominio.modelo.EstadoEquipo;
import com.biblioteca.horizonte.dominio.modelo.EstadoReserva;
import com.biblioteca.horizonte.dominio.modelo.RolUsuario;
import com.biblioteca.horizonte.dominio.modelo.TipoEquipo;
import com.biblioteca.horizonte.dto.ReservaCreacionDTO;
import com.biblioteca.horizonte.dto.ReservaRespuestaDTO;
import com.biblioteca.horizonte.excepcion.ReglaNegocioException;
import com.biblioteca.horizonte.excepcion.SolapamientoReservaException;
import com.biblioteca.horizonte.repositorio.EquipoRepositorio;
import com.biblioteca.horizonte.repositorio.ReservaRepositorio;
import com.biblioteca.horizonte.repositorio.UsuarioRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - Servicio de Reservas y Reglas Anti-Solapamiento")
class ReservaServicioTest {

    @Mock
    private ReservaRepositorio reservaRepositorio;

    @Mock
    private EquipoRepositorio equipoRepositorio;

    @Mock
    private UsuarioRepositorio usuarioRepositorio;

    @InjectMocks
    private ReservaServicioImpl reservaServicio;

    private Usuario docente;
    private Equipo equipoDisponible;
    private Equipo equipoEnMantenimiento;
    private final LocalDate fechaPrueba = LocalDate.now().plusDays(2);
    private final String moduloPrueba = "Módulo 2 (09:00 - 10:20)";

    @BeforeEach
    void configurarEscenario() {
        docente = Usuario.builder()
                .id(10L)
                .nombre("Prof. Martín Gómez")
                .email("martin.gomez@horizonte.edu.ar")
                .rol(RolUsuario.DOCENTE)
                .build();

        equipoDisponible = Equipo.builder()
                .id(1L)
                .nombre("Proyector Epson PowerLite 1")
                .tipo(TipoEquipo.PROYECTOR)
                .estado(EstadoEquipo.DISPONIBLE)
                .build();

        equipoEnMantenimiento = Equipo.builder()
                .id(2L)
                .nombre("Notebook Lenovo ThinkPad 04")
                .tipo(TipoEquipo.NOTEBOOK)
                .estado(EstadoEquipo.EN_MANTENIMIENTO)
                .build();
    }

    @Test
    @DisplayName("CP01: Debe permitir solicitar reserva en estado PENDIENTE cuando no existe solapamiento previo")
    void testSolicitarReserva_Exitoso() {
        // Arrange
        ReservaCreacionDTO dto = ReservaCreacionDTO.builder()
                .usuarioId(10L)
                .equipoId(1L)
                .fecha(fechaPrueba)
                .moduloHorario(moduloPrueba)
                .motivo("Clase de Ciencias Naturales")
                .build();

        when(usuarioRepositorio.findById(10L)).thenReturn(Optional.of(docente));
        when(equipoRepositorio.findById(1L)).thenReturn(Optional.of(equipoDisponible));
        when(reservaRepositorio.existsByEquipoIdAndFechaAndModuloHorarioAndEstado(
                1L, fechaPrueba, moduloPrueba, EstadoReserva.CONFIRMADA)).thenReturn(false);

        Reserva reservaGuardada = Reserva.builder()
                .id(100L)
                .usuario(docente)
                .equipo(equipoDisponible)
                .fecha(fechaPrueba)
                .moduloHorario(moduloPrueba)
                .estado(EstadoReserva.PENDIENTE)
                .motivo("Clase de Ciencias Naturales")
                .build();

        when(reservaRepositorio.save(any(Reserva.class))).thenReturn(reservaGuardada);

        // Act
        ReservaRespuestaDTO respuesta = reservaServicio.solicitarReserva(dto);

        // Assert
        assertThat(respuesta).isNotNull();
        assertThat(respuesta.getId()).isEqualTo(100L);
        assertThat(respuesta.getEstado()).isEqualTo(EstadoReserva.PENDIENTE);
        assertThat(respuesta.getEquipoNombre()).isEqualTo("Proyector Epson PowerLite 1");
        verify(reservaRepositorio, times(1)).save(any(Reserva.class));
    }

    @Test
    @DisplayName("CP02: Debe rechazar solicitud con SolapamientoReservaException si ya existe reserva CONFIRMADA")
    void testSolicitarReserva_FallaPorSolapamientoConfirmado() {
        // Arrange
        ReservaCreacionDTO dto = ReservaCreacionDTO.builder()
                .usuarioId(10L)
                .equipoId(1L)
                .fecha(fechaPrueba)
                .moduloHorario(moduloPrueba)
                .motivo("Clase de Literatura")
                .build();

        when(usuarioRepositorio.findById(10L)).thenReturn(Optional.of(docente));
        when(equipoRepositorio.findById(1L)).thenReturn(Optional.of(equipoDisponible));
        when(reservaRepositorio.existsByEquipoIdAndFechaAndModuloHorarioAndEstado(
                1L, fechaPrueba, moduloPrueba, EstadoReserva.CONFIRMADA)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> reservaServicio.solicitarReserva(dto))
                .isInstanceOf(SolapamientoReservaException.class)
                .hasMessageContaining("Conflicto de solapamiento");

        verify(reservaRepositorio, never()).save(any(Reserva.class));
    }

    @Test
    @DisplayName("CP03: Debe rechazar solicitud si el equipo está EN_MANTENIMIENTO")
    void testSolicitarReserva_FallaPorEquipoEnMantenimiento() {
        // Arrange
        ReservaCreacionDTO dto = ReservaCreacionDTO.builder()
                .usuarioId(10L)
                .equipoId(2L)
                .fecha(fechaPrueba)
                .moduloHorario(moduloPrueba)
                .build();

        when(usuarioRepositorio.findById(10L)).thenReturn(Optional.of(docente));
        when(equipoRepositorio.findById(2L)).thenReturn(Optional.of(equipoEnMantenimiento));

        // Act & Assert
        assertThatThrownBy(() -> reservaServicio.solicitarReserva(dto))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("mantenimiento");

        verify(reservaRepositorio, never()).save(any(Reserva.class));
    }

    @Test
    @DisplayName("CP04: Al confirmar una reserva, debe cambiar estado a CONFIRMADA y auto-rechazar solicitudes pendientes solapadas")
    void testConfirmarReserva_AutoRechazoDeSolapadas() {
        // Arrange
        Reserva reservaAConfirmar = Reserva.builder()
                .id(200L)
                .usuario(docente)
                .equipo(equipoDisponible)
                .fecha(fechaPrueba)
                .moduloHorario(moduloPrueba)
                .estado(EstadoReserva.PENDIENTE)
                .motivo("Evaluación Trimestral")
                .build();

        Usuario otroDocente = Usuario.builder().id(20L).nombre("Prof. Mariana Castro").build();
        Reserva reservaSolapadaPendiente = Reserva.builder()
                .id(201L)
                .usuario(otroDocente)
                .equipo(equipoDisponible)
                .fecha(fechaPrueba)
                .moduloHorario(moduloPrueba)
                .estado(EstadoReserva.PENDIENTE)
                .motivo("Muestra Audiovisual")
                .build();

        when(reservaRepositorio.findById(200L)).thenReturn(Optional.of(reservaAConfirmar));
        when(reservaRepositorio.existsByEquipoIdAndFechaAndModuloHorarioAndEstado(
                1L, fechaPrueba, moduloPrueba, EstadoReserva.CONFIRMADA)).thenReturn(false);
        when(reservaRepositorio.save(reservaAConfirmar)).thenReturn(reservaAConfirmar);
        when(reservaRepositorio.findByEquipoIdAndFechaAndModuloHorarioAndEstadoAndIdNot(
                1L, fechaPrueba, moduloPrueba, EstadoReserva.PENDIENTE, 200L))
                .thenReturn(List.of(reservaSolapadaPendiente));

        // Act
        ReservaRespuestaDTO resultado = reservaServicio.confirmarReserva(200L, "Aprobado por Lucía");

        // Assert
        assertThat(resultado.getEstado()).isEqualTo(EstadoReserva.CONFIRMADA);
        // Validar que la reserva solapada fue rechazada automáticamente
        assertThat(reservaSolapadaPendiente.getEstado()).isEqualTo(EstadoReserva.RECHAZADA);
        assertThat(reservaSolapadaPendiente.getMotivo()).contains("Rechazo automático");
        verify(reservaRepositorio, times(1)).save(reservaSolapadaPendiente);
    }
}
