package com.uade.tpo.ecommerce.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.ecommerce.model.Categoria;
import com.uade.tpo.ecommerce.service.CategoriaService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    // GET todas las categorias
    // http://localhost:8080/api/categorias
    @GetMapping
    public List<Categoria> getAllCategorias() {

        return categoriaService.getAllCategorias();

    }

    // GET categoria por ID
    // http://localhost:8080/api/categorias/1
    @GetMapping("/{id}")
    public Categoria getCategoriaById(
            @PathVariable Long id) {

        return categoriaService.getCategoriaById(id);

    }

    // DELETE categoria
    // http://localhost:8080/api/categorias/1
    @DeleteMapping("/{id}")
    public void deleteCategoriaById(
            @PathVariable Long id) {

        categoriaService.deleteCategoriaById(id);

    }

    // POST crear categoria
    // http://localhost:8080/api/categorias
    @PostMapping
    public Categoria saveCategoria(
            @Valid @RequestBody Categoria categoria) {

        return categoriaService.saveCategoria(categoria);

    }

    // PUT actualizar categoria
    // http://localhost:8080/api/categorias/1
    @PutMapping("/{id}")
    public Categoria updateCategoria(
            @PathVariable Long id,
            @Valid @RequestBody Categoria categoria) {

        return categoriaService.updateCategoria(id, categoria);

    }

    // buscar por nombre
    // http://localhost:8080/api/categorias/buscar?nombre=electronica
    @GetMapping("/buscar")
    public Categoria buscarPorNombre(
            @RequestParam String nombre) {

        return categoriaService.buscarPorNombre(nombre);

    }

}