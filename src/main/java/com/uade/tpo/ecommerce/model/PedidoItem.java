package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class PedidoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Producto producto;

    private int cantidad;
}