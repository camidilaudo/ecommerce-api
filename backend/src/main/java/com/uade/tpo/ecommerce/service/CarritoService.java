package com.uade.tpo.ecommerce.service;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.ecommerce.model.*;
import com.uade.tpo.ecommerce.repository.*;
import com.uade.tpo.ecommerce.dto.*;
import com.uade.tpo.ecommerce.exception.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

// BUG-02 FIX: import correcto de Spring @Transactional (era jakarta.transaction.Transactional)
// DT-02 FIX: inyección por constructor con final fields (eliminada mezcla de @Autowired + @RequiredArgsConstructor)
@Service
@RequiredArgsConstructor
@Transactional
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final ProductoService productoService;
    private final UsuarioService usuarioService;
    private final PedidoService pedidoService;

    private Carrito getOrCreateCarritoEntity(Long usuarioId) {
        if (usuarioId == null) {
            throw new UnAuthorizedException("No se encontró un usuario autenticado para acceder al carrito.");
        }
        Usuario usuario = usuarioService.getUsuarioEntityById(usuarioId);
        return carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito();
                    nuevo.setUsuario(usuario);
                    return carritoRepository.save(nuevo);
                });
    }

    private CarritoDTO toDto(Carrito carrito) {
        if (carrito == null)
            return null;
        Usuario usuario = carrito.getUsuario();
        UsuarioDTO usuarioDto = usuario != null ? UsuarioDTO.builder()
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombreUsuario())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .role(usuario.getRole())
                .fechaNacimiento(usuario.getFechaNacimiento())
                .sexo(usuario.getSexo())
                .build() : null;

        List<CarritoItemDTO> items = carrito.getItems() != null ? carrito.getItems().stream().map(item -> {
            Producto p = item.getProducto();
            ProductoDTO pDto = p != null ? productoService.toDto(p) : null;
            return CarritoItemDTO.builder()
                    .id(item.getId())
                    .producto(pDto)
                    .cantidad(item.getCantidad())
                    .build();
        }).collect(Collectors.toList()) : new ArrayList<>();

        return CarritoDTO.builder()
                .id(carrito.getId())
                .usuario(usuarioDto)
                .items(items)
                .build();
    }

    public CarritoDTO obtenerCarrito(Long usuarioId) {
        Carrito carrito = getOrCreateCarritoEntity(usuarioId);
        return toDto(carrito);
    }

    /**
     * BUG-05 FIX: Obtiene la entidad Producto real desde la BD (no construye una detached).
     * BUG-06 FIX: Acepta cantidadSolicitada en lugar de siempre agregar de a 1.
     */
    public CarritoDTO agregarProducto(Long productoId, Long usuarioId, int cantidadSolicitada) {
        Carrito carrito = getOrCreateCarritoEntity(usuarioId);

        // BUG-05 FIX: Obtener la entidad JPA real para evitar entidad detached
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (producto.getStock() <= 0) {
            throw new BadRequestException("No hay stock disponible para el producto: " + producto.getNombre());
        }

        // Verificar si el producto ya está en el carrito
        for (CarritoItem item : carrito.getItems()) {
            if (item.getProducto().getId().equals(productoId)) {
                if (item.getCantidad() + cantidadSolicitada > producto.getStock()) {
                    throw new BadRequestException("No hay suficiente stock disponible. Stock actual: "
                            + producto.getStock() + ", ya en carrito: " + item.getCantidad());
                }
                item.setCantidad(item.getCantidad() + cantidadSolicitada);
                Carrito saved = carritoRepository.save(carrito);
                return toDto(saved);
            }
        }

        // Producto nuevo en el carrito
        if (cantidadSolicitada > producto.getStock()) {
            throw new BadRequestException("No hay suficiente stock disponible. Stock actual: " + producto.getStock());
        }

        CarritoItem newItem = new CarritoItem();
        newItem.setProducto(producto);
        newItem.setCantidad(cantidadSolicitada);
        newItem.setCarrito(carrito);
        carrito.getItems().add(newItem);
        Carrito saved = carritoRepository.save(carrito);
        return toDto(saved);
    }

    public CarritoDTO eliminarProducto(Long productoId, Long usuarioId) {
        Carrito carrito = getOrCreateCarritoEntity(usuarioId);
        carrito.getItems().removeIf(item -> item.getProducto().getId().equals(productoId));
        Carrito saved = carritoRepository.save(carrito);
        return toDto(saved);
    }

    public CarritoDTO vaciarCarrito(Long usuarioId) {
        Carrito carrito = getOrCreateCarritoEntity(usuarioId);
        carrito.getItems().clear();
        Carrito saved = carritoRepository.save(carrito);
        return toDto(saved);
    }

    public CheckoutResponse checkout(Long usuarioId) {
        Carrito carrito = getOrCreateCarritoEntity(usuarioId);

        if (carrito.getItems().isEmpty()) {
            throw new BadRequestException("El carrito está vacío");
        }

        Pedido pedido = Pedido.builder()
                .usuario(carrito.getUsuario())
                .fechaCreacion(java.time.LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        double totalCost = 0;

        for (CarritoItem itemCarrito : carrito.getItems()) {
            Long productoId = itemCarrito.getProducto().getId();

            // BUG-01 FIX: descontarStock ahora usa query atómica → safe for concurrent checkout
            productoService.descontarStock(productoId, itemCarrito.getCantidad());

            // Obtener producto actualizado de base de datos para el precio final
            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

            PedidoItem pedidoItem = PedidoItem.builder()
                    .producto(producto)
                    .cantidad(itemCarrito.getCantidad())
                    .precioUnitario(producto.getPrecio())
                    .build();

            pedido.getItems().add(pedidoItem);
            totalCost += producto.getPrecio() * itemCarrito.getCantidad();
        }

        pedido.setTotal(totalCost);
        PedidoDTO savedPedido = pedidoService.savePedido(pedido);

        carrito.getItems().clear();
        carritoRepository.save(carrito);

        return CheckoutResponse.builder()
                .mensaje(String.format("Compra realizada con éxito. Pedido #%d generado. Total a pagar: $%.2f",
                        savedPedido.getId(), totalCost))
                .build();
    }
}