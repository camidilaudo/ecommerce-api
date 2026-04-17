package com.uade.tpo.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.uade.tpo.ecommerce.model.Carrito;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.service.CarritoService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    // Obtener el carrito del usuario autenticado
    @GetMapping
    public ResponseEntity<Carrito> obtenerCarrito(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.obtenerCarrito(usuario.getId()));
    }

    // Agregar producto al carrito del usuario autenticado
    @PostMapping("/agregar/{productoId}")
    public ResponseEntity<Carrito> agregarProducto(@PathVariable Long productoId, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.agregarProducto(productoId, usuario.getId()));
    }

    // Eliminar un producto del carrito
    @DeleteMapping("/eliminar/{productoId}")
    public ResponseEntity<Carrito> eliminarProducto(@PathVariable Long productoId, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.eliminarProducto(productoId, usuario.getId()));
    }

    // limpia el carrito
    @DeleteMapping("/vaciar")
    public ResponseEntity<Carrito> vaciarCarrito(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.vaciarCarrito(usuario.getId()));
    }

    // procede a comprar
    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.checkout(usuario.getId()));
    }
}