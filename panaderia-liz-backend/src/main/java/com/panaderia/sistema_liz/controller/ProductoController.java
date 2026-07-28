package com.panaderia.sistema_liz.controller;

import com.panaderia.sistema_liz.entity.Producto;
import com.panaderia.sistema_liz.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // Método auxiliar para validar que el rol sea ADMIN
    private void verificarRolAdmin(String rolUsuario) {
        if (rolUsuario == null || !"ADMIN".equalsIgnoreCase(rolUsuario)) {
            throw new RuntimeException("Acceso denegado: Solo el Administrador puede realizar esta operación en el catálogo.");
        }
    }

    // GET: Listar todos los productos (Acceso libre para roles autenticados: Cajero y Admin)
    @GetMapping
    public List<Producto> listarProductos() {
        System.out.println("-> [BACKEND] Solicitud recibida para listar todos los productos.");
        List<Producto> lista = productoRepository.findAll();
        System.out.println("-> [BACKEND] Productos encontrados en BD: " + lista.size());
        return lista;
    }

    // POST: Registrar un nuevo producto (Solo ADMIN)
    @PostMapping
    public Producto guardarProducto(
            @RequestHeader(value = "X-User-Rol", defaultValue = "") String rolUsuario,
            @RequestBody Producto producto) {
        
        verificarRolAdmin(rolUsuario);
        return productoRepository.save(producto);
    }

    // PUT: Actualizar un producto existente (Solo ADMIN)
    @PutMapping("/{id}")
    public Producto actualizarProducto(
            @RequestHeader(value = "X-User-Rol", defaultValue = "") String rolUsuario,
            @PathVariable Long id, 
            @RequestBody Producto productoDetalles) {
        
        verificarRolAdmin(rolUsuario);

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con el id: " + id));
        
        producto.setNombre(productoDetalles.getNombre());
        producto.setPrecio(productoDetalles.getPrecio());
        producto.setStock(productoDetalles.getStock());
        producto.setCategoria(productoDetalles.getCategoria());
        
        return productoRepository.save(producto);
    }

    // DELETE: Eliminar un producto por ID (Solo ADMIN)
    @DeleteMapping("/{id}")
    public void eliminarProducto(
            @RequestHeader(value = "X-User-Rol", defaultValue = "") String rolUsuario,
            @PathVariable Long id) {
        
        verificarRolAdmin(rolUsuario);
        productoRepository.deleteById(id);
    }
}