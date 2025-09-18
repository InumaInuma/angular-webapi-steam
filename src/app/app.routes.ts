import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { NgModule } from '@angular/core';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { publicauthGuard } from './guards/publicauth-guard';
import { Error } from './components/error/error';
import { DotaItems } from './components/dota-items/dota-items';
import { roleGuard } from './guards/role-guard-guard';
import { PaginaPrincipal } from './components/pagina-principal/pagina-principal';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [publicauthGuard] },

  // Página Principal → pública
  {
    path: 'pagina-principal',
    component: PaginaPrincipal,
  },

  // Perfil Perfil → cualquier logeado
  { path: 'profile', component: Profile, canActivate: [authGuard] },

  // Avatars → Customers logeados
  {
    path: 'dota-items',
    component: DotaItems,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
  },

  // Dashboard  → Admins
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
  },

  { path: 'error', component: Error },
  { path: '', redirectTo: '/pagina-principal', pathMatch: 'full' }, // 👈 redirige a principal
  { path: '**', redirectTo: '/login' },
];
