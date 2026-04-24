package com.uade.tpo.ecommerce.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import com.uade.tpo.ecommerce.dto.LoginResponse;
import com.uade.tpo.ecommerce.dto.LoginRequest;
import com.uade.tpo.ecommerce.dto.RegisterRequest;
import com.uade.tpo.ecommerce.dto.RegisterResponse;
import com.uade.tpo.ecommerce.service.AuthenticationService;

/**
 * ==========================================================
 *            Clase: AuthenticationController
 * ==========================================================
 * Descripción:
 * Controlador encargado de gestionar la autenticación
 * de usuarios, incluyendo login y registro.
 *
 * @param authenticationService → Servicio que maneja
 *                                 la lógica de autenticación.
 *
 * Endpoints:
 * POST /api/auth/login    → Autenticación de usuario.
 * POST /api/auth/register → Registro de nuevo usuario.
 *
 * Configuración:
 * - Recibe solicitudes con credenciales.
 * - Devuelve tokens JWT y datos de usuario.
 *
 * ==========================================================
 */

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authenticationService.login(request);
    }

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {
        return authenticationService.register(request);
    }
}