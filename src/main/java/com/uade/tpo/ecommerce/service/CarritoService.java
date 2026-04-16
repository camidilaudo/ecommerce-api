package com.uade.tpo.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.model.*;
import com.uade.tpo.ecommerce.repository.*;
import com.uade.tpo.ecommerce.exception.BadRequestException;

import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    private Long usuarioId = 1L;

    public Carrito obtenerCarrito() {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito();
                    nuevo.setUsuario(usuario);

                    usuario.setCarrito(nuevo);

                    carritoRepository.save(nuevo);     // 🔥 guardar carrito
                    usuarioRepository.save(usuario);   // 🔥 guardar usuario

                    return nuevo;
                });
    }

    public Carrito agregarProducto(Long productoId) {

        Carrito carrito = obtenerCarrito();

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Validar si hay stock antes de agregar
        if (producto.getStock() <= 0) {
            throw new BadRequestException("No hay stock disponible para el producto: " + producto.getNombre());
        }

        for (CarritoItem item : carrito.getItems()) {
            if (item.getProducto().getId().equals(productoId)) {
                // Validar si la cantidad nueva excede el stock
                if (item.getCantidad() + 1 > producto.getStock()) {
                    throw new BadRequestException("No hay suficiente stock disponible");
                }
                item.setCantidad(item.getCantidad() + 1);
                return carritoRepository.save(carrito);
            }
        }

        CarritoItem item = new CarritoItem();
        item.setProducto(producto);
        item.setCantidad(1);
        item.setCarrito(carrito);

        carrito.getItems().add(item);

        return carritoRepository.save(carrito);
    }

    public Carrito eliminarProducto(Long productoId) {

        Carrito carrito = obtenerCarrito();

        carrito.getItems().removeIf(
                item -> item.getProducto().getId().equals(productoId)
        );

        return carritoRepository.save(carrito);
    }

    public Carrito vaciarCarrito() {

        Carrito carrito = obtenerCarrito();
        carrito.getItems().clear();

        return carritoRepository.save(carrito);
    }

    public String checkout() {

        Carrito carrito = obtenerCarrito();

        if (carrito.getItems().isEmpty()) {
            throw new BadRequestException("El carrito está vacío");
        }

        double totalCost = 0;

        // Validar stock de todos los productos antes de procesar
        for (CarritoItem item : carrito.getItems()) {
            Producto producto = item.getProducto();
            if (producto.getStock() < item.getCantidad()) {
                throw new BadRequestException("Stock insuficiente para: " + producto.getNombre());
            }
            totalCost += producto.getPrecio() * item.getCantidad();
        }

        // Descontar stock y limpiar carrito
        for (CarritoItem item : carrito.getItems()) {
            Producto producto = item.getProducto();
            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);
        }

        carrito.getItems().clear();
        carritoRepository.save(carrito);

        return String.format("Compra realizada con éxito. Total a pagar: $%.2f", totalCost);
    }
}