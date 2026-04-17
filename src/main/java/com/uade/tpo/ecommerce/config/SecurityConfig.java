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

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // 1. ENDPOINTS PUBLICOS
                        .requestMatchers("/api/auth/**").permitAll() // Login y Registro
                        .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll() // Ver catálogo y detalles

                        // 2. PRODUCTOS
                        // GET: Públicos
                        // POST: Solo ADMIN puede crear productos
                        // PUT/DELETE: Usuarios autenticados pueden modificar/eliminar sus propios productos
                        .requestMatchers(HttpMethod.POST, "/api/productos/**").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.PUT, "/api/productos/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/productos/**").authenticated()

                        // 3. CATEGORIAS
                        // Cualquier usuario logueado puede ver categorías para filtrar
                        .requestMatchers(HttpMethod.GET, "/api/categorias/**").authenticated()
                        // Solo ADMIN puede crear o borrar categorias
                        .requestMatchers(HttpMethod.POST, "/api/categorias/**").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/categorias/**").hasRole(Role.ADMIN.name())

                        // 4. CARRITO Y PEDIDOS (Requieren Token)
                        // Cualquier usuario "USER" o "ADMIN" puede operar su propio carrito/pedidos
                        .requestMatchers("/api/carrito/**").authenticated()
                        .requestMatchers("/api/pedidos/**").authenticated()

                        // 5. USUARIOS
                        // Admin puede listar a todos o borrar usuarios
                        .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole(Role.ADMIN.name())
                        // Cualquier usuario logueado puede acceder a su GET/PUT individual
                        .requestMatchers("/api/usuarios/**").authenticated()

                        // CUALQUIER OTRO (Catch-all por seguridad)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}