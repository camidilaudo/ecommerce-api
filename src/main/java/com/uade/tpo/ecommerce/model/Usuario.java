package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nombreUsuario;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // Fecha de nacimiento usando el tipo de dato de Java 8+
    private LocalDate fechaNacimiento;

    // Sexo usando enumeración
    @Enumerated(EnumType.STRING)
    private Sexo sexo;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Pedido> pedidos;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL)
    private Carrito carrito;

    /**
     * getAuthorities() devuelve la colección de roles/permisos del usuario
     * - Cada autoridad debe implementar GrantedAuthority
     * - En este caso, convertimos el enum Role a un formato "ROLE_X" (ej: ROLE_ADMIN, ROLE_USER)
     * - Spring Security utiliza estas autoridades para control de acceso y seguridad
     * - Si el rol es null, asigna por defecto "ROLE_USER"
     * ? extended GrantedAuthority cualquier clase que extienda de GrantedAuthority
     */
    // Métodos obligatorios de UserDetails para Spring Security
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { 
        return true; 
    }

    @Override
    public boolean isAccountNonLocked() { 
        return true; 
    }

    @Override
    public boolean isCredentialsNonExpired() { 
        return true; 
    }

    @Override
    public boolean isEnabled() { 
        return true; 
    }
}