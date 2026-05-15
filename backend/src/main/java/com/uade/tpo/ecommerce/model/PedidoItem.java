package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ==========================================================
 *                  Clase: PedidoItem
 * ==========================================================
 * Descripción:
 * Representa un ítem dentro de un pedido, asociando
 * un producto con su cantidad y precio al momento
 * de la compra.
 *
 * @param id               → Identificador único del ítem.
 * @param producto         → Producto asociado (ManyToOne).
 * @param cantidad         → Cantidad comprada del producto.
 * @param precioUnitario   → Precio del producto al realizar
 *                           el checkout.
 *
 * Relaciones:
 * producto → ManyToOne (FK: producto_id)
 *
 * ==========================================================
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pedido_items")
public class PedidoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private int cantidad;

    @Column(nullable = false)
    private Double precioUnitario; // Guarda precio al momento del checkout
}