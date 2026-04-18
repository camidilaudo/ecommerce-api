package com.uade.tpo.ecommerce.service;

import java.util.Set;
import java.util.stream.Collectors;
import com.uade.tpo.ecommerce.exception.UserAlreadyExistsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.uade.tpo.ecommerce.dto.LoginRequest;
import com.uade.tpo.ecommerce.dto.LoginResponse;
import com.uade.tpo.ecommerce.dto.RegisterRequest;
import com.uade.tpo.ecommerce.dto.RegisterResponse;
import com.uade.tpo.ecommerce.exception.*;
import com.uade.tpo.ecommerce.model.Role;
import com.uade.tpo.ecommerce.model.Sexo;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.repository.UsuarioRepository;
import com.uade.tpo.ecommerce.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthenticationService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    /**
     * Registra un nuevo usuario en el sistema.
     * Valida que el email y el nombre de usuario no existan previamente.
     */
    public RegisterResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("El correo electrónico " + request.getEmail() + " ya está registrado.");
        }
        if (usuarioRepository.existsByNombreUsuario(request.getNombreUsuario())) {
            throw new UserAlreadyExistsException("El nombre de usuario '" + request.getNombreUsuario() + "' ya no está disponible.");
        }

        Usuario usuario = Usuario.builder()
                .nombreUsuario(request.getNombreUsuario())
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fechaNacimiento(request.getFechaNacimiento())
                .sexo(request.getSexo())
                .role(Role.USER)
                .build();

        usuarioRepository.save(usuario);

        return RegisterResponse.builder()
                .mensaje("Usuario registrado exitosamente")
                .nombreUsuario(usuario.getNombreUsuario())
                .email(usuario.getEmail())
                .build();
    }

    /**
     * Realiza el proceso de login.
     * Si las credenciales son correctas, genera un JWT y devuelve los datos del perfil.
     */
    public LoginResponse login(LoginRequest request) {
        try {
            // 1. Validar credenciales con el AuthenticationManager de Spring Security
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException("Credenciales inválidas. Verifique su email y contraseña.");
        }

        // 3. Obtener el usuario de la base de datos
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // 4. Mapear roles/authorities a un Set de Strings para el token
        Set<String> roles = usuario.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toSet());

        // 5. Generar el Token JWT
        String jwtToken = jwtUtil.generateToken(usuario.getEmail(), roles);

        // 6. Construir el saludo personalizado basado en el Enum Sexo
        String saludo;
        if (usuario.getSexo() == Sexo.MASCULINO) {
            saludo = "¡Bienvenido de nuevo, " + usuario.getNombre() + "!";
        } else if (usuario.getSexo() == Sexo.FEMENINO) {
            saludo = "¡Bienvenida de nuevo, " + usuario.getNombre() + "!";
        } else {
            saludo = "¡Hola de nuevo, " + usuario.getNombre() + "!";
        }

        // 7. Devuelve DTO
        return LoginResponse.builder()
                .token(jwtToken)
                .mensaje(saludo)
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .role(usuario.getRole().name())
                .build();
    }
}