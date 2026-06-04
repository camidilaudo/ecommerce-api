package com.uade.tpo.ecommerce.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.model.enums.Role;

/**
 * Repositorio para manejar operaciones CRUD de la entidad Usuario.
 * Create add, Read find, Update save, Delete delete.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Si encuentra un usuario con ese email, retorna Optional.of(usuario)
    // Si no encuentra un usuario, retorna Optional.empty()
    Optional<Usuario> findByEmail(String email);

    // Verifica existencia por email y nombreUsuario (validaciones de registro)
    Boolean existsByEmail(String email);
    boolean existsByNombreUsuario(String nombreUsuario);

    /**
     * Búsqueda filtrada por nombre, apellido o email (case-insensitive).
     * Usada en el endpoint GET /api/usuarios?search=...
     */
    @Query("SELECT u FROM Usuario u WHERE " +
           "LOWER(u.nombre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.apellido) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.nombreUsuario) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Usuario> buscarPorQuery(@Param("query") String query);

    // Conteos para estadísticas extendidas del admin dashboard
    long countByActivo(boolean activo);
    long countByRole(Role role);
}
