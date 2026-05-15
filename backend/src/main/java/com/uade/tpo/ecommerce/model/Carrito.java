package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.ArrayList;
import java.util.List;

/**
 * ==========================================================
 *                      Clase: Carrito
 * ==========================================================
 * Descripción:
 * Representa el carrito de compras asociado a un usuario.
 *
 * @param id        → Identificador único del carrito.
 * @param usuario   → Usuario asociado (OneToOne).
 * @param items     → Ítems del carrito (OneToMany).
 *
 * Relaciones:
 * usuario → OneToOne (FK: usuario_id)
 * items   → OneToMany (cascade ALL, orphanRemoval)
 *
 * ==========================================================
 */

@Data
@Entity
@Table(name = "carritos")
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    @JsonBackReference
    private Usuario usuario;

    @OneToMany(
            mappedBy = "carrito",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonManagedReference
    private List<CarritoItem> items = new ArrayList<>();
}