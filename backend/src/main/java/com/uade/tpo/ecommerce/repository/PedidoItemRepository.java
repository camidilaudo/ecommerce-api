package com.uade.tpo.ecommerce.repository;

import com.uade.tpo.ecommerce.model.PedidoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Repositorio para manejar operaciones CRUD y personalizadas de la entidad PedidoItem.
 */
@Repository
public interface PedidoItemRepository extends JpaRepository<PedidoItem, Long> {

    @Modifying
    @Query("UPDATE PedidoItem pi SET pi.producto = null WHERE pi.producto.id = :productoId")
    void setProductoNullInPedidoItems(Long productoId);
}
