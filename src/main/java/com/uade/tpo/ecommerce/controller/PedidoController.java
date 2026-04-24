package com.uade.tpo.ecommerce.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.ecommerce.model.Pedido;
import com.uade.tpo.ecommerce.service.PedidoService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

// La api para pedidos con los endpoints para editar, eliminar y listar pedidos
// http://localhost:8080/api/pedidos Listar pedidos
// http://localhost:8080/api/pedidos/1 Buscar pedidos por ID
// http://localhost:8080/api/pedidos/Editar pedido
// http://localhost:8080/api/pedidos/Eliminar pedido
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
    @Autowired
    private PedidoService pedidoService;

    // http://localhost:8080/api/pedidos -> devuelve la lista de pedidos
    @GetMapping
    public List<Pedido> getAllPedidos() {
        return pedidoService.getAllPedidos();
    }

    // http://localhost:8080/api/pedidos/1 -> devuelve el pedido con id 1
    @GetMapping("/{id}")
    public Pedido getPedidoById(@PathVariable Long id) {
        return pedidoService.getPedidoById(id);
    }

    // del http://localhost:8080/api/pedidos/1 -> elimina el pedido con id 1
    @DeleteMapping("/{id}")
    public void deletePedidoById(@PathVariable Long id) {
        pedidoService.deletePedidoById(id);
    }

    @PostMapping
    public Pedido savePedido(@RequestBody Pedido pedido) {
        return pedidoService.savePedido(pedido);

    }

    @PutMapping("/{id}")
    public Pedido updatePedido(@PathVariable Long id, @RequestBody Pedido pedido) {
        return pedidoService.updatePedido(id, pedido);
    }

}
