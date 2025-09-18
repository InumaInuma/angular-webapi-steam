import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // 1️⃣ Tomar roles desde localStorage
  const storedRoles = localStorage.getItem('roles');
  const roles: string[] = storedRoles ? JSON.parse(storedRoles) : [];

  // 2️⃣ Tomar el rol requerido de la ruta (ej: data: { role: 'Admin' })
  const requiredRole = route.data['role'];

  // 3️⃣ Verificar
  if (roles.includes(requiredRole)) {
    return true; // ✅ tiene permiso
  }

  // ❌ si no tiene permiso, redirigir
  console.warn(`Acceso denegado. Se requiere rol: ${requiredRole}`);
  router.navigate(['/error']); // puedes mandarlo a error o login
  return false;
};
