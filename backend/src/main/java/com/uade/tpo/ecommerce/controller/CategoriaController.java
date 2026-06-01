package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.dto.CategoriaDTO;
import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.model.Categoria;
import com.uade.tpo.ecommerce.service.CategoriaService;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * CategoriaController — CRUD de categorías.
 * BUG-03 FIX: todos los endpoints retornan ResponseEntity con HTTP status explícito.
 * DT-02 FIX: inyección por constructor con @RequiredArgsConstructor.
 */
@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    // GET todas las categorias
    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> getAllCategorias() {
        return ResponseEntity.ok(categoriaService.getAllCategorias());
    }

    // GET categoria por ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaDTO> getCategoriaById(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.getCategoriaById(id));
    }

    // DELETE categoria
    @DeleteMapping("/{id}")
    public ResponseEntity<DeleteResponse> deleteCategoriaById(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.deleteCategoriaById(id));
    }

    // POST crear categoria
    @PostMapping
    public ResponseEntity<CategoriaDTO> saveCategoria(@Valid @RequestBody Categoria categoria) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.saveCategoria(categoria));
    }

    // PUT actualizar categoria
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaDTO> updateCategoria(@PathVariable Long id, @Valid @RequestBody Categoria categoria) {
        return ResponseEntity.ok(categoriaService.updateCategoria(id, categoria));
    }

    // GET buscar por nombre
    @GetMapping("/buscar")
    public ResponseEntity<CategoriaDTO> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(categoriaService.buscarPorNombre(nombre));
    }
}