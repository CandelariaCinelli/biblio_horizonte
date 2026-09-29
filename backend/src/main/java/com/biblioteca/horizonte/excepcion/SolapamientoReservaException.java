package com.biblioteca.horizonte.excepcion;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción lanzada cuando se intenta confirmar o reservar un recurso ya comprometido (RF06, RF07).
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class SolapamientoReservaException extends RuntimeException {
    public SolapamientoReservaException(String mensaje) {
        super(mensaje);
    }
}
