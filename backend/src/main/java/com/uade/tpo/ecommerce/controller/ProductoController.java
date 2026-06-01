package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.ProductoDTO;
import com.uade.tpo.ecommerce.dto.ProductoRequest;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.service.ProductoService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * ProductoController — CRUD de productos.
 *
 * BUG-03 FIX: todos los endpoints retornan ResponseEntity con HTTP status explícito.
 * DT-01 FIX: POST y PUT reciben ProductoRequest DTO, no la entidad JPA directa.
 * DT-09 FIX: eliminados todos los System.out.println de debug.
 */
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    // GET todos los productos (con soporte de paginación retrocompatible)
    @GetMapping
    public ResponseEntity<?> getAllProductos(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "nombre") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String direction) {
        if (page != null && size != null) {
            return ResponseEntity.ok(productoService.getAllProductosPaginated(page, size, sortBy, direction));
        }
        return ResponseEntity.ok(productoService.getAllProductos());
    }

    // GET producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> getProductoById(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.getProductoById(id));
    }

    // DELETE producto (soft delete — solo propietario o ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<DeleteResponse> deleteProductoById(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(productoService.deleteProductoById(id, usuario.getId()));
    }

    // POST crear producto — DT-01: recibe ProductoRequest DTO
    @PostMapping
    public ResponseEntity<ProductoDTO> saveProducto(
            @Valid @RequestBody ProductoRequest request,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productoService.saveProducto(request, usuario));
    }

    // PUT actualizar producto — DT-01: recibe ProductoRequest DTO
    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> updateProducto(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequest request,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(productoService.updateProducto(id, request, usuario.getId()));
    }

    // GET productos por categoría
    @GetMapping("/categoria/{id}")
    public ResponseEntity<List<ProductoDTO>> getByCategoria(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.getByCategoria(id));
    }

    // GET buscar productos por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoDTO>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(productoService.buscarPorNombre(nombre));
    }

    // PUT actualizar stock de producto
    @PutMapping("/{id}/stock")
    public ResponseEntity<ProductoDTO> updateStockProducto(
            @PathVariable Long id,
            @RequestParam Integer stock,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(productoService.updateStockProducto(id, stock, usuario.getId()));
    }
}