package com.uade.tpo.ecommerce.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.exception.ResourceNotFoundException;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.repository.UsuarioRepository;
import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.UsuarioDTO;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Lista blanca de avatares predefinidos permitidos
    private static final java.util.Set<String> AVATARES_PERMITIDOS = java.util.Set.of(
        "avatar1.webp", "avatar2.webp", "avatar3.webp",
        "avatar4.webp", "avatar5.webp", "avatar6.webp"
    );

    private UsuarioDTO toDto(Usuario usuario) {
        if (usuario == null) return null;
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombreUsuario())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .role(usuario.getRole())
                .fechaNacimiento(usuario.getFechaNacimiento())
                .sexo(usuario.getSexo())
                .avatar(usuario.getAvatar())
                .activo(usuario.isActivo())
                .fechaCreacion(usuario.getFechaCreacion())
                .build();
    }

    public List<UsuarioDTO> getAllUsuarios() {
        return usuarioRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public UsuarioDTO getUsuarioById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        return toDto(usuario);
    }

    public UsuarioDTO getUsuarioByEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        return toDto(usuario);
    }

    // Helper para obtener la entidad completa cuando otros servicios la necesiten
    public Usuario getUsuarioEntityById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
    }

    public Usuario getUsuarioEntityByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
    }

    public DeleteResponse deleteUsuarioById(Long id) {
        getUsuarioById(id);
        usuarioRepository.deleteById(id);
        return DeleteResponse.builder().mensaje("Usuario eliminado exitosamente.").build();
    }

    public UsuarioDTO saveUsuario(Usuario usuario) {
        Usuario saved = usuarioRepository.save(usuario);
        return toDto(saved);
    }

    public UsuarioDTO updateUsuario(Long id, Usuario usuario) {
        Usuario existing = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        // DT-07 FIX: Validar que el nuevo email no esté registrado por otro usuario
        if (usuario.getEmail() != null
                && !usuario.getEmail().equalsIgnoreCase(existing.getEmail())
                && usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new com.uade.tpo.ecommerce.exception.UserAlreadyExistsException(
                "El email '" + usuario.getEmail() + "' ya está registrado por otro usuario.");
        }

        existing.setNombre(usuario.getNombre());
        existing.setApellido(usuario.getApellido());
        if (usuario.getEmail() != null && !usuario.getEmail().isBlank()) {
            existing.setEmail(usuario.getEmail());
        }
        Usuario saved = usuarioRepository.save(existing);
        return toDto(saved);
    }
    
    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    public boolean existsByNombreUsuario(String nombreUsuario) {
        return usuarioRepository.existsByNombreUsuario(nombreUsuario);
    }

    /**
     * Actualiza el avatar del usuario validando contra la lista blanca.
     * @throws IllegalArgumentException si el avatar no es uno de los predefinidos.
     */
    public UsuarioDTO updateAvatar(Long id, String avatar) {
        if (!AVATARES_PERMITIDOS.contains(avatar)) {
            throw new IllegalArgumentException(
                "Avatar inválido. Solo se permiten: " + AVATARES_PERMITIDOS);
        }
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        usuario.setAvatar(avatar);
        return toDto(usuarioRepository.save(usuario));
    }

    /**
     * Bloquea o desbloquea un usuario (baja lógica).
     * Seguridad: no permite que un admin se bloquee a sí mismo.
     *
     * @param id          ID del usuario a modificar
     * @param activo      true = desbloquear, false = bloquear
     * @param adminEmail  email del administrador que ejecuta la acción
     */
    public UsuarioDTO toggleActivo(Long id, boolean activo, String adminEmail) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        // Prevenir que el admin se bloquee a sí mismo
        if (usuario.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new com.uade.tpo.ecommerce.exception.BadRequestException(
                "No podés bloquear tu propia cuenta de administrador.");
        }

        usuario.setActivo(activo);
        return toDto(usuarioRepository.save(usuario));
    }

    /**
     * Búsqueda filtrada de usuarios por nombre, apellido, email o nombreUsuario.
     * Si el query está vacío, retorna todos los usuarios.
     */
    public List<UsuarioDTO> buscarUsuarios(String query) {
        if (query == null || query.isBlank()) {
            return getAllUsuarios();
        }
        return usuarioRepository.buscarPorQuery(query.trim())
                .stream().map(this::toDto).collect(Collectors.toList());
    }
}
