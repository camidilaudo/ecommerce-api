package com.uade.tpo.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uade.tpo.ecommerce.model.Categoria;

import java.util.Optional;

@Repository
public interface CategoriaRepository 
        extends JpaRepository<Categoria, Long> {

    // Buscar categoria por nombre
    Optional<Categoria> findByNombre(String nombre);

}