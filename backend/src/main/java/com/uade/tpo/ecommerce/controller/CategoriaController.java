package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.dto.CategoriaDTO;
import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.model.Categoria;
import com.uade.tpo.ecommerce.service.CategoriaService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * ==========================================================
 *              Clase: CategoriaController
 * ==========================================================
 * Descripción:
 * Controlador encargado de gestionar las operaciones
 * CRUD y consultas sobre categorías de productos.
 *
 * @param categoriaService → Servicio que maneja la
 *                            lógica de categorías.
 *
 * Endpoints:
 * GET    /api/categorias              → Obtener todas.
 * GET    /api/categorias/{id}         → Obtener por ID.
 * POST   /api/categorias              → Crear categoría.
 * PUT    /api/categorias/{id}         → Actualizar categoría.
 * DELETE /api/categorias/{id}         → Eliminar categoría.
 * GET    /api/categorias/buscar       → Buscar por nombre.
 *
 * Configuración:
 * - Utiliza validaciones con @Valid.
 * - Permite gestión completa de categorías.
 *
 * @version 1.0
 * ==========================================================
 */

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    // GET todas las categorias
    // http://localhost:8080/api/categorias
    @GetMapping
    public List<CategoriaDTO> getAllCategorias() {
        return categoriaService.getAllCategorias();
    }

    // GET categoria por ID
    // http://localhost:8080/api/categorias/1
    @GetMapping("/{id}")
    public CategoriaDTO getCategoriaById(@PathVariable Long id) {
        return categoriaService.getCategoriaById(id);
    }

    // DELETE categoria
    // http://localhost:8080/api/categorias/1
    @DeleteMapping("/{id}")
    public DeleteResponse deleteCategoriaById(@PathVariable Long id) {
        return categoriaService.deleteCategoriaById(id);
    }

    // POST crear categoria
    // http://localhost:8080/api/categorias
    @PostMapping
    public CategoriaDTO saveCategoria(@Valid @RequestBody Categoria categoria) {
        return categoriaService.saveCategoria(categoria);
    }

    // PUT actualizar categoria
    // http://localhost:8080/api/categorias/1
    @PutMapping("/{id}")
    public CategoriaDTO updateCategoria(@PathVariable Long id, @Valid @RequestBody Categoria categoria) {
        return categoriaService.updateCategoria(id, categoria);
    }

    // buscar por nombre
    // http://localhost:8080/api/categorias/buscar?nombre=electronica
    @GetMapping("/buscar")
    public CategoriaDTO buscarPorNombre(@RequestParam String nombre) {
        return categoriaService.buscarPorNombre(nombre);
    }

}