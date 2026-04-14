package com.uade.tpo.ecommerce.controller;

import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.service.UsuarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Listar todos los usuarios
    @GetMapping
    public List<Usuario> getAllUsuarios() {
        return usuarioService.getAllUsuarios();
    }

    // Buscar usuario por ID
    @GetMapping("/{id}")
    public Usuario getUsuarioById(@PathVariable Long id) {
        return usuarioService.getUsuarioById(id);
    }

    // Crear usuario (encripta password)
    @PostMapping
    public Usuario saveUsuario(@RequestBody Usuario usuario) {

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        return usuarioService.saveUsuario(usuario);
    }

    // Actualizar usuario (también encripta si cambia password)
    @PutMapping("/{id}")
    public Usuario updateUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {

        if (usuario.getPassword() != null) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        return usuarioService.updateUsuario(id, usuario);
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public void deleteUsuarioById(@PathVariable Long id) {
        usuarioService.deleteUsuarioById(id);
    }
}