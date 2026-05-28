package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

/**
 * ==========================================================
 *                    Clase: Producto
 * ==========================================================
 * Descripción:
 * Representa un producto disponible en el sistema,
 * incluyendo información básica, stock, imágenes
 * y categorías asociadas.
 *
 * @param id           → Identificador único del producto.
 * @param nombre       → Nombre del producto.
 * @param precio       → Precio actual del producto.
 * @param descripcion  → Descripción detallada.
 * @param stock        → Cantidad disponible en inventario.
 * @param imagenes     → Lista de imágenes del producto.
 * @param categorias   → Categorías asociadas (ManyToMany).
 * @param usuario      → Usuario creador (ManyToOne).
 *
 * Relaciones:
 * categorias → ManyToMany (tabla: productos_categorias)
 * usuario    → ManyToOne (FK: usuario_id)
 * imagenes   → ElementCollection (tabla: producto_imagenes)
 *
 * ==========================================================
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre del producto
    @Column(nullable = false, length = 100)
    private String nombre;

    // Precio
    @Column(nullable = false)
    private double precio;

    // Descripción
    @Column(length = 500)
    private String descripcion;

    // Stock disponible
    @Column(nullable = false)
    private int stock;

    // Imágenes del producto
    @ElementCollection
    @CollectionTable(
            name = "producto_imagenes",
            joinColumns = @JoinColumn(name = "producto_id")
    )
    @Column(name = "imagen")
    private List<String> imagenes = new ArrayList<>();

    // Categorías del producto (ManyToMany)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "productos_categorias",
            joinColumns = @JoinColumn(name = "producto_id"),
            inverseJoinColumns = @JoinColumn(name = "categoria_id")
    )
    private List<Categoria> categorias = new ArrayList<>();

    // Usuario creador del producto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Usuario usuario;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private java.time.LocalDateTime fechaCreacion;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "fecha_modificacion")
    private java.time.LocalDateTime fechaModificacion;

    // Campos virtuales recibidos desde el Frontend (no se guardan en la tabla directamente)
    @Transient
    private List<Long> categoriaIds;

    @Transient
    private String imagen;
}