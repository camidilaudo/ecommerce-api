package com.uade.tpo.ecommerce.dto;

import lombok.*;
import com.uade.tpo.ecommerce.model.enums.Role;
import com.uade.tpo.ecommerce.model.enums.Sexo;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nombreUsuario;
    private String nombre;
    private String apellido;
    private String email;
    private Role role;
    private LocalDate fechaNacimiento;
    private Sexo sexo;
    private String avatar;
    private boolean activo;
    private LocalDateTime fechaCreacion;
}