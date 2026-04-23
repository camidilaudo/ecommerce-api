package com.uade.tpo.ecommerce.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * ==========================================================
 *                   Clase: Categoria
 * ==========================================================
 * Descripción:
 * Representa una categoría utilizada para clasificar
 * productos dentro del sistema.
 *
 * @param id         → Identificador único de la categoría.
 * @param nombre     → Nombre único de la categoría.
 * @param productos  → Lista de productos asociados (ManyToMany).
 *
 * Relaciones:
 * productos → ManyToMany con Producto
 *             (mappedBy: categorias)
 *
 * ==========================================================
 */

@Data
@Entity
@Table(name = "categorias")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre de la categoría
    @Column(nullable = false, unique = true)
    private String nombre;

    // Relación inversa con productos
    // JsonIgnore evita bucle infinito en JSON
    @ManyToMany(mappedBy = "categorias")
    @JsonIgnore
    private List<Producto> productos = new ArrayList<>();

}