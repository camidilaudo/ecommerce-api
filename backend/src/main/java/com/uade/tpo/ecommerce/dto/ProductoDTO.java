package com.uade.tpo.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductoDTO {
	private Long id;
	private String nombre;
	private Double precio;
	private String descripcion;
	private Integer stock;
	private List<String> imagenes;
	private List<Long> categoriaIds;
	private List<String> categoriaNombres;
	private Long usuarioId;

	// Campos para compatibilidad con el frontend anterior
	private String imagen;
	private String categoria;
}
