package com.uade.tpo.ecommerce.dto;

import com.uade.tpo.ecommerce.model.Sexo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String nombreUsuario;
    private String nombre;
    private String apellido;
    private String email;
    private String password;
    private LocalDate fechaNacimiento; // Formato esperado en JSON: "YYYY-MM-DD"
    private Sexo sexo;
}