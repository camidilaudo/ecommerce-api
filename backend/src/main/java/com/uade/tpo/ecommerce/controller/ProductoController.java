package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.model.Producto;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.service.ProductoService;
import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.ProductoDTO;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // GET todos los productos (con soporte de paginación retrocompatible)
    // http://localhost:8080/api/productos
    @GetMapping
    public ResponseEntity<?> getAllProductos(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String direction) {
        if (page != null && size != null) {
            return ResponseEntity.ok(productoService.getAllProductosPaginated(page, size, sortBy, direction));
        }
        return ResponseEntity.ok(productoService.getAllProductos());
    }

    // GET producto por ID
    // http://localhost:8080/api/productos/1
    @GetMapping("/{id}")
    public ProductoDTO getProductoById(@PathVariable Long id) {
        return productoService.getProductoById(id);
    }

    // DELETE producto
    // http://localhost:8080/api/productos/1
    @DeleteMapping("/{id}")
    public DeleteResponse deleteProductoById(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return productoService.deleteProductoById(id, usuario.getId());
    }

    // POST crear producto
    // http://localhost:8080/api/productos
    @PostMapping
    public ProductoDTO saveProducto(@Valid @RequestBody Producto producto, @AuthenticationPrincipal Usuario usuario) {
        System.out.println("DEBUG POST /api/productos: received producto=" + producto + ", user=" + (usuario != null ? usuario.getEmail() : "null"));
        try {
            ProductoDTO result = productoService.saveProducto(producto, usuario);
            System.out.println("DEBUG POST /api/productos SUCCESS: returned=" + result);
            return result;
        } catch (Exception ex) {
            System.err.println("ERROR inside saveProducto: " + ex.getMessage());
            ex.printStackTrace();
            throw ex;
        }
    }

    // PUT actualizar producto
    // http://localhost:8080/api/productos/1
    @PutMapping("/{id}")
    public ProductoDTO udpateProducto(@PathVariable Long id, @Valid @RequestBody Producto producto, @AuthenticationPrincipal Usuario usuario) {
        return productoService.updateProducto(id, producto, usuario.getId());
    }

    // http://localhost:8080/api/productos/categoria/1
    @GetMapping("/categoria/{id}")
    public List<ProductoDTO> getByCategoria(@PathVariable Long id) {
        return productoService.getByCategoria(id);
    }

    // http://localhost:8080/api/productos/buscar?nombre=iphone
    @GetMapping("/buscar")
    public List<ProductoDTO> buscarPorNombre(@RequestParam String nombre) {
        return productoService.buscarPorNombre(nombre);
    }

    // PUT actualizar stock de producto
    // http://localhost:8080/api/productos/1/stock?stock=10
    @PutMapping("/{id}/stock")
    public ProductoDTO udpateStockProducto(@PathVariable Long id, @RequestParam Integer stock, @AuthenticationPrincipal Usuario usuario) {
        return productoService.updateStockProducto(id, stock, usuario.getId());
    }

}