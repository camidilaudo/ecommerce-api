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

    @GetMapping
    public ResponseEntity<Carrito> obtenerCarrito(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.obtenerCarrito(usuario.getId()));
    }

    @PostMapping("/agregar/{productoId}")
    public ResponseEntity<Carrito> agregarProducto(@PathVariable Long productoId, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.agregarProducto(productoId, usuario.getId()));
    }

    @DeleteMapping("/eliminar/{productoId}")
    public ResponseEntity<Carrito> eliminarProducto(@PathVariable Long productoId, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.eliminarProducto(productoId, usuario.getId()));
    }

    @DeleteMapping("/vaciar")
    public ResponseEntity<Carrito> vaciarCarrito(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.vaciarCarrito(usuario.getId()));
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.checkout(usuario.getId()));
    }
}