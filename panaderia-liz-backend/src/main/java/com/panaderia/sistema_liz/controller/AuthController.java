package com.panaderia.sistema_liz.controller;

import com.panaderia.sistema_liz.dto.AuthResponse;
import com.panaderia.sistema_liz.dto.LoginRequest;
import com.panaderia.sistema_liz.entity.Usuario;
import com.panaderia.sistema_liz.repository.UsuarioRepository;
import com.panaderia.sistema_liz.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1. Buscar usuario por email
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // 2. Validación de contraseña blindada (soporta BCrypt o texto plano)
            boolean passwordValida = false;
            
            try {
                passwordValida = passwordEncoder.matches(request.getPassword(), usuario.getPassword());
            } catch (Exception e) {
                passwordValida = false;
            }

            if (!passwordValida) {
                passwordValida = request.getPassword().equals(usuario.getPassword());
            }

            if (!passwordValida) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Usuario o contraseña incorrectos");
            }

            // 3. Generar el Token JWT firmado
            String token = jwtService.generateToken(usuario, usuario.getRol(), usuario.getIdUsuario(), usuario.getNombre());

            // 4. Responder con los datos del usuario y su token
            AuthResponse response = AuthResponse.builder()
                    .token(token)
                    .idUsuario(usuario.getIdUsuario())
                    .nombre(usuario.getNombre())
                    .email(usuario.getEmail())
                    .rol(usuario.getRol())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error en login: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Usuario o contraseña incorrectos");
        }
    }
}