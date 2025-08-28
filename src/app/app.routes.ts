import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { NgModule } from '@angular/core';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { publicauthGuard } from './guards/publicauth-guard';
import { Error } from './components/error/error';

export const routes: Routes = [

  { path: 'login', component: Login ,  canActivate: [publicauthGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'error', component: Error }, // 🚨 Ruta de error
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Maneja rutas no válidas

];


