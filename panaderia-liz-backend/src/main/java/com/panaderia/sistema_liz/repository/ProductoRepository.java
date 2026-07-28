package com.panaderia.sistema_liz.repository;
import com.panaderia.sistema_liz.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}