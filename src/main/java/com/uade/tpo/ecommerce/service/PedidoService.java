package com.uade.tpo.ecommerce.service;

import java.util.List;

import com.uade.tpo.ecommerce.exception.BadRequestException;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.model.Pedido;
import com.uade.tpo.ecommerce.repository.PedidoRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public List<Pedido> getAllPedidos() {
        return pedidoRepository.findAll();
    }

    public Pedido getPedidoById(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Pedido no encontrado"));
    }

    public void deletePedidoById(Long id) {
        pedidoRepository.deleteById(id);
    }

    public Pedido savePedido(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    public Pedido updatePedido(Long id, Pedido pedido) {

        Pedido existingPedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Pedido no encontrado"));

        existingPedido.setItems(pedido.getItems());
        existingPedido.setTotal(pedido.getTotal());

        // SOLO si agregaste estado
        // existingPedido.setEstado(pedido.getEstado());

        return pedidoRepository.save(existingPedido);
    }
}