package com.uade.tpo.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uade.tpo.ecommerce.model.CarritoItem;

public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {

}