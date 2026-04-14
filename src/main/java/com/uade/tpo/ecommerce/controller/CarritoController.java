package com.uade.tpo.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.uade.tpo.ecommerce.model.Carrito;
import com.uade.tpo.ecommerce.service.CarritoService;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    public ResponseEntity<Carrito> obtenerCarrito() {
        return ResponseEntity.ok(carritoService.obtenerCarrito());
    }

    @PostMapping("/agregar/{productoId}")
    public ResponseEntity<Carrito> agregarProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(carritoService.agregarProducto(productoId));
    }

    @DeleteMapping("/eliminar/{productoId}")
    public ResponseEntity<Carrito> eliminarProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(carritoService.eliminarProducto(productoId));
    }

    @DeleteMapping("/vaciar")
    public ResponseEntity<Carrito> vaciarCarrito() {
        return ResponseEntity.ok(carritoService.vaciarCarrito());
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout() {
        return ResponseEntity.ok(carritoService.checkout());
    }
}