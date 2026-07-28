import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; 

  constructor(private http: HttpClient) {}

  login(credenciales: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales).pipe(
      tap((response: any) => {
        const tokenReal = response.token;
        if (tokenReal) {
          localStorage.setItem('token', tokenReal);
          localStorage.setItem('usuario', JSON.stringify(response));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  getRol(): string {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      return usuario.rol || usuario.role || 'CAJERO';
    }
    return '';
  }

  getNombreUsuario(): string {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      return usuario.nombre || 'Usuario';
    }
    return 'Invitado';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}