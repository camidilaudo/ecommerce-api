package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity(name = "carrito_items")
public class CarritoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Producto producto;

    private int cantidad;
}
