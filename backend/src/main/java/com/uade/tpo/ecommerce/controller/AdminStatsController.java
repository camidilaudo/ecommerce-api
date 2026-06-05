package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.model.enums.Role;
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

        // Stats extendidas para la pantalla de Gestión de Usuarios
        long totalActivos = usuarioRepository.countByActivo(true);
        long totalBloqueados = usuarioRepository.countByActivo(false);
        long totalAdmins = usuarioRepository.countByRole(Role.ADMIN);
        long totalClientes = usuarioRepository.countByRole(Role.USER);

        stats.put("totalSales", totalSales != null ? totalSales : 0.0);
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        stats.put("totalStock", totalStock != null ? totalStock : 0L);
        stats.put("totalActivos", totalActivos);
        stats.put("totalBloqueados", totalBloqueados);
        stats.put("totalAdmins", totalAdmins);
        stats.put("totalClientes", totalClientes);

        return stats;
    }
}
