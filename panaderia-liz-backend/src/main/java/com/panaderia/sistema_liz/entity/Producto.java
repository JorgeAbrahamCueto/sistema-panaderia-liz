package com.panaderia.sistema_liz.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
// Nota: Puedes borrar el import de JsonIgnore arriba si ya no lo usas en otra variable

@Data
@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal precio;

    // ¡Eliminamos el @JsonIgnore de aquí para que Angular pueda ver el stock!
    @Column(nullable = false)
    private Integer stock;

    // Le decimos a Java que MySQL se encarga de esta fecha automáticamente
    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    // Relación de Muchos a Uno (Muchos productos pertenecen a una Categoría)
    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;
}