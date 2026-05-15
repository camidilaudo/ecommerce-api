package com.uade.tpo.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para el caso de uso "Mi Perfil".
 * Excluye datos sensibles y el rol por requerimiento de UI.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioProfileResponse {
    private String nombreUsuario;
    private String nombre;
    private String apellido;
    private String email;
}