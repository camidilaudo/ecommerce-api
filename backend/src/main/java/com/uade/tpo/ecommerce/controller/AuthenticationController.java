package com.uade.tpo.ecommerce.controller;

import lombok.RequiredArgsConstructor;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
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
 * de usuarios, incluyendo login, registro y logout.
 *
 * @param authenticationService → Servicio que maneja
 *                                 la lógica de autenticación.
 *
 * Endpoints:
 * POST /api/auth/login    → Autenticación de usuario.
 *                           Setea JWT como HttpOnly cookie.
 * POST /api/auth/register → Registro de nuevo usuario.
 * POST /api/auth/logout   → Cierre de sesión (borra cookie JWT).
 *
 * Configuración:
 * - Recibe solicitudes con credenciales.
 * - Devuelve datos de usuario (sin token en body).
 * - JWT se transporta como HttpOnly cookie (protección XSS).
 *
 * ==========================================================
 */

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    @Value("${jwt.cookie.name:jwt}")
    private String cookieName;

    @Value("${jwt.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${jwt.cookie.sameSite:Lax}")
    private String cookieSameSite;

    @Value("${jwt.cookie.path:/}")
    private String cookiePath;

    // BUG-04 FIX: ResponseEntity con status HTTP explícito
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse loginResponse = authenticationService.login(request);

        // Setear JWT como HttpOnly cookie (el token NO va en el body)
        ResponseCookie jwtCookie = ResponseCookie.from(cookieName, loginResponse.getToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .path(cookiePath)
                .maxAge(jwtExpiration / 1000) // convertir ms → segundos
                .sameSite(cookieSameSite)
                .build();

        // Limpiar el token del body para que no sea accesible desde JavaScript
        loginResponse.setToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(loginResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authenticationService.register(request));
    }

    /**
     * Logout — Borra la cookie JWT seteando MaxAge=0.
     * El browser elimina la cookie automáticamente al recibir esta respuesta.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie jwtCookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path(cookiePath)
                .maxAge(0)
                .sameSite(cookieSameSite)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .build();
    }
}