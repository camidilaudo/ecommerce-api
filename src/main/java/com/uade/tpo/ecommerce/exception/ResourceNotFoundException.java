package com.uade.tpo.ecommerce.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción personalizada para manejar recursos no encontrados.
 * Al lanzarse, Spring Security y el GlobalExceptionHandler devolverán un código 404 NOT FOUND.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructor para cuando solo quieres enviar un mensaje de texto.
     * @param mensaje Descripción del error.
     */
    public ResourceNotFoundException(String mensaje) {
        super(mensaje);
    }

    /**
     * Constructor mejorado para indicar qué recurso y qué ID falló.
     * Esto ayuda mucho al Frontend para saber qué falló exactamente.
     * * @param recurso Nombre de la entidad (ej.: "Producto", "Usuario").
     * @param id El identificador que no se encontró.
     */
    //TODO : sacar recurso.
    public ResourceNotFoundException(String recurso, Long id) {
        super(String.format("%s con ID %d no fue encontrado/a en el sistema.", recurso, id));
    }
}