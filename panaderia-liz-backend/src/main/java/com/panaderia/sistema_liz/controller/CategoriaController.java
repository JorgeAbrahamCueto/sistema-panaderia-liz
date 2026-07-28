package com.panaderia.sistema_liz.controller;

import com.panaderia.sistema_liz.entity.Categoria;
import com.panaderia.sistema_liz.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    // Método auxiliar para validar que el rol sea ADMIN
    private void verificarRolAdmin(String rolUsuario) {
        if (rolUsuario == null || !"ADMIN".equalsIgnoreCase(rolUsuario)) {
            throw new RuntimeException("Acceso denegado: Solo el Administrador puede gestionar las categorías.");
        }
    }

    // GET: Listar todas las categorías (Acceso permitido para Admin y Cajeros)
    @GetMapping
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    // POST: Registrar una nueva categoría (Solo ADMIN)
    @PostMapping
    public Categoria guardarCategoria(
            @RequestHeader(value = "X-User-Rol", defaultValue = "") String rolUsuario,
            @RequestBody Categoria categoria) {
        
        verificarRolAdmin(rolUsuario);
        return categoriaRepository.save(categoria);
    }

    // PUT: Actualizar una categoría existente (Solo ADMIN)
    @PutMapping("/{id}")
    public Categoria actualizarCategoria(
            @RequestHeader(value = "X-User-Rol", defaultValue = "") String rolUsuario,
            @PathVariable Long id, 
            @RequestBody Categoria categoriaDetalles) {
        
        verificarRolAdmin(rolUsuario);

        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con el id: " + id));
        
        categoria.setNombre(categoriaDetalles.getNombre());
        categoria.setDescripcion(categoriaDetalles.getDescripcion());
        
        return categoriaRepository.save(categoria);
    }

    // DELETE: Eliminar una categoría por ID (Solo ADMIN)
    @DeleteMapping("/{id}")
    public void eliminarCategoria(
            @RequestHeader(value = "X-User-Rol", defaultValue = "") String rolUsuario,
            @PathVariable Long id) {
        
        verificarRolAdmin(rolUsuario);
        categoriaRepository.deleteById(id);
    }
}