package com.uade.tpo.ecommerce.dto;

import jakarta.validation.constraints.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para crear y actualizar productos.
 * DT-01 FIX: Desacopla la capa de presentación de la entidad JPA Producto.
 *
 * Soporta múltiples categorías (categoriaIds) para compatibilidad con el AdminPanel.
 * Las validaciones con @Valid en el controller aseguran datos correctos antes de llegar al servicio.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    private Double precio;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    // Soporte para múltiples categorías (enviado como array desde AdminPanel)
    private List<Long> categoriaIds;

    // Lista de imágenes del producto (URLs)
    private List<String> imagenes;
}