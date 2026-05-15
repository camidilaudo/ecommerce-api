package com.uade.tpo.ecommerce.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String token;
    private String mensaje;
    private String nombre;
    private String apellido;
    private String email;
    private String role;
}