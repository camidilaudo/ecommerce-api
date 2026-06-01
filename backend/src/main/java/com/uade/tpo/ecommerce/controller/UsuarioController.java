package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.UsuarioDTO;
import com.uade.tpo.ecommerce.dto.UsuarioProfileResponse;
import com.uade.tpo.ecommerce.exception.UnAuthorizedException;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.model.enums.Role;
import com.uade.tpo.ecommerce.repository.UsuarioRepository;
import com.uade.tpo.ecommerce.service.UsuarioService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * UsuarioController — Gestión de usuarios.
 *
 * BUG-03 FIX: todos los endpoints retornan ResponseEntity.
 * DT-08 FIX: PUT /{id} valida que el usuario solo modifique su propio perfil.
 * DT-02 FIX: inyección por constructor con @RequiredArgsConstructor.
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;

    // GET todos los usuarios (solo ADMIN — protegido por SecurityConfig)
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> getAllUsuarios() {
        return ResponseEntity.ok(usuarioService.getAllUsuarios());
    }

    // GET usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> getUsuarioById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.getUsuarioById(id));
    }

    // POST crear usuario (solo ADMIN — protegido por SecurityConfig)
    @PostMapping
    public ResponseEntity<UsuarioDTO> saveUsuario(@RequestBody Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return ResponseEntity.ok(usuarioService.saveUsuario(usuario));
    }

    // PUT actualizar usuario — DT-08: solo el propio usuario o ADMIN puede actualizar
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> updateUsuario(
            @PathVariable Long id,
            @RequestBody Usuario usuario,
            @AuthenticationPrincipal Usuario usuarioAutenticado) {

        // DT-08 FIX: validar ownership — solo el propio usuario o un ADMIN puede modificar el perfil
        if (usuarioAutenticado.getRole() != Role.ADMIN
                && !usuarioAutenticado.getId().equals(id)) {
            throw new UnAuthorizedException("Solo podés modificar tu propio perfil.");
        }

        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        return ResponseEntity.ok(usuarioService.updateUsuario(id, usuario));
    }

    // DELETE usuario (solo ADMIN — protegido por SecurityConfig)
    @DeleteMapping("/{id}")
    public ResponseEntity<DeleteResponse> deleteUsuarioById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.deleteUsuarioById(id));
    }

    /**
     * GET /api/usuarios/me
     * Retorna el perfil del usuario autenticado actual a través del token JWT.
     */
    @GetMapping("/me")
    public ResponseEntity<UsuarioProfileResponse> obtenerMiPerfil(
            @AuthenticationPrincipal Usuario usuario) {

        UsuarioProfileResponse perfil = UsuarioProfileResponse.builder()
                .nombreUsuario(usuario.getNombreUsuario())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .build();

        return ResponseEntity.ok(perfil);
    }
}