package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.uade.tpo.ecommerce.dto.LoginRequest;
import com.uade.tpo.ecommerce.dto.RegisterRequest;
import com.uade.tpo.ecommerce.dto.RegisterResponse;
import com.uade.tpo.ecommerce.service.AuthenticationService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Ahora devuelve el objeto LoginResponse en lugar de un String
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {
        return authenticationService.register(request);
    }
}