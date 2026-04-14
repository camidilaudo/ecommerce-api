package com.uade.tpo.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.uade.tpo.ecommerce.model.Carrito;
import com.uade.tpo.ecommerce.service.CarritoService;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    public Carrito obtenerCarrito() {
        return carritoService.obtenerCarrito();
    }

    @PostMapping("/agregar/{productoId}")
    public Carrito agregarProducto(@PathVariable Long productoId) {
        return carritoService.agregarProducto(productoId);
    }

    @DeleteMapping("/eliminar/{productoId}")
    public Carrito eliminarProducto(@PathVariable Long productoId) {
        return carritoService.eliminarProducto(productoId);
    }
}