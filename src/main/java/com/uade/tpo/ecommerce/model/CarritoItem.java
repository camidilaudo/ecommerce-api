package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "carrito_items")
public class CarritoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Producto del item
    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    // Cantidad
    @Column(nullable = false)
    private int cantidad;

    // Relación con carrito
    @ManyToOne
    @JoinColumn(name = "carrito_id")
    private Carrito carrito;

}