import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Auth } from './service/auth';
import { filter, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Walletservice } from './service/walletservice';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('auth-app-angular');
  showBackButton = false;
  isAdminRoute = false;
  mobileMenuOpen = false;
  isLoggedIn$: any;
  balance$: any;

  constructor(
    private location: Location,
    private router: Router,
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private walletService: Walletservice
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.balance$ = this.authService.balance$;
    // Inicializar isAdminRoute inmediatamente
    this.isAdminRoute = window.location.pathname.includes('/dashboard');
  }

  ngOnInit() {
    // Escuchar cambios de ruta para mostrar/ocultar botón atrás
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // No mostrar en login ni en pagina-principal
      const url = event.urlAfterRedirects;
      this.showBackButton = !(url.includes('/login') || url.includes('/pagina-principal'));
      this.isAdminRoute = url.includes('/dashboard');
    });

    // Reactivo: actualizar saldo cada vez que el usuario inicie sesión
    this.authService.isLoggedIn$.pipe(
      filter(isLoggedIn => isLoggedIn === true),
      switchMap(() => this.walletService.getBalance().pipe(
        catchError(() => of({ balance: 0 }))
      ))
    ).subscribe((res: any) => {
      if (res && res.balance !== undefined) {
        this.authService.setBalance(res.balance);
        this.cdr.detectChanges();
      }
    });

    // Cargar info inicial si ya hay token al entrar/refrescar
    if (localStorage.getItem('jwt')) {
      this.authService.getUserInfo().subscribe();
    }
  }

  goBack(): void {
    this.location.back();
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMenu(): void {
    this.mobileMenuOpen = false;
  }
}
