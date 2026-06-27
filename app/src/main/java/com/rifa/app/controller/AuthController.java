package com.rifa.app.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Value("${plataforma.admin.usuario}")
    private String usuarioCorrecto;

    @Value("${plataforma.admin.password}")
    private String passwordCorrecta;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String usuarioIngresado = credenciales.get("usuario");
        String passwordIngresada = credenciales.get("password");

        if (usuarioCorrecto.equals(usuarioIngresado) && passwordCorrecta.equals(passwordIngresada)) {
            return ResponseEntity.ok(Map.of("mensaje", "Acceso concedido", "autorizado", true));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("mensaje", "Usuario o contraseña incorrectos", "autorizado", false));
    }
}