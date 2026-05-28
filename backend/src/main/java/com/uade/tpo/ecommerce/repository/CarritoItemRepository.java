package com.uade.tpo.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import com.uade.tpo.ecommerce.model.CarritoItem;

public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {
    @Modifying
    @Query("DELETE FROM CarritoItem ci WHERE ci.producto.id = :productoId")
    void deleteByProductoId(Long productoId);
}