package com.uade.tpo.ecommerce.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarritoDTO {
	private Long id;
	private UsuarioDTO usuario;
	private List<CarritoItemDTO> items;
}

