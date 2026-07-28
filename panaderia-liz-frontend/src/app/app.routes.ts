import { Routes } from '@angular/router';
import { CajaPosComponent } from './components/caja-pos/caja-pos';
import { HistorialVentasComponent } from './components/historial-ventas/historial-ventas';
import { CatalogoComponent } from './components/catalogo/catalogo';
import { LoginComponent } from './login/login';
import { HomeComponent } from './components/home/home'; // 👈 Importamos la pantalla de bienvenida/home

// Importa aquí tu guard cuando lo vayas a activar para bloquear al cajero
// import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // 1. Ruta base: Si alguien entra a localhost:4200, lo manda obligatoriamente al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 2. Pantalla de inicio de sesión
  { path: 'login', component: LoginComponent },

  // 3. Pantalla Principal / Home (A la que llega el usuario tras iniciar sesión con éxito)
  { path: 'home', component: HomeComponent },

  // 4. Pantalla del Punto de Venta (Caja)
  { path: 'caja', component: CajaPosComponent },

  // 5. Pantalla de Historial de Ventas / Auditoría
  { path: 'auditoria', component: HistorialVentasComponent },

  // 6. Pantalla del Catálogo (Inventario)
  { 
    path: 'catalogo', 
    component: CatalogoComponent
    // canActivate: [adminGuard] <-- Quítale las dos barras (//) cuando tengas el Guard creado para proteger la ruta
  },

  // 7. Comodín: Si alguien escribe una URL inventada, lo devuelve al login
  { path: '**', redirectTo: 'login' }
];