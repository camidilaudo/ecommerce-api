package com.uade.tpo.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.uade.tpo.ecommerce.model.*;
import com.uade.tpo.ecommerce.repository.*;
import com.uade.tpo.ecommerce.exception.*;
import jakarta.transaction.Transactional;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional // atomicidad
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;

    // Metodo para obtener o crear el carrito del usuario
    public Carrito obtenerCarrito(Long usuarioId) {
        if (usuarioId == null) {
            throw new UnAuthorizedException("No se encontró un usuario autenticado para acceder al carrito.");
        } //usuario no autenticado

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito();
                    nuevo.setUsuario(usuario);
                    return carritoRepository.save(nuevo);
                });
    }

    // Metodo para agregar productos validando stock
    public Carrito agregarProducto(Long productoId, Long usuarioId) {
        Carrito carrito = obtenerCarrito(usuarioId);
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (producto.getStock() <= 0) {
            throw new BadRequestException("No hay stock disponible para el producto: " + producto.getNombre());
        }

        for (CarritoItem item : carrito.getItems()) {
            if (item.getProducto().getId().equals(productoId)) {
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

    public Carrito eliminarProducto(Long productoId, Long usuarioId) {
        Carrito carrito = obtenerCarrito(usuarioId);
        carrito.getItems().removeIf(item -> item.getProducto().getId().equals(productoId));
        return carritoRepository.save(carrito);
    }

    public Carrito vaciarCarrito(Long usuarioId) {
        Carrito carrito = obtenerCarrito(usuarioId);
        carrito.getItems().clear();
        return carritoRepository.save(carrito);
    }

    /**
     * LÓGICA DE CHECKOUT (Endpoint: POST /api/carrito/checkout)
     * 1. Crea el Pedido asociado al usuario.
     * 2. Descuenta stock de cada producto.
     * 3. Calcula el total.
     * 4. Vacía el carrito.
     */
    public String checkout(Long usuarioId) {
        Carrito carrito = obtenerCarrito(usuarioId);

        if (carrito.getItems().isEmpty()) {
            throw new BadRequestException("El carrito está vacío");
        }

        // creamos y asignamos pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(carrito.getUsuario());
        pedido.setItems(new ArrayList<>());
        double totalCost = 0;

        // Procesamos cada ítem del carrito
        for (CarritoItem itemCarrito : carrito.getItems()) {
            Producto producto = itemCarrito.getProducto();

            // Validación de stock final
            if (producto.getStock() < itemCarrito.getCantidad()) {
                throw new BadRequestException("Stock insuficiente para: " + producto.getNombre());
            }

            // Descontamos el stock
            producto.setStock(producto.getStock() - itemCarrito.getCantidad());
            productoRepository.save(producto);

            // Creamos el detalle del pedido
            PedidoItem pedidoItem = PedidoItem.builder()
                    .producto(producto)
                    .cantidad(itemCarrito.getCantidad())
                    .precioUnitario(producto.getPrecio()) // Capturamos el precio actual
                    .build();

            pedido.getItems().add(pedidoItem);
            totalCost += producto.getPrecio() * itemCarrito.getCantidad();
        }

        pedido.setTotal(totalCost);

        // Guardamos el pedido en la base de datos
        pedidoRepository.save(pedido);

        // Limpiamos el carrito
        carrito.getItems().clear();
        carritoRepository.save(carrito);

        return String.format("Compra realizada con éxito. Pedido #%d generado. Total a pagar: $%.2f", pedido.getId(), totalCost);
    }
}