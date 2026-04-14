package com.uade.tpo.ecommerce.service;

import java.util.Set;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.ecommerce.dto.LoginRequest;
import com.uade.tpo.ecommerce.dto.RegisterRequest;
import com.uade.tpo.ecommerce.model.Role;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.repository.UsuarioRepository;
import com.uade.tpo.ecommerce.security.JwtUtil;

import lombok.RequiredArgsConstructor;


import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthenticationService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public String register(RegisterRequest request) {

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            //TODO: ssanchez - crear exception personalizada EmailException y manejar con @ControllerAdvice
            throw new RuntimeException("Email already exists");
        }

        // Crear un nuevo usuario con los datos del request
        // builder ayuda con esto, que es boiler plate código repeptitivo
        // Usuario usuario = new Usuario();
        // usuario.setNombre(request.getNombre());
        // usuario.setApellido(request.getApellido());
        // usuario.setEmail(request.getEmail());
        // usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        // usuario.setRole(Role.USER);


        //viene de Lombok (@Builder) y facilita la creación de objetos de manera más limpia y fluida
        //builder me ahorra tener que usar el new Usuario() y los setters y getters
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                // encriptado la pass que envío el usuario
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // Por defecto, todos los usuarios nuevos son USER
                .build();


        usuarioRepository.save(usuario);
        return "User registered successfully";
    }

        public String login(LoginRequest request) {
        return authenticate(request);
    }

    /**
     * AuthenticationManager:
     * - Se configura en SecurityConfig usando AuthenticationConfiguration
     * - Spring Boot autoconfigura el AuthenticationManager con UserDetailsService y PasswordEncoder
     * - Gestiona el proceso de autenticación completo
     *
     * UsernamePasswordAuthenticationToken:
     * - representa las credenciales del usuario
     * - Se usa para el proceso de autenticación básica username/password
     *
     *  Este token no autenticado se pasa al authenticationManager, que:
     * - Valida las credenciales contra la base de datos
     * - Verifica la contraseña usando el PasswordEncoder
     * - Si todo es correcto, crea un nuevo token autenticado con los roles/authorities del usuario
     *
     *
     */
    public String authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        //ssanchez@gmail.com
                        request.getEmail(),
                        //1234 -> la encripa y verifica que sea igual a la de la db
                        request.getPassword()));

        // generación de token JWT y envío al cliente
        Usuario user = usuarioRepository.findByEmail(request.getEmail()).orElseThrow();
        Set<String> roles = user.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .collect(Collectors.toSet());

        //  envío al cliente del token JWT
        return jwtUtil.generateToken(user.getEmail(), roles);
    }
}