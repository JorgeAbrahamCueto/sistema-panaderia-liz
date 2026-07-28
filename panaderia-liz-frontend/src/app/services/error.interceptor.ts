import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      // Si el status es 0, Spring Boot está apagado o no responde
      if (error.status === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Servidor Desconectado',
          text: 'No se pudo conectar con el servidor backend. Por favor verifique que esté encendido.'
        });
      }
      return throwError(() => error);
    })
  );
};