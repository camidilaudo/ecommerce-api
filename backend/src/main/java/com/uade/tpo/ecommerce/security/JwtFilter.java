package com.uade.tpo.ecommerce.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.uade.tpo.ecommerce.service.UsuarioService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
//este filtro se ejecuta antes de llamar al controller
//fue configurado en SecurityConfig en la instrucción `addFilterBefore`
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioService usuarioService;

    @Value("${jwt.cookie.name:jwt}")
    private String cookieName;

    /**
     * Este método se ejecuta en cada petición HTTP para verificar si existe un token JWT válido.
     *
     * Prioridad de lectura del token:
     * 1. Cookie HttpOnly (nuevo — seguro contra XSS)
     * 2. Header Authorization: Bearer (fallback — compatibilidad)
     */
    @SuppressWarnings("null")
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = extractTokenFromCookie(request);

        // Fallback: leer del header Authorization (compatibilidad)
        if (token == null) {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                token = header.substring(7);
            }
        }

        if (token != null && jwtUtil.validateToken(token)) {
            String username = jwtUtil.getUsername(token);
            
            // Cargar el usuario completo desde la base de datos
            var usuario = usuarioService.getUsuarioEntityByEmail(username);
            
            if (usuario != null) {
                // Crea un objeto de autenticación con el objeto Usuario como principal
                var auth = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrae el token JWT de la cookie HttpOnly.
     * @return el valor de la cookie jwt, o null si no existe.
     */
    private String extractTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}