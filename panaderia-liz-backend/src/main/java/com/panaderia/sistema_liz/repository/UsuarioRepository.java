package com.panaderia.sistema_liz.repository;

import com.panaderia.sistema_liz.entity.Usuario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Buscar usuario por correo electrónico para autenticación
    Optional<Usuario> findByEmail(String email);
}