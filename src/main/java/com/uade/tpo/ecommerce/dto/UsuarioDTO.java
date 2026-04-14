package com.uade.tpo.ecommerce.dto;

import lombok.Data;
import com.uade.tpo.ecommerce.model.Role;
import com.uade.tpo.ecommerce.model.Sexo;
import java.time.LocalDate;

@Data
public class UsuarioDTO {
    private Long id;
    private String nombreUsuario;
    private String nombre;
    private String apellido;
    private String email;
    private Role role;
    private LocalDate fechaNacimiento;
    private Sexo sexo;
}