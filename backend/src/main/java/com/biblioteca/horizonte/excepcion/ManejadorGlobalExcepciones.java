package com.biblioteca.horizonte.excepcion;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ManejadorGlobalExcepciones {

    @ExceptionHandler(SolapamientoReservaException.class)
    public ResponseEntity<Map<String, Object>> manejarSolapamiento(SolapamientoReservaException ex) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("marcaTemporal", LocalDateTime.now());
        respuesta.put("codigo", HttpStatus.CONFLICT.value());
        respuesta.put("error", "Conflicto de Solapamiento");
        respuesta.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(respuesta);
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarNoEncontrado(RecursoNoEncontradoException ex) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("marcaTemporal", LocalDateTime.now());
        respuesta.put("codigo", HttpStatus.NOT_FOUND.value());
        respuesta.put("error", "Recurso no encontrado");
        respuesta.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<Map<String, Object>> manejarReglaNegocio(ReglaNegocioException ex) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("marcaTemporal", LocalDateTime.now());
        respuesta.put("codigo", HttpStatus.BAD_REQUEST.value());
        respuesta.put("error", "Infracción de Regla de Negocio");
        respuesta.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> manejarViolacionIntegridad(DataIntegrityViolationException ex) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("marcaTemporal", LocalDateTime.now());
        respuesta.put("codigo", HttpStatus.CONFLICT.value());
        respuesta.put("error", "Violación de Restricción de Base de Datos");
        respuesta.put("mensaje", "La operación fue rechazada por la base de datos debido a una restricción de unicidad (solapamiento de reserva confirmada detectado en PostgreSQL).");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(respuesta);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacionDTO(MethodArgumentNotValidException ex) {
        Map<String, Object> respuesta = new HashMap<>();
        Map<String, String> errores = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.put(error.getField(), error.getDefaultMessage());
        }
        respuesta.put("marcaTemporal", LocalDateTime.now());
        respuesta.put("codigo", HttpStatus.BAD_REQUEST.value());
        respuesta.put("error", "Validación de Datos Fallida");
        respuesta.put("detalles", errores);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarGeneral(Exception ex) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("marcaTemporal", LocalDateTime.now());
        respuesta.put("codigo", HttpStatus.INTERNAL_SERVER_ERROR.value());
        respuesta.put("error", "Error Interno del Servidor");
        respuesta.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
    }
}
