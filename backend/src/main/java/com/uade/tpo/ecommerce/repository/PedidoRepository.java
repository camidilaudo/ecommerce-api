package com.uade.tpo.ecommerce.repository;

import com.uade.tpo.ecommerce.model.Pedido;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.Query;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioId(Long usuarioId);

    @Query("SELECT COALESCE(SUM(p.total), 0.0) FROM Pedido p")
    Double sumTotalSales();
}