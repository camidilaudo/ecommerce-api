package com.uade.tpo.ecommerce.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonIgnore;

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