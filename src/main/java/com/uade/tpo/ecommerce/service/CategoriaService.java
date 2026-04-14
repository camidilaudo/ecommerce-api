package com.uade.tpo.ecommerce.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.model.Categoria;
import com.uade.tpo.ecommerce.repository.CategoriaRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    // GET todas las categorias
    public List<Categoria> getAllCategorias() {

        return categoriaRepository.findAll();

    }

    // GET categoria por ID
    public Categoria getCategoriaById(Long id) {

        return categoriaRepository
                .findById(id)
                .orElse(null);

    }

    // DELETE categoria
    public void deleteCategoriaById(Long id) {

        categoriaRepository.deleteById(id);

    }

    // CREATE categoria (evita duplicados)
    public Categoria saveCategoria(
            Categoria categoria) {

        Optional<Categoria> existente =
                categoriaRepository
                        .findByNombre(categoria.getNombre());

        // Evita duplicados
        if (existente.isPresent()) {

            throw new RuntimeException(
                    "La categoria ya existe");

        }

        return categoriaRepository
                .save(categoria);

    }

    // UPDATE categoria
    public Categoria updateCategoria(
            Long id,
            Categoria categoria) {

        Categoria existingCategoria =
                getCategoriaById(id);

        if (existingCategoria != null) {

            existingCategoria
                    .setNombre(categoria.getNombre());

            return categoriaRepository
                    .save(existingCategoria);
        }

        return null;
    }

    // 🧩 NUEVO — buscar por nombre
    public Categoria buscarPorNombre(
            String nombre) {

        return categoriaRepository
                .findByNombre(nombre)
                .orElse(null);

    }

}