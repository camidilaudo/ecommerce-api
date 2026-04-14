package com.uade.tpo.ecommerce.config;

import com.uade.tpo.ecommerce.model.Role;
import com.uade.tpo.ecommerce.repository.UsuarioRepository;
import com.uade.tpo.ecommerce.security.JwtFilter;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UsuarioRepository usuarioRepository;

    /**
     * Carga el usuario desde la base de datos usando el email
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    /**
     * Maneja el proceso de autenticación
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Encriptador de contraseñas
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configuración principal de seguridad
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // Deshabilitamos CSRF porque usamos JWT
            .csrf(csrf -> csrf.disable())

            // IMPORTANTE: No usamos sesiones (stateless)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Configuración de permisos
            .authorizeHttpRequests(auth -> auth

                //  AUTH (público)
                .requestMatchers("/api/auth/**").permitAll()

                // PRODUCTOS públicos (ver productos)
                .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll()

                //  PRODUCTOS (solo ADMIN puede modificar)
                .requestMatchers(HttpMethod.POST, "/api/productos").hasRole(Role.ADMIN.name())
                .requestMatchers(HttpMethod.PUT, "/api/productos/**").hasRole(Role.ADMIN.name())
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasRole(Role.ADMIN.name())

                //  ADMIN
                .requestMatchers("/api/admin/**").hasRole(Role.ADMIN.name())

                // PEDIDOS
                .requestMatchers("/api/pedidos/**").authenticated()

                //  CART (solo usuario logueado)
                .requestMatchers("/api/carrito/**").authenticated()
                //  TODO lo demás requiere login
                .anyRequest().authenticated()
            )

            //  Filtro JWT antes del filtro de autenticación
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}