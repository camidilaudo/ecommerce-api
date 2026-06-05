package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.ToggleEstadoRequest;
import com.uade.tpo.ecommerce.dto.UpdateAvatarRequest;
import com.uade.tpo.ecommerce.dto.UsuarioDTO;
import com.uade.tpo.ecommerce.dto.UsuarioProfileResponse;
import com.uade.tpo.ecommerce.exception.UnAuthorizedException;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.model.enums.Role;
import com.uade.tpo.ecommerce.repository.UsuarioRepository;
import com.uade.tpo.ecommerce.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    /**
     * GET /api/usuarios?search=query
     * Lista todos los usuarios. Si se provee ?search=, filtra por nombre/apellido/email/nombreUsuario.
     * Solo accesible por ADMIN.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioDTO>> getAllUsuarios(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(usuarioService.buscarUsuarios(search));
        }
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
     * PATCH /api/usuarios/{id}/toggle-activo
     * Bloquea o desbloquea un usuario (baja lógica).
     * Solo accesible por ADMIN. Previene que el admin se bloquee a sí mismo.
     */
    @PatchMapping("/{id}/toggle-activo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> toggleActivo(
            @PathVariable Long id,
            @RequestBody ToggleEstadoRequest request,
            @AuthenticationPrincipal Usuario adminAutenticado) {

        UsuarioDTO resultado = usuarioService.toggleActivo(
                id, request.isActivo(), adminAutenticado.getEmail());
        return ResponseEntity.ok(resultado);
    }

    /**
     * GET /api/usuarios/me
     * Retorna el perfil completo del usuario autenticado actual a través del token JWT.
     */
    @GetMapping("/me")
    public ResponseEntity<UsuarioProfileResponse> obtenerMiPerfil(
            @AuthenticationPrincipal Usuario usuario) {

        UsuarioProfileResponse perfil = UsuarioProfileResponse.builder()
                .nombreUsuario(usuario.getNombreUsuario())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .fechaNacimiento(usuario.getFechaNacimiento())
                .sexo(usuario.getSexo())
                .avatar(usuario.getAvatar())
                .build();

        return ResponseEntity.ok(perfil);
    }

    /**
     * PATCH /api/usuarios/me/avatar
     * Actualiza únicamente el avatar del usuario autenticado.
     * Valida que el avatar pertenezca a la lista permitida (avatar1.webp–avatar6.webp).
     */
    @PatchMapping("/me/avatar")
    public ResponseEntity<UsuarioDTO> actualizarAvatar(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody UpdateAvatarRequest request) {

        UsuarioDTO actualizado = usuarioService.updateAvatar(usuario.getId(), request.getAvatar());
        return ResponseEntity.ok(actualizado);
    }
}