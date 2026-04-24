package com.uade.tpo.ecommerce.service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.exception.BadRequestException;
import com.uade.tpo.ecommerce.exception.ResourceNotFoundException;
import com.uade.tpo.ecommerce.model.Categoria;
import com.uade.tpo.ecommerce.repository.CategoriaRepository;
import com.uade.tpo.ecommerce.dto.CategoriaDTO;
import com.uade.tpo.ecommerce.dto.DeleteResponse;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    private CategoriaDTO toDto(Categoria categoria) {
        if (categoria == null) return null;
        return CategoriaDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .build();
    }

    // GET todas las categorias
    public List<CategoriaDTO> getAllCategorias() {
        return categoriaRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    // GET categoria por ID
    public CategoriaDTO getCategoriaById(Long id) {
        Categoria categoria = categoriaRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("La categoria no existe"));
        return toDto(categoria);
    }

    // DELETE categoria
    public DeleteResponse deleteCategoriaById(Long id) {
        getCategoriaById(id);
        categoriaRepository.deleteById(id);
        return DeleteResponse.builder()
                .mensaje("Categoria eliminada exitosamente")
                .build();
    }

    // CREATE categoria (evita duplicados)
    public CategoriaDTO saveCategoria(Categoria categoria) {
        Optional<Categoria> existente = categoriaRepository.findByNombre(categoria.getNombre());

        // Evita duplicados
        if (existente.isPresent()) {
            throw new BadRequestException("La categoria ya existe");
        }

        Categoria saved = categoriaRepository.save(categoria);
        return toDto(saved);
    }

    // UPDATE categoria
    public CategoriaDTO updateCategoria(Long id, Categoria categoria) {
        Categoria existing = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La categoria no existe"));
        existing.setNombre(categoria.getNombre());
        Categoria saved = categoriaRepository.save(existing);
        return toDto(saved);
    }

    // buscar por nombre
    public CategoriaDTO buscarPorNombre(String nombre) {
        return categoriaRepository.findByNombre(nombre).map(this::toDto).orElse(null);
    }

}