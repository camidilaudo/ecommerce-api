package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.uade.tpo.ecommerce.model.enums.Role;
import com.uade.tpo.ecommerce.model.enums.Sexo;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * ==========================================================
 *                     Clase: Usuario
 * ==========================================================
 * Descripción:
 * Representa un usuario del sistema e-commerce,
 * incluyendo sus datos personales, credenciales
 * y relaciones con pedidos y carrito.
 *
 * @param id                 → Identificador único del usuario.
 * @param nombreUsuario      → Nombre de usuario único.
 * @param nombre             → Nombre personal.
 * @param apellido           → Apellido del usuario.
 * @param email              → Correo electrónico único.
 * @param password           → Contraseña del usuario.
 * @param fechaNacimiento    → Fecha de nacimiento.
 * @param sexo               → Sexo del usuario (Enum).
 * @param role               → Rol del usuario (Enum).
 * @param pedidos            → Lista de pedidos (OneToMany).
 * @param carrito            → Carrito asociado (OneToOne).
 *
 * Relaciones:
 * pedidos → OneToMany con Pedido (mappedBy: usuario)
 * carrito → OneToOne con Carrito (mappedBy: usuario)
 * role    → Enum (EnumType.STRING)
 * sexo    → Enum (EnumType.STRING)
 *
 * ==========================================================
 */

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
    @JsonIgnore
    private String password;

    private LocalDate fechaNacimiento;

    @Enumerated(EnumType.STRING)
    private Sexo sexo;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = true)
    private String avatar;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean activo = true;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private java.time.LocalDateTime fechaCreacion;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "fecha_modificacion")
    private java.time.LocalDateTime fechaModificacion;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Pedido> pedidos;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Carrito carrito;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
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
        return this.activo;
    }
}