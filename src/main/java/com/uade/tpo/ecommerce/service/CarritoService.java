package com.uade.tpo.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.model.Carrito;
import com.uade.tpo.ecommerce.model.CarritoItem;
import com.uade.tpo.ecommerce.model.Producto;
import com.uade.tpo.ecommerce.repository.CarritoRepository;
import com.uade.tpo.ecommerce.repository.ProductoRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;

    // Obtener carrito (ejemplo simple: id=1)
    public Carrito obtenerCarrito() {

        Optional<Carrito> carrito = carritoRepository.findById(1L);

        return carrito.orElseGet(() -> {
            Carrito nuevo = new Carrito();
            return carritoRepository.save(nuevo);
        });
    }

    // Agregar producto
    public Carrito agregarProducto(Long productoId) {

        Carrito carrito = obtenerCarrito();

        Producto producto = productoRepository
                .findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        CarritoItem item = new CarritoItem();
        item.setProducto(producto);
        item.setCantidad(1);
        item.setCarrito(carrito);

        carrito.getItems().add(item);

        return carritoRepository.save(carrito);
    }

    // Eliminar producto
    public Carrito eliminarProducto(Long productoId) {

        Carrito carrito = obtenerCarrito();

        carrito.getItems().removeIf(
                item -> item.getProducto().getId().equals(productoId)
        );

        return carritoRepository.save(carrito);
    }
}