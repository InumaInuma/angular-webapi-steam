import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../service/auth';
import { map } from 'rxjs';

export const publicauthGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // No hagas la llamada a la API. En su lugar, usa el estado del servicio.
  return authService.isLoggedIn$.pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        return true; // Si NO está logeado, permite el acceso
      } else {
        router.navigate(['/pagina-principal']); // Si YA está logeado, redirige
        return false;
      }
    })
  );
};
