package com.uade.tpo.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.uade.tpo.ecommerce.model.Carrito;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {

}