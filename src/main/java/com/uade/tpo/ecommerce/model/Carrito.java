package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "carritos")
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)    
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // inicializar SIEMPRE
    @OneToMany(
            mappedBy = "carrito",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<CarritoItem> items = new ArrayList<>();
}