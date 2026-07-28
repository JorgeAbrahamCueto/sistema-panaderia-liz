import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PanaderiaService } from '../../services/panaderia.service';
import { Producto, Categoria } from '../../models/producto.model';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class CatalogoComponent implements OnInit {
  
  pestanaActiva: 'productos' | 'categorias' = 'productos';
  productos: Producto[] = [];
  categorias: Categoria[] = [];

  // Control de Modales
  mostrarModalProducto = false;
  mostrarModalCategoria = false;
  modoEdicion = false;

  // Objetos para formularios
  productoSeleccionado: any = { nombre: '', precio: 0, stock: 0, categoria: { idCategoria: '' } };
  categoriaSeleccionada: any = { nombre: '', descripcion: '' };

  private router = inject(Router);

  constructor(private panaderiaService: PanaderiaService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Método para regresar a la pantalla de bienvenida / Home
  irAHome(): void {
    this.router.navigate(['/home']);
  }

  cargarDatos(): void {
    this.panaderiaService.listarProductos().subscribe({
      next: (data: Producto[]) => this.productos = data,
      error: (err: any) => console.error('Error cargando productos', err)
    });

    this.panaderiaService.listarCategorias().subscribe({
      next: (data: Categoria[]) => this.categorias = data,
      error: (err: any) => console.error('Error cargando categorías', err)
    });
  }

  cambiarPestana(pestana: 'productos' | 'categorias'): void {
    this.pestanaActiva = pestana;
  }

  // --- BOTÓN PRINCIPAL NUEVO ---
  abrirModalNuevo(): void {
    this.modoEdicion = false;
    if (this.pestanaActiva === 'productos') {
      this.productoSeleccionado = { nombre: '', precio: 0, stock: 0, categoria: { idCategoria: '' } };
      this.mostrarModalProducto = true;
    } else {
      this.categoriaSeleccionada = { nombre: '', descripcion: '' };
      this.mostrarModalCategoria = true;
    }
  }

  cerrarModales(): void {
    this.mostrarModalProducto = false;
    this.mostrarModalCategoria = false;
  }

  // --- ACCIONES DE PRODUCTO ---
  editarProducto(producto: Producto): void {
    this.modoEdicion = true;
    this.productoSeleccionado = { ...producto };
    if (!this.productoSeleccionado.categoria) {
      this.productoSeleccionado.categoria = { idCategoria: '' };
    }
    this.mostrarModalProducto = true;
  }

  guardarProducto(): void {
    const payload = {
      nombre: this.productoSeleccionado.nombre,
      precio: this.productoSeleccionado.precio,
      stock: this.productoSeleccionado.stock,
      categoria: {
        idCategoria: this.productoSeleccionado.categoria.idCategoria || this.productoSeleccionado.categoria.id
      }
    };

    if (this.modoEdicion) {
      const id = this.productoSeleccionado.idProducto || this.productoSeleccionado.id;
      this.panaderiaService.actualizarProducto(id, payload).subscribe({
        next: () => {
          alert('Producto actualizado con éxito');
          this.cargarDatos();
          this.cerrarModales();
        },
        error: (err) => alert('Error al actualizar producto.')
      });
    } else {
      this.panaderiaService.crearProducto(payload).subscribe({
        next: () => {
          alert('Producto creado con éxito');
          this.cargarDatos();
          this.cerrarModales();
        },
        error: (err) => alert('Error al crear producto.')
      });
    }
  }

  eliminarProducto(id: number): void {
    if (confirm(`¿Estás seguro de eliminar el producto #${id}?`)) {
      this.panaderiaService.eliminarProducto(id).subscribe({
        next: () => {
          alert('Producto eliminado');
          this.cargarDatos();
        },
        error: () => alert('No se pudo eliminar el producto')
      });
    }
  }

  // --- ACCIONES DE CATEGORÍA ---
  editarCategoria(cat: Categoria): void {
    this.modoEdicion = true;
    this.categoriaSeleccionada = { ...cat };
    this.mostrarModalCategoria = true;
  }

  guardarCategoria(): void {
    const payload = {
      nombre: this.categoriaSeleccionada.nombre,
      descripcion: this.categoriaSeleccionada.descripcion
    };

    if (this.modoEdicion) {
      const id = this.categoriaSeleccionada.idCategoria || this.categoriaSeleccionada.id;
      this.panaderiaService.actualizarCategoria(id, payload).subscribe({
        next: () => {
          alert('Categoría actualizada con éxito');
          this.cargarDatos();
          this.cerrarModales();
        },
        error: () => alert('Error al actualizar categoría.')
      });
    } else {
      this.panaderiaService.crearCategoria(payload).subscribe({
        next: () => {
          alert('Categoría creada con éxito');
          this.cargarDatos();
          this.cerrarModales();
        },
        error: () => alert('Error al crear categoría.')
      });
    }
  }

  eliminarCategoria(id: number): void {
    if (confirm(`¿Estás seguro de eliminar la categoría #${id}? (Asegúrate de que no tenga productos asignados)`)) {
      this.panaderiaService.eliminarCategoria(id).subscribe({
        next: () => {
          alert('Categoría eliminada');
          this.cargarDatos();
        },
        error: () => alert('No se puede eliminar la categoría porque tiene productos asociados.')
      });
    }
  }
}