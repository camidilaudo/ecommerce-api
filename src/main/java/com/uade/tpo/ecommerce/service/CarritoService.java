package com.uade.tpo.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.model.*;
import com.uade.tpo.ecommerce.repository.*;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;

    // ⚠️ Simulación usuario (para ahora)
    private Long usuarioId = 1L;

    public Carrito obtenerCarrito() {
        return carritoRepository
                .findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito();
                    Usuario usuario = new Usuario();
                    usuario.setId(usuarioId);
                    nuevo.setUsuario(usuario);
                    return carritoRepository.save(nuevo);
                });
    }

    // ✅ AGREGA o SUMA cantidad
    public Carrito agregarProducto(Long productoId) {

        Carrito carrito = obtenerCarrito();

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Buscar si ya existe
        for (CarritoItem item : carrito.getItems()) {
            if (item.getProducto().getId().equals(productoId)) {
                item.setCantidad(item.getCantidad() + 1);
                return carritoRepository.save(carrito);
            }
        }

        // Si no existe → crear nuevo
        CarritoItem item = new CarritoItem();
        item.setProducto(producto);
        item.setCantidad(1);
        item.setCarrito(carrito);

        carrito.getItems().add(item);

        return carritoRepository.save(carrito);
    }

    // ✅ ELIMINAR producto
    public Carrito eliminarProducto(Long productoId) {

        Carrito carrito = obtenerCarrito();

        carrito.getItems().removeIf(
                item -> item.getProducto().getId().equals(productoId)
        );

        return carritoRepository.save(carrito);
    }

    // ✅ VACIAR carrito
    public Carrito vaciarCarrito() {

        Carrito carrito = obtenerCarrito();
        carrito.getItems().clear();

        return carritoRepository.save(carrito);
    }

    // ✅ CHECKOUT simple
    public String checkout() {

        Carrito carrito = obtenerCarrito();

        if (carrito.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        carrito.getItems().clear();
        carritoRepository.save(carrito);

        return "Compra realizada con éxito";
    }
}