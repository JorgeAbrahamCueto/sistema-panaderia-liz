package com.panaderia.sistema_liz.repository;
import com.panaderia.sistema_liz.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
