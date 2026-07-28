import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PanaderiaService } from '../../services/panaderia.service';
import { Venta } from '../../models/producto.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-ventas.html',
  styleUrl: './historial-ventas.css'
})
export class HistorialVentasComponent implements OnInit {

  ventasCompletas: Venta[] = []; // Todas las ventas de la BD
  ventasFiltradas: Venta[] = [];  // Las que se muestran en la tabla
  ventaSeleccionada: Venta | null = null;
  mensajeError: string = '';

  // Variables para los inputs de fecha
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';

  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  constructor(private panaderiaService: PanaderiaService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.panaderiaService.listarVentas().subscribe({
      next: (data) => {
        // Ordenamos por ID descendente (más recientes primero)
        this.ventasCompletas = data.sort((a: any, b: any) => (b.idVenta || b.id || 0) - (a.idVenta || a.id || 0));
        this.ventasFiltradas = [...this.ventasCompletas]; // Inicialmente mostramos todas
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = 'Error al conectar con la base de datos. Verifique el estado del servidor.';
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  // --- LÓGICA DE FILTRADO POR FECHAS ---
  filtrarPorFechas(): void {
    if (!this.filtroFechaInicio && !this.filtroFechaFin) {
      this.ventasFiltradas = [...this.ventasCompletas];
      return;
    }

    this.ventasFiltradas = this.ventasCompletas.filter((v: any) => {
      if (!v.fechaVenta) return false;
      
      // Extraemos solo la parte de la fecha (YYYY-MM-DD) del registro
      const fechaVentaStr = new Date(v.fechaVenta).toISOString().split('T')[0];
      
      let cumpleInicio = true;
      let cumpleFin = true;

      if (this.filtroFechaInicio) {
        cumpleInicio = fechaVentaStr >= this.filtroFechaInicio;
      }
      if (this.filtroFechaFin) {
        cumpleFin = fechaVentaStr <= this.filtroFechaFin;
      }

      return cumpleInicio && cumpleFin;
    });

    this.cdr.markForCheck();
  }

  // Método para sumar el total de las ventas que se muestran actualmente
  calcularTotalFiltrado(): number {
    return this.ventasFiltradas.reduce((acc, v: any) => acc + (v.total || 0), 0);
  }

  limpiarFiltro(): void {
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.ventasFiltradas = [...this.ventasCompletas];
    this.cdr.markForCheck();
  }

  irAHome(): void {
    this.router.navigate(['/home']);
  }

  // Exportar a Excel respeta lo que esté filtrado en pantalla
  exportarAExcel(): void {
    if (!this.ventasFiltradas || this.ventasFiltradas.length === 0) {
      alert('No hay ventas filtradas para exportar.');
      return;
    }

    const datosParaExcel = this.ventasFiltradas.map((v: any) => ({
      'N° Ticket': v.idVenta || v.id,
      'Fecha y Hora': v.fechaVenta ? new Date(v.fechaVenta).toLocaleString() : 'N/D',
      'Cajero Responsable': v.usuario?.username || v.usuario?.nombre || 'Cajero',
      'Subtotal (S/)': v.subtotal || 0,
      'IGV (18%) (S/)': v.igv || 0,
      'Total Pagado (S/)': v.total || 0,
      'Efectivo Recibido (S/)': v.montoRecibido || 0,
      'Vuelto (S/)': v.vuelto || 0
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExcel);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Filtrado');

    const fechaActual = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Reporte_Ventas_${fechaActual}.xlsx`);
  }

  verDetalles(venta: Venta): void {
    this.ventaSeleccionada = venta;
  }

  cerrarModal(): void {
    this.ventaSeleccionada = null;
  }
}