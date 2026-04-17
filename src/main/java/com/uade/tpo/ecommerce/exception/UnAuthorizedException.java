package com.uade.tpo.ecommerce.exception;

/**
 * Excepción lanzada cuando el usuario no tiene autorización para realizar una acción
 */
public class UnAuthorizedException extends RuntimeException {
    public UnAuthorizedException(String message) {
        super(message);
    }

    public UnAuthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
