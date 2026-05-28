package com.uade.tpo.ecommerce.controller;


import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.PedidoDTO;
import com.uade.tpo.ecommerce.model.Pedido;
import com.uade.tpo.ecommerce.service.PedidoService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
    @Autowired
    private PedidoService pedidoService;

    @GetMapping
    public List<PedidoDTO> getAllPedidos(@org.springframework.security.core.annotation.AuthenticationPrincipal com.uade.tpo.ecommerce.model.Usuario usuario) {
        if (usuario == null) {
            return java.util.List.of();
        }
        return pedidoService.getPedidosByUsuario(usuario.getId());
    }

    @GetMapping("/{id}")
    public PedidoDTO getPedidoById(@PathVariable Long id) {
        return pedidoService.getPedidoById(id);
    }

    @DeleteMapping("/{id}")
    public DeleteResponse deletePedidoById(@PathVariable Long id) {
        getPedidoById(id);
        return pedidoService.deletePedidoById(id);
    }

    @PostMapping
    public PedidoDTO savePedido(@RequestBody Pedido pedido) {
        return pedidoService.savePedido(pedido);

    }

    @PutMapping("/{id}")
    public PedidoDTO udpatePedido(@PathVariable Long id, @RequestBody Pedido pedido) {
        return pedidoService.updatePedido(id, pedido);
    }

}
