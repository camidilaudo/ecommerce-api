package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.PedidoDTO;
import com.uade.tpo.ecommerce.exception.UnAuthorizedException;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.model.enums.Role;
import com.uade.tpo.ecommerce.service.PedidoService;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * PedidoController — Gestión de pedidos del usuario autenticado.
 *
 * BUG-03 FIX: todos los endpoints retornan ResponseEntity.
 * DT-06 FIX: protección IDOR en GET /{id} y DELETE /{id}.
 *            Un usuario solo puede ver/eliminar sus propios pedidos.
 *            Los ADMINs tienen acceso total.
 * DT-02 FIX: inyección por constructor con @RequiredArgsConstructor.
 */
@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    // GET pedidos del usuario autenticado
    @GetMapping
    public ResponseEntity<List<PedidoDTO>> getAllPedidos(@AuthenticationPrincipal Usuario usuario) {
        if (usuario == null) {
            return ResponseEntity.ok(List.of());
        }
        // ADMIN ve todos los pedidos; USER solo los suyos
        if (usuario.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(pedidoService.getAllPedidos());
        }
        return ResponseEntity.ok(pedidoService.getPedidosByUsuario(usuario.getId()));
    }

    // GET pedido por ID — DT-06: validación de ownership
    @GetMapping("/{id}")
    public ResponseEntity<PedidoDTO> getPedidoById(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        PedidoDTO pedido = pedidoService.getPedidoById(id);

        // DT-06 FIX: IDOR — validar que el pedido le pertenece al usuario autenticado
        if (usuario.getRole() != Role.ADMIN && !pedido.getUsuarioId().equals(usuario.getId())) {
            throw new UnAuthorizedException("No tenés acceso a este pedido.");
        }
        return ResponseEntity.ok(pedido);
    }

    // DELETE pedido — DT-06: validación de ownership
    @DeleteMapping("/{id}")
    public ResponseEntity<DeleteResponse> deletePedidoById(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        PedidoDTO pedido = pedidoService.getPedidoById(id);

        // DT-06 FIX: solo el dueño o un ADMIN puede eliminar el pedido
        if (usuario.getRole() != Role.ADMIN && !pedido.getUsuarioId().equals(usuario.getId())) {
            throw new UnAuthorizedException("No tenés permiso para eliminar este pedido.");
        }
        return ResponseEntity.ok(pedidoService.deletePedidoById(id));
    }
}
