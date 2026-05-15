package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.ArrayList;

/**
 * ==========================================================
 *                     Clase: Pedido
 * ==========================================================
 * Descripción:
 * Representa un pedido realizado por un usuario,
 * incluyendo el total y los ítems comprados.
 *
 * @param id        → Identificador único del pedido.
 * @param total     → Monto total del pedido.
 * @param usuario   → Usuario que realizó el pedido (ManyToOne).
 * @param items     → Lista de ítems del pedido (OneToMany).
 *
 * Relaciones:
 * usuario → ManyToOne (FK: usuario_id)
 * items   → OneToMany (FK: pedido_id,
 *                      cascade ALL, orphanRemoval)
 *
 * ==========================================================
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pedidos") // nombre tabla db
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double total;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonBackReference
    private Usuario usuario;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "pedido_id") // Relación unidireccional con items
    @Builder.Default
    private List<PedidoItem> items = new ArrayList<>();
}