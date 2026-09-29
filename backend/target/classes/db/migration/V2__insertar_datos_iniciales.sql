-- ==============================================================================
-- MIGRACIÓN FLYWAY V2: DATOS INICIALES SEMILLA
-- Proyecto: Biblioteca Horizonte
-- ==============================================================================

-- 1. Usuarios del Sistema (Docentes y Bibliotecaria Lucía)
INSERT INTO usuarios (id, nombre, email, rol) VALUES
(1, 'Lucía Méndez', 'lucia.mendez@horizonte.edu.ar', 'BIBLIOTECARIA'),
(2, 'Prof. Martín Gómez', 'martin.gomez@horizonte.edu.ar', 'DOCENTE'),
(3, 'Prof. Mariana Castro', 'mariana.castro@horizonte.edu.ar', 'DOCENTE'),
(4, 'Prof. Carlos Benítez', 'carlos.benitez@horizonte.edu.ar', 'DOCENTE');

-- Ajustar la secuencia de IDs de usuarios
SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

-- 2. Inventario Inicial de Equipos Tecnológicos
INSERT INTO equipos (id, nombre, tipo, estado, descripcion) VALUES
(1, 'Proyector Epson PowerLite 1', 'PROYECTOR', 'DISPONIBLE', 'Proyector HDMI 3600 lúmenes - Sala Audiovisual'),
(2, 'Proyector Epson PowerLite 2', 'PROYECTOR', 'DISPONIBLE', 'Proyector HDMI 3300 lúmenes - Aula 4'),
(3, 'Proyector BenQ Aula Magna', 'PROYECTOR', 'EN_MANTENIMIENTO', 'En revisión de lámpara y filtro de polvo'),
(4, 'Notebook Dell Latitude 01', 'NOTEBOOK', 'DISPONIBLE', 'Intel Core i5, 16GB RAM, SSD 512GB'),
(5, 'Notebook Dell Latitude 02', 'NOTEBOOK', 'DISPONIBLE', 'Intel Core i5, 16GB RAM, SSD 512GB'),
(6, 'Notebook HP ProBook 03', 'NOTEBOOK', 'DISPONIBLE', 'AMD Ryzen 5, 8GB RAM, SSD 256GB'),
(7, 'Notebook Lenovo ThinkPad 04', 'NOTEBOOK', 'EN_MANTENIMIENTO', 'Cambio de cargador y mantenimiento preventivo');

-- Ajustar la secuencia de IDs de equipos
SELECT setval('equipos_id_seq', (SELECT MAX(id) FROM equipos));

-- 3. Reservas Semilla de Ejemplo (Para visualizar estados PENDIENTE, CONFIRMADA y probar solapamientos)
INSERT INTO reservas (usuario_id, equipo_id, fecha, modulo_horario, estado, motivo, creado_en) VALUES
(2, 1, CURRENT_DATE, 'Módulo 1 (07:30 - 08:50)', 'CONFIRMADA', 'Clase de Historia - Documental Siglo XX', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(3, 1, CURRENT_DATE, 'Módulo 1 (07:30 - 08:50)', 'RECHAZADA', 'Solicitud solapada con Prof. Martín Gómez', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(2, 4, CURRENT_DATE, 'Módulo 2 (09:00 - 10:20)', 'CONFIRMADA', 'Evaluación digital integradora', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(3, 2, CURRENT_DATE, 'Módulo 2 (09:00 - 10:20)', 'PENDIENTE', 'Presentación de Biología Celular', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
(4, 5, CURRENT_DATE + INTERVAL '1 day', 'Módulo 3 (10:30 - 11:50)', 'PENDIENTE', 'Taller de Programación y Robótica', CURRENT_TIMESTAMP - INTERVAL '15 minutes');
