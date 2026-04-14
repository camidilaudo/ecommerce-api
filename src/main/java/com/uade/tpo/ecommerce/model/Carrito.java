package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity(name = "carritos")
public class Carrito {

     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Usuario usuario;

    @OneToMany(cascade = CascadeType.ALL)
    private List<CarritoItem> items = new ArrayList<>();

}
