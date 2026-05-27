package com.uade.tpo.ecommerce.config;

import com.uade.tpo.ecommerce.model.enums.Role;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.Customizer;
import java.util.List;

/**
 * ==========================================================
 * Clase: SecurityConfig
 * ==========================================================
 * Descripción:
 * Configura la seguridad del sistema utilizando
 * Spring Security y autenticación basada en JWT.
 *
 * @param jwtFilter         → Filtro encargado de validar
 *                          tokens JWT en cada request.
 * @param usuarioRepository → Repositorio utilizado para
 *                          obtener usuarios desde la BD.
 *
 *                          Componentes principales:
 *                          userDetailsService → Carga usuarios por email.
 *                          authenticationManager → Gestiona la autenticación.
 *                          passwordEncoder → Encripta contraseñas con BCrypt.
 *                          securityFilterChain → Define reglas de acceso y
 *                          seguridad.
 *
 *                          Configuración:
 *                          - Autenticación stateless mediante JWT.
 *                          - CSRF deshabilitado.
 *                          - Acceso público a login y catálogo.
 *                          - Acceso restringido por roles y autenticación.
 *
 *                          ==========================================================
 */

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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // 1. ENDPOINTS PUBLICOS
                        .requestMatchers("/api/auth/**").permitAll() // Login y Registro
                        .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll() // Ver catálogo y detalles
                        .requestMatchers(HttpMethod.GET, "/api/categorias/**", "/api/categorias").permitAll() // Ver categorías públicamente

                        // 2. PRODUCTOS
                        // GET: Públicos
                        // POST: Cualquier usuario puede crear productos
                        // PUT/DELETE: Usuarios autenticados pueden modificar/eliminar sus propios
                        // productos
                        .requestMatchers(HttpMethod.POST, "/api/productos/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/productos/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/productos/**").authenticated()

                        // 3. CATEGORIAS
                        // GET: Publicos (sin autenticación)
                        // POST/DELETE: Solo ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/categorias/**").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.PUT, "/api/categorias/**").hasRole(Role.ADMIN.name())
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
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}