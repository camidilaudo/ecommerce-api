package com.uade.tpo.ecommerce.repository;

import com.uade.tpo.ecommerce.model.Pedido;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
}