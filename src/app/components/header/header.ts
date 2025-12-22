import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Walletservice } from '../../service/walletservice';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule], // 👈 agrégalo aquí
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  // 👉 Bandera booleana que indica si el usuario está logeado
  // Se inicializa verificando si existe un JWT en localStorage
  isLoggedIn = !!localStorage.getItem('jwt');
  // 👉 Lista de roles que tiene el usuario logeado (ej: ["Customer"], ["Admin"])
  roles: string[] = [];
  balance: number = 0;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private walletService: Walletservice
  ) {
    // 👉 Al crear el componente, leemos los roles guardados en localStorage
    // Si no hay roles guardados, dejamos el array vacío
    const storedRoles = localStorage.getItem('roles');
    this.roles = storedRoles ? JSON.parse(storedRoles) : [];

    if (this.isLoggedIn && this.roles.includes('Customer')) {
      this.loadBalance();
    }
  }

  loadBalance() {
    this.walletService.getBalance().subscribe({
      next: (res) => {
        this.balance = res.balance;
        this.cdr.detectChanges();
      },
      error: () => (this.balance = 0),
    });
  }

  // 👉 Método para cerrar sesión
  // Elimina el JWT y los roles del localStorage y redirige al login
  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('roles');

    this.isLoggedIn = false; // 🔹 Actualiza la bandera en frontend
    this.roles = []; // 🔹 Limpia los roles
    localStorage.clear();
    this.router.navigate(['/pagina-principal']); // 👈 Ahora redirige al principal
    this.cdr.detectChanges();
  }
}
