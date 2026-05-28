package com.uade.tpo.ecommerce.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.exception.ResourceNotFoundException;
import com.uade.tpo.ecommerce.model.Pedido;
import com.uade.tpo.ecommerce.model.PedidoItem;
import com.uade.tpo.ecommerce.repository.PedidoRepository;
import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.PedidoDTO;
import com.uade.tpo.ecommerce.dto.PedidoItemDTO;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    private PedidoItemDTO itemToDto(PedidoItem item) {
        if (item == null) return null;
        return PedidoItemDTO.builder()
                .id(item.getId())
                .productoId(item.getProducto() != null ? item.getProducto().getId() : null)
                .productoNombre(item.getProducto() != null ? item.getProducto().getNombre() : null)
                .cantidad(item.getCantidad())
                .precioUnitario(item.getPrecioUnitario())
                .build();
    }

    private PedidoDTO toDto(Pedido pedido) {
        if (pedido == null) return null;
        List<PedidoItemDTO> items = pedido.getItems() != null
                ? pedido.getItems().stream().map(this::itemToDto).collect(Collectors.toList())
                : null;

        return PedidoDTO.builder()
                .id(pedido.getId())
                .total(pedido.getTotal())
                .usuarioId(pedido.getUsuario() != null ? pedido.getUsuario().getId() : null)
                .fechaCreacion(pedido.getFechaCreacion())
                .items(items)
                .build();
    }

    public List<PedidoDTO> getAllPedidos() {
        return pedidoRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<PedidoDTO> getPedidosByUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public PedidoDTO getPedidoById(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));
        return toDto(pedido);
    }

    public DeleteResponse deletePedidoById(Long id) {
        getPedidoById(id);
        pedidoRepository.deleteById(id);
        return DeleteResponse.builder().mensaje("Pedido eliminado con éxito").build();
    }

    public PedidoDTO savePedido(Pedido pedido) {
        Pedido saved = pedidoRepository.save(pedido);
        return toDto(saved);
    }

    public PedidoDTO updatePedido(Long id, Pedido pedido) {
        Pedido existing = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));
        existing.setItems(pedido.getItems());
        existing.setTotal(pedido.getTotal());
        Pedido saved = pedidoRepository.save(existing);
        return toDto(saved);
    }
}