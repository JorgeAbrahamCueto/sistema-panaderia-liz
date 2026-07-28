package com.panaderia.sistema_liz.repository;

import com.panaderia.sistema_liz.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Long> {
}