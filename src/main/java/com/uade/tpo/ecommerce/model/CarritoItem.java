package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;

/**
 * ==========================================================
 *                   Clase: CarritoItem
 * ==========================================================
 * Descripción:
 * Representa un ítem dentro del carrito de compras,
 * asociando un producto con una cantidad específica.
 *
 * @param id         → Identificador único del ítem.
 * @param producto   → Producto asociado (ManyToOne).
 * @param cantidad   → Cantidad del producto seleccionada.
 * @param carrito    → Carrito al que pertenece (ManyToOne).
 *
 * Relaciones:
 * producto → ManyToOne (FK: producto_id)
 * carrito  → ManyToOne (FK: carrito_id)
 *
 * ==========================================================
 */

@Data
@Entity
@Table(name = "carrito_items")
public class CarritoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Column(nullable = false)
    private int cantidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrito_id")
    @JsonBackReference
    private Carrito carrito;
}