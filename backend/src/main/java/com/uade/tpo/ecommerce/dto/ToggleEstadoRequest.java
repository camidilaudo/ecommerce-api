package com.uade.tpo.ecommerce.dto;

import lombok.*;

/**
 * DTO para el endpoint PATCH /api/usuarios/{id}/toggle-activo.
 * Permite al ADMIN indicar si se desea bloquear (false) o desbloquear (true) al usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ToggleEstadoRequest {
    private boolean activo;
}
