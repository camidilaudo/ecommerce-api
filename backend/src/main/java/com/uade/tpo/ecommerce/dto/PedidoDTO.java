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
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private java.time.LocalDateTime fechaCreacion;
    private List<PedidoItemDTO> items;
}
