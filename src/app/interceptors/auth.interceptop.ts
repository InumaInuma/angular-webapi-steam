import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('jwt');

  let cloned = req;
  if (token) {
    cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      withCredentials: false,
    });
  }

  return next(cloned).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('roles');
        localStorage.removeItem('steamId');
        router.navigate(['/login']); // 👈 lo mandas al login
      }
      return throwError(() => error);
    })
  );
};
