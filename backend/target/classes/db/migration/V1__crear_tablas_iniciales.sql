-- ==============================================================================
-- MIGRACIÓN FLYWAY V1: CREACIÓN DE TABLAS Y RESTRICCIONES DE UNICIDAD
-- Proyecto: Biblioteca Horizonte - Gestión de Recursos Escolares
-- ==============================================================================

-- 1. TABLA: usuarios
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    rol VARCHAR(30) NOT NULL,
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('DOCENTE', 'BIBLIOTECARIA'))
);

-- 2. TABLA: equipos
CREATE TABLE equipos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(30) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE',
    descripcion VARCHAR(255),
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_equipo_tipo CHECK (tipo IN ('PROYECTOR', 'NOTEBOOK')),
    CONSTRAINT chk_equipo_estado CHECK (estado IN ('DISPONIBLE', 'EN_MANTENIMIENTO'))
);

-- 3. TABLA: reservas
CREATE TABLE reservas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    equipo_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    modulo_horario VARCHAR(30) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    motivo VARCHAR(255),
    creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT,
    CONSTRAINT fk_reserva_equipo FOREIGN KEY (equipo_id) REFERENCES equipos (id) ON DELETE RESTRICT,
    CONSTRAINT chk_reserva_estado CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'RECHAZADA')),
    CONSTRAINT chk_reserva_modulo CHECK (modulo_horario IN (
        'Módulo 1 (07:30 - 08:50)',
        'Módulo 2 (09:00 - 10:20)',
        'Módulo 3 (10:30 - 11:50)',
        'Módulo 4 (13:30 - 14:50)',
        'Módulo 5 (15:00 - 16:20)',
        'Módulo 6 (16:30 - 17:50)'
    ))
);

-- ==============================================================================
-- REGLA DE NEGOCIO CRÍTICA: CONTROL DE SOLAPAMIENTO (RF06, RF07, RNF02)
-- ==============================================================================
-- Índice Único Parcial en PostgreSQL:
-- Garantiza a nivel de motor de datos que NUNCA pueda existir más de una reserva
-- en estado 'CONFIRMADA' para el mismo equipo, misma fecha y mismo módulo horario.
-- Las reservas 'PENDIENTES' o 'RECHAZADAS' sí pueden coexistir históricamente.
CREATE UNIQUE INDEX uq_reserva_confirmada_equipo_fecha_modulo 
ON reservas (equipo_id, fecha, modulo_horario) 
WHERE estado = 'CONFIRMADA';

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO (RNF03: CONSULTAS DE DISPONIBILIDAD < 1s)
-- ==============================================================================
CREATE INDEX idx_reservas_fecha_modulo ON reservas (fecha, modulo_horario);
CREATE INDEX idx_reservas_usuario_fecha ON reservas (usuario_id, fecha);
CREATE INDEX idx_reservas_estado_cronologico ON reservas (estado, creado_en ASC);
CREATE INDEX idx_equipos_estado_tipo ON equipos (estado, tipo);
