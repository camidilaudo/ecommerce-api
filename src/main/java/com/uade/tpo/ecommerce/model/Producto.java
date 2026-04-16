package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

@Data
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
}