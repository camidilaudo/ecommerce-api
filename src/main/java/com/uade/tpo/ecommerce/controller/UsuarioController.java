package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.UsuarioDTO;
import com.uade.tpo.ecommerce.dto.UsuarioProfileResponse;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.repository.UsuarioRepository;
import com.uade.tpo.ecommerce.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {
    private final UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Listar todos los usuarios
    @GetMapping
    public List<UsuarioDTO> getAllUsuarios() {
        return usuarioService.getAllUsuarios();
    }

    // Buscar usuario por ID
    @GetMapping("/{id}")
    public UsuarioDTO getUsuarioById(@PathVariable Long id) {
        return usuarioService.getUsuarioById(id);
    }

    // Crear usuario (encripta password)
    @PostMapping
    public UsuarioDTO saveUsuario(@RequestBody Usuario usuario) {

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        return usuarioService.saveUsuario(usuario);
    }

    // Actualizar usuario (también encripta si cambia password)
    @PutMapping("/{id}")
    public UsuarioDTO updateUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {

        if (usuario.getPassword() != null) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        return usuarioService.updateUsuario(id, usuario);
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public DeleteResponse deleteUsuarioById(@PathVariable Long id) {
        return usuarioService.deleteUsuarioById(id);
    }

    /**
     * GET /api/usuarios/me
     * Retorna el perfil del usuario autenticado actual a través del token JWT.
     */
    @GetMapping("/me")
    public ResponseEntity<UsuarioProfileResponse> obtenerMiPerfil(Principal principal) {
        // 'principal.getName()' contiene el identificador único (el email) seteado por el JwtFilter
        String emailAutenticado = principal.getName();

        Usuario usuario = usuarioRepository.findByEmail(emailAutenticado)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no mapeado en el contexto de seguridad"));

        // Construimos la respuesta limpia emparejada con los inputs del Frontend
        UsuarioProfileResponse perfil = UsuarioProfileResponse.builder()
                .nombreUsuario(usuario.getNombreUsuario())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .build();

        return ResponseEntity.ok(perfil);
    }
}