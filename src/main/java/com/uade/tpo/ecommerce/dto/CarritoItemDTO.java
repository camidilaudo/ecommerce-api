package com.uade.tpo.ecommerce.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarritoItemDTO {
    private Long id;
    private ProductoDTO producto;
    private Integer cantidad;
}
