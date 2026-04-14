package com.uade.tpo.ecommerce.service;

import com.uade.tpo.ecommerce.model.Carrito;

public interface CarritoService {

    Carrito obtenerCarrito();

    Carrito agregarProducto(Long productoId);

    Carrito eliminarProducto(Long productoId);
}