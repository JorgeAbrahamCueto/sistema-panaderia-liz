import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PanaderiaService } from '../../services/panaderia.service';
import { AuthService } from '../../services/auth.service';
import { Producto, Venta, DetalleVenta, Categoria } from '../../models/producto.model';
import Swal from 'sweetalert2';

// Importaciones para el PDF configuradas para Angular 17+
import * as pdfMakeModule from 'pdfmake/build/pdfmake';
import * as pdfFontsModule from 'pdfmake/build/vfs_fonts';

const pdfMake: any = (pdfMakeModule as any).default || pdfMakeModule;
const pdfFonts: any = (pdfFontsModule as any).default || pdfFontsModule;
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

@Component({
  selector: 'app-caja-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caja-pos.html',      
  styleUrl: './caja-pos.css'
})
export class CajaPosComponent implements OnInit {

  // --- VARIABLES PARA LA NAVEGACIÓN DE CATEGORÍAS ---
  categorias: Categoria[] = [];
  productosCompletos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categoriaSeleccionada: Categoria | null = null;
  // ---------------------------------------------------------

  carrito: { producto: Producto; cantidad: number; subtotal: number }[] = [];
  
  subtotalVenta: number = 0;
  igvVenta: number = 0;
  totalVenta: number = 0;

  montoRecibido: number | null = null;
  vuelto: number = 0;
  
  // Variables de control y carga (CA-03)
  procesandoVenta: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  
  usuarioIdActual: number = 1; 
  nombreCajero: string = this.authService.getNombreUsuario();
  rolUsuarioActual: string = this.authService.getRol();

  mensajeExito: string = '';
  mensajeError: string = '';

  private cdr = inject(ChangeDetectorRef);

  constructor(private panaderiaService: PanaderiaService) { }

