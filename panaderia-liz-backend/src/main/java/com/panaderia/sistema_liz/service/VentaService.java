package com.panaderia.sistema_liz.service;

import com.panaderia.sistema_liz.entity.DetalleVenta;
import com.panaderia.sistema_liz.entity.Producto;
import com.panaderia.sistema_liz.entity.Usuario;
import com.panaderia.sistema_liz.entity.Venta;
import com.panaderia.sistema_liz.repository.ProductoRepository;
import com.panaderia.sistema_liz.repository.UsuarioRepository;
import com.panaderia.sistema_liz.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Método para listar todas las ventas (Historial / Auditoría)
    public List<Venta> listarVentas() {
        return ventaRepository.findAll();
    }

    @Transactional
    public Venta registrarVenta(Venta venta) {
        // 1. Validar y obtener el usuario real de la BD
        Usuario usuario = usuarioRepository.findById(venta.getUsuario().getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        venta.setUsuario(usuario);

        // 2. Procesar cada detalle de la venta
        for (DetalleVenta detalle : venta.getDetalles()) {
            Producto producto = productoRepository.findById(detalle.getProducto().getIdProducto())
                    .orElseThrow(() -> new RuntimeException(
                            "Producto no encontrado con ID: " + detalle.getProducto().getIdProducto()));

            if (producto.getStock() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }

            // Descontar stock
            producto.setStock(producto.getStock() - detalle.getCantidad());
            productoRepository.save(producto);

            // Asignar datos al detalle
            detalle.setPrecioUnitario(producto.getPrecio());
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(detalle.getCantidad()));
            detalle.setSubtotal(subtotal);
            detalle.setProducto(producto); 
            detalle.setVenta(venta);
        }

        // 3. Asignar el Total sumando el Subtotal y el IGV que vienen del frontend
        venta.setTotal(venta.getSubtotal().add(venta.getIgv()));
        
        // 4. Guardar en BD
        return ventaRepository.save(venta);
    }
}