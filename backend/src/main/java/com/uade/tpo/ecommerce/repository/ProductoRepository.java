package com.uade.tpo.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.uade.tpo.ecommerce.model.Producto;

import java.util.List;

import org.springframework.data.jpa.repository.Query;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Buscar productos activos por categoria (ManyToMany)
    List<Producto> findByActivoTrueAndCategoriasId(Long categoriaId);

    // Buscar productos activos por nombre
    List<Producto> findByActivoTrueAndNombreContaining(String nombre);

    // Listado de productos activos ordenados alfabéticamente
    List<Producto> findByActivoTrueOrderByNombreAsc();

    // Paginación de productos activos
    Page<Producto> findByActivoTrue(Pageable pageable);

    // Conteo de productos activos
    long countByActivoTrue();

    @Query("SELECT COALESCE(SUM(p.stock), 0) FROM Producto p WHERE p.activo = true")
    Long sumTotalStockActive();
}