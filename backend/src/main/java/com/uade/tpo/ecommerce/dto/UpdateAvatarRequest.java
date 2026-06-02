package com.uade.tpo.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar el avatar del usuario autenticado.
 * La anotación @Pattern implementa la validación de lista blanca
 * para los 6 avatares predefinidos disponibles en el frontend.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAvatarRequest {

    @NotBlank(message = "El avatar no puede estar vacío")
    @Pattern(
        regexp = "^avatar[1-6]\\.webp$",
        message = "El avatar debe ser uno de los predefinidos (avatar1.webp … avatar6.webp)"
    )
    private String avatar;
}
