import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../service/auth';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
   const authService = inject(Auth);
  const router = inject(Router);
   
  return authService.checkLoginStatus().pipe(
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
