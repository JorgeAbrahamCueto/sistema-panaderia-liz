import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, Venta, Categoria } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class PanaderiaService {
  private apiUrl = 'http://localhost:8080/api';

  private headersAdmin = new HttpHeaders({
    'X-User-Rol': 'ADMIN'
  });

  constructor(private http: HttpClient) {}

  // --- PRODUCTOS ---
  listarProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  crearProducto(producto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos`, producto, { headers: this.headersAdmin });
  }

  actualizarProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/productos/${id}`, producto, { headers: this.headersAdmin });
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/productos/${id}`, { headers: this.headersAdmin });
  }

  // --- CATEGORÍAS ---
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  crearCategoria(categoria: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias`, categoria, { headers: this.headersAdmin });
  }

  actualizarCategoria(id: number, categoria: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categorias/${id}`, categoria, { headers: this.headersAdmin });
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categorias/${id}`, { headers: this.headersAdmin });
  }

  // --- VENTAS ---
  registrarVenta(venta: Venta, rol: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ventas`, venta, { headers: { 'Rol-Usuario': rol } });
  }

  listarVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/ventas`);
  }
}