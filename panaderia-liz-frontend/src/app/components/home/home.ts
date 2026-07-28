import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Ajusta los niveles '../../' según la ubicación de tu carpeta services

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Obtenemos los datos reales del usuario logueado
  nombreUsuario: string = this.authService.getNombreUsuario();
  rolUsuario: string = this.authService.getRol();

  irA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}