package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.repository.PedidoRepository;
import com.uade.tpo.ecommerce.repository.ProductoRepository;
import com.uade.tpo.ecommerce.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * ==========================================================
 *            Clase: AdminStatsController
 * ==========================================================
 * Descripción:
 * Controlador REST encargado de proveer métricas agregadas
 * sobre el e-commerce exclusivo para administradores.
 *
 * Endpoints:
 * GET /api/admin/stats    → Retorna un JSON con los KPIs.
 *
 * ==========================================================
 */
@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        Double totalSales = pedidoRepository.sumTotalSales();
        long totalUsers = usuarioRepository.count();
        long totalProducts = productoRepository.countByActivoTrue();
        Long totalStock = productoRepository.sumTotalStockActive();

        stats.put("totalSales", totalSales != null ? totalSales : 0.0);
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        stats.put("totalStock", totalStock != null ? totalStock : 0L);

        return stats;
    }
}
