import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';// Ajusta los niveles '../' según tu ubicación exacta

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  credenciales = { email: '', password: '' };
  mensajeError = '';
  cargando = false;

  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  iniciarSesion(): void {
    if (!this.credenciales.email || !this.credenciales.password) {
      this.mensajeError = 'Por favor, complete todos los campos.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    this.authService.login(this.credenciales).subscribe({
      next: (res: any) => {
        this.cargando = false;

        // 👈 Redirigimos a la pantalla Home recién creada
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.cargando = false;
        this.mensajeError = 'Usuario o contraseña incorrectos. Intente nuevamente.';
        console.error(err);
      }
    });
  }
}