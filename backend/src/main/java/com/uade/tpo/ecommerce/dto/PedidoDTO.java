package com.uade.tpo.ecommerce.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoDTO {
    private Long id;
    private Double total;
    private Long usuarioId;
    private List<PedidoItemDTO> items;
}