  ngOnInit(): void {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const userObj = JSON.parse(usuarioStr);
        if (userObj.idUsuario) {
          this.usuarioIdActual = userObj.idUsuario;
        }
      } catch (e) {
        console.error('Error al parsear el usuario del localStorage', e);
      }
    }

    this.cargarDatos();
  }

  irAHome(): void {
    this.router.navigate(['/home']);
  }

  cargarDatos(): void {
    this.panaderiaService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });

    this.panaderiaService.listarProductos().subscribe({
      next: (data) => {
        this.productosCompletos = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = 'Error al cargar los productos.';
        console.error(err);
      }
    });
  }

  // --- NAVEGACIÓN ---
  seleccionarCategoria(cat: Categoria): void {
    this.categoriaSeleccionada = cat;
    const catId = (cat as any).idCategoria || (cat as any).id;
    
    this.productosFiltrados = this.productosCompletos.filter(p => {
      const pCatId = (p.categoria as any)?.idCategoria || (p.categoria as any)?.id;
      return pCatId === catId;
    });
    
    this.cdr.markForCheck();
  }

  volverACategorias(): void {
    this.categoriaSeleccionada = null;
    this.productosFiltrados = [];
    this.cdr.markForCheck();
  }

  // --- CARRITO Y ALERTAS SWEETALERT (CA-02) ---
  agregarAlCarrito(producto: Producto, cantidadStr: string): void {
    const stockActual = producto.stock || 0;
    const cantidadAAgregar = parseInt(cantidadStr, 10) || 1;

    if (stockActual < cantidadAAgregar) {
      Swal.fire({
        icon: 'error',
        title: 'Stock insuficiente',
        text: `Solo quedan ${stockActual} unidades disponibles.`
      });
      return;
    }

    const productoId = producto.idProducto;
    const itemExistente = this.carrito.find(item => item.producto.idProducto === productoId);
    
    if (itemExistente) {
      if (itemExistente.cantidad + cantidadAAgregar <= stockActual) {
        itemExistente.cantidad += cantidadAAgregar;
        itemExistente.subtotal = itemExistente.cantidad * (producto.precio || 0);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Límite alcanzado',
          text: `No puedes agregar esa cantidad. Stock disponible: ${stockActual - itemExistente.cantidad}`
        });
      }
    } else {
      this.carrito.push({
        producto: producto,
        cantidad: cantidadAAgregar,
        subtotal: cantidadAAgregar * (producto.precio || 0)
      });
    }
    this.calcularTotal();
    this.cdr.markForCheck();
  }

  calcularTotal(): void {
    this.subtotalVenta = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
    this.igvVenta = this.subtotalVenta * 0.18;
    let totalExacto = this.subtotalVenta + this.igvVenta;

    this.totalVenta = Math.round(totalExacto * 10) / 10; 

    if (this.montoRecibido !== null) {
      this.vuelto = this.montoRecibido >= this.totalVenta 
        ? Number((this.montoRecibido - this.totalVenta).toFixed(2)) 
        : 0;
    }
  }

  disminuirCantidad(productoId: number): void {
    const itemIndex = this.carrito.findIndex(item => item.producto.idProducto === productoId);
    if (itemIndex > -1) {
      const item = this.carrito[itemIndex];
      if (item.cantidad > 1) {
        item.cantidad--;
        item.subtotal = item.cantidad * (item.producto.precio || 0);
      } else {
        this.carrito.splice(itemIndex, 1);
      }
      this.calcularTotal();
      this.cdr.markForCheck();
    }
  }

  eliminarItem(productoId: number): void {
    this.carrito = this.carrito.filter(item => item.producto.idProducto !== productoId);
    this.calcularTotal();
    this.cdr.markForCheck();
  }

  vaciarCarrito(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se vaciará todo el contenido del carrito.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.carrito = [];
        this.montoRecibido = null;
        this.vuelto = 0;
        this.calcularTotal();
        this.cdr.markForCheck();
      }
    });
  }

  calcularVuelto(valor: string): void {
    const monto = parseFloat(valor);
    if (!isNaN(monto) && monto >= 0) {
      this.montoRecibido = monto;
      this.vuelto = this.montoRecibido >= this.totalVenta 
        ? Number((this.montoRecibido - this.totalVenta).toFixed(2)) 
        : 0;
    } else {
      this.montoRecibido = null;
      this.vuelto = 0;
    }
  }

  // --- PROCESAR VENTA CON CONFIRMACIÓN, TOAST Y LOADING (CA-01 y CA-03) ---
  procesarVenta(): void {
    if (this.carrito.length === 0) return;

    if (this.montoRecibido === null || this.montoRecibido < this.totalVenta) {
      Swal.fire('Atención', 'El monto recibido es menor al total de la venta.', 'warning');
      return;
    }

    // Alerta de confirmación antes de procesar el pago
    Swal.fire({
      title: '¿Confirmar Venta?',
      text: '¿Deseas procesar el pago y registrar el comprobante?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6842ff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cobrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarCobroReal();
      }
    });
  }

  private ejecutarCobroReal(): void {
    this.procesandoVenta = true; // Activa loading (CA-03)
    this.cdr.markForCheck();

    const detallesVenta: DetalleVenta[] = this.carrito.map(item => ({
      producto: { idProducto: item.producto.idProducto }, 
      cantidad: item.cantidad,
      subtotal: item.subtotal
    }));

    const nuevaVenta: Venta = {
      usuario: { idUsuario: this.usuarioIdActual },
      subtotal: this.subtotalVenta,
      igv: this.igvVenta,
      total: this.totalVenta,
      montoRecibido: this.montoRecibido!,
      vuelto: this.vuelto,
      detalles: detallesVenta
    };

    this.panaderiaService.registrarVenta(nuevaVenta, this.rolUsuarioActual).subscribe({
      next: (response) => {
        this.procesandoVenta = false;
        const idGenerado = response.idVenta || response.id || 'N/D';
        
        // Toast verde de éxito superior derecho (CA-01)
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Venta #${idGenerado} registrada con éxito`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        
        this.generarTicketPDF(idGenerado, this.carrito, this.subtotalVenta, this.igvVenta, this.totalVenta, this.montoRecibido!, this.vuelto);
        
        this.carrito = [];
        this.subtotalVenta = 0;
        this.igvVenta = 0;
        this.totalVenta = 0;
        this.montoRecibido = null; 
        this.vuelto = 0;          
        
        this.cargarDatos(); 
        this.volverACategorias();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.procesandoVenta = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al procesar la venta',
          text: err.error?.mensaje || 'Hubo un problema al registrar la venta en el servidor.'
        });
        this.cdr.markForCheck();
      }
    });
  }

  generarTicketPDF(idTicket: any, carrito: any[], subtotal: number, igv: number, total: number, recibido: number, vuelto: number): void {
    try {
      const docDefinition: any = {
        pageSize: { width: 226, height: 'auto' }, 
        pageMargins: [10, 10, 10, 10],
        content: [
          { text: 'PANADERÍA LIZ', fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 2] },
          { text: 'Jiron Mariscal Miller 2299', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 5] },
          { text: '--------------------------------------------------', alignment: 'center' },
          { text: `Ticket #: ${idTicket}`, fontSize: 10, bold: true, margin: [0, 5, 0, 0] },
          { text: `Fecha: ${new Date().toLocaleString()}`, fontSize: 10, margin: [0, 0, 0, 5] },
          { text: '--------------------------------------------------', alignment: 'center' },
          {
            table: { widths: ['*', 'auto'], body: [ ...carrito.map(item => [ { text: `${item.cantidad}x ${item.producto.nombre}`, fontSize: 10 }, { text: `S/ ${item.subtotal.toFixed(2)}`, fontSize: 10, alignment: 'right' } ]) ] },
            layout: 'noBorders', margin: [0, 5, 0, 5]
          },
          { text: '--------------------------------------------------', alignment: 'center' },
          {
            table: {
              widths: ['*', 'auto'],
              body: [
                [{ text: 'Subtotal:', fontSize: 10 }, { text: `S/ ${subtotal.toFixed(2)}`, fontSize: 10, alignment: 'right' }],
                [{ text: 'IGV (18%):', fontSize: 10 }, { text: `S/ ${igv.toFixed(2)}`, fontSize: 10, alignment: 'right' }],
                [{ text: 'TOTAL:', fontSize: 12, bold: true }, { text: `S/ ${total.toFixed(2)}`, fontSize: 12, bold: true, alignment: 'right' }],
                [{ text: 'Efectivo:', fontSize: 10, margin: [0, 5, 0, 0] }, { text: `S/ ${recibido.toFixed(2)}`, fontSize: 10, alignment: 'right', margin: [0, 5, 0, 0] }],
                [{ text: 'Vuelto:', fontSize: 10 }, { text: `S/ ${vuelto.toFixed(2)}`, fontSize: 10, alignment: 'right' }]
              ]
            },
            layout: 'noBorders'
          },
          { text: '--------------------------------------------------', alignment: 'center', margin: [0, 5, 0, 5] },
          { text: '¡Gracias por su compra!', fontSize: 10, alignment: 'center', italic: true }
        ]
      };
      pdfMake.createPdf(docDefinition).print();
    } catch (error) {
      console.error('Ocurrió un error al generar el ticket:', error);
    }
  }
}