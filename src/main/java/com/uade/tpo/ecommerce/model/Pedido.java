package com.uade.tpo.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;


@Data
@Entity(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double total;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @OneToMany(cascade = CascadeType.ALL)
    private List<PedidoItem> items = new ArrayList<>();
}