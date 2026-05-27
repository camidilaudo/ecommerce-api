package com.uade.tpo.ecommerce.service;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.uade.tpo.ecommerce.model.*;
import com.uade.tpo.ecommerce.repository.*;
import com.uade.tpo.ecommerce.dto.*;
import com.uade.tpo.ecommerce.exception.*;

import jakarta.transaction.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CarritoService {

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private ProductoService productoService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PedidoService pedidoService;

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

    public CarritoDTO agregarProducto(Long productoId, Long usuarioId) {
        Carrito carrito = getOrCreateCarritoEntity(usuarioId);
        ProductoDTO productoDTO = productoService.getProductoById(productoId);
        Producto producto = Producto.builder()
                .id(productoDTO.getId())
                .nombre(productoDTO.getNombre())
                .precio(productoDTO.getPrecio())
                .descripcion(productoDTO.getDescripcion())
                .stock(productoDTO.getStock())
                .imagenes(productoDTO.getImagenes())
                .usuario(usuarioService.getUsuarioEntityById(productoDTO.getUsuarioId()))
                .build();

        if (producto.getStock() <= 0) {
            throw new BadRequestException("No hay stock disponible para el producto: " + producto.getNombre());
        }

        for (CarritoItem item : carrito.getItems()) {
            if (item.getProducto().getId().equals(productoId)) {
                if (item.getCantidad() + 1 > producto.getStock()) {
                    throw new BadRequestException("No hay suficiente stock disponible");
                }
                item.setCantidad(item.getCantidad() + 1);
                Carrito saved = carritoRepository.save(carrito);
                return toDto(saved);
            }
        }

        CarritoItem newItem = new CarritoItem();
        newItem.setProducto(producto);
        newItem.setCantidad(1);
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
                .items(new ArrayList<>())
                .build();

        double totalCost = 0;

        for (CarritoItem itemCarrito : carrito.getItems()) {
            ProductoDTO productoDTO = productoService.getProductoById(itemCarrito.getProducto().getId());

            Producto producto = Producto.builder()
                    .id(productoDTO.getId())
                    .nombre(productoDTO.getNombre())
                    .precio(productoDTO.getPrecio())
                    .descripcion(productoDTO.getDescripcion())
                    .stock(productoDTO.getStock())
                    .imagenes(productoDTO.getImagenes())
                    .usuario(usuarioService.getUsuarioEntityById(productoDTO.getUsuarioId()))
                    .build();

            if (producto.getStock() < itemCarrito.getCantidad()) {
                throw new BadRequestException("Stock insuficiente para: " + producto.getNombre());
            }

            producto.setStock(producto.getStock() - itemCarrito.getCantidad());
            productoService.saveProducto(producto, carrito.getUsuario());

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