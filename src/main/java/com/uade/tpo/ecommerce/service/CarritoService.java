package com.uade.tpo.ecommerce.service;

import org.springframework.stereotype.Service;
import com.uade.tpo.ecommerce.model.Carrito;

@Service
public class CarritoService {

    public Carrito obtenerCarrito() {
        return new Carrito();
    }

    public Carrito agregarProducto(Long productoId) {
        return new Carrito(); // lógica básica
    }

    public Carrito eliminarProducto(Long productoId) {
        return new Carrito(); // lógica básica
    }
}