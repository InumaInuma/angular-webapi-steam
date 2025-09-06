import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { NgModule } from '@angular/core';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { publicauthGuard } from './guards/publicauth-guard';
import { Error } from './components/error/error';
import { DotaItems } from './components/dota-items/dota-items';

export const routes: Routes = [
  { path: 'login', component: Login }, //, canActivate: [publicauthGuard]
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: 'dota-items', component: DotaItems },
      // 👇 en el futuro puedes agregar más páginas dentro del dashboard
      // { path: 'settings', component: Settings },
      { path: '', redirectTo: 'dota-items', pathMatch: 'full' },
    ],
  },
  { path: 'error', component: Error }, // 🚨 Ruta de error
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }, // Maneja rutas no válidas
];
