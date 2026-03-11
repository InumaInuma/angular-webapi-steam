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
import { Topup } from './components/topup/topup';
import { AdminTopup } from './components/admin-topup/admin-topup';
import { WalletHistory } from './components/wallet-history/wallet-history';
import { PendingSales } from './components/pending-sales/pending-sales';
import { PendingPurchasesComponent } from './components/pending-purchases/pending-purchases';
import { OrderHistory } from './components/order-history/order-history';
import { MarketplaceComponent } from './components/marketplace/marketplace';
import { SupportCenter } from './components/support-center/support-center.component';
import { AdminSupport } from './components/admin-support/admin-support.component';
import { Cs2Marketplace } from './components/cs2-marketplace/cs2-marketplace';
import { Tf2Marketplace } from './components/tf2-marketplace/tf2-marketplace';

export const routes: Routes = [

  { path: 'login', component: Login, canActivate: [publicauthGuard] },

  // Página Principal → pública
  {
    path: 'pagina-principal',
    component: PaginaPrincipal,
  },
  {
    path: 'marketplace',
    component: MarketplaceComponent,
  },
  {
    path: 'marketplace/cs2',
    component: Cs2Marketplace,
  },
  {
    path: 'marketplace/tf2',
    component: Tf2Marketplace,
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
  {
    path: 'topup',
    component: Topup,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
  },
  {
    path: 'wallet-history',
    component: WalletHistory,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
  },
  {
    path: 'pending-sales',
    component: PendingSales,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
  },
  {
    path: 'pending-purchases',
    component: PendingPurchasesComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
  },


  {
    path: 'order-history',
    component: OrderHistory,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
  },

  // Support Center
  {
    path: 'support',
    component: SupportCenter,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Customer' },
  },

  // Dashboard  → Admins

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    children: [
      {
        path: 'recargas',
        component: AdminTopup,
      },
      {
        path: 'soporte',
        component: AdminSupport,
      },
    ],
  },

  { path: 'error', component: Error },
  { path: '', redirectTo: '/pagina-principal', pathMatch: 'full' }, // 👈 redirige a principal
  { path: '**', redirectTo: '/login' },
];
