package com.uade.tpo.ecommerce.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.uade.tpo.ecommerce.dto.CarritoDTO;
import com.uade.tpo.ecommerce.dto.CheckoutResponse;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.service.CarritoService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

/**
 * ==========================================================
 *               Clase: CarritoController
 * ==========================================================
 * Descripción:
 * Controlador encargado de gestionar las operaciones
 * del carrito de compras del usuario autenticado.
 *
 * @param carritoService → Servicio que maneja la
 *                          lógica del carrito.
 *
 * Endpoints:
 * GET    /api/carrito                      → Obtener carrito.
 * POST   /api/carrito/agregar/{productoId} → Agregar producto.
 * DELETE /api/carrito/eliminar/{productoId}→ Eliminar producto.
 * DELETE /api/carrito/vaciar               → Vaciar carrito.
 * POST   /api/carrito/checkout             → Finalizar compra.
 *
 * Configuración:
 * - Utiliza usuario autenticado mediante
 *   @AuthenticationPrincipal.
 * - Opera únicamente sobre el carrito del usuario logueado.
 *
 * ==========================================================
 */

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    // Obtener el carrito del usuario autenticado
    @GetMapping
    public ResponseEntity<CarritoDTO> obtenerCarrito(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.obtenerCarrito(usuario.getId()));
    }

    // BUG-06 FIX: acepta ?cantidad=N para agregar múltiples unidades en una sola request atómica
    @PostMapping("/agregar/{productoId}")
    public ResponseEntity<CarritoDTO> agregarProducto(
            @PathVariable Long productoId,
            @RequestParam(defaultValue = "1") int cantidad,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.agregarProducto(productoId, usuario.getId(), cantidad));
    }

    // Eliminar un producto del carrito
    @DeleteMapping("/eliminar/{productoId}")
    public ResponseEntity<CarritoDTO> eliminarProducto(@PathVariable Long productoId, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.eliminarProducto(productoId, usuario.getId()));
    }

    // limpia el carrito
    @DeleteMapping("/vaciar")
    public ResponseEntity<CarritoDTO> vaciarCarrito(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.vaciarCarrito(usuario.getId()));
    }

    // procede a comprar
    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.checkout(usuario.getId()));
    }
}