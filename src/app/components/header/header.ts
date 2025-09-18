import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

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

  constructor(private router: Router) {
    // 👉 Al crear el componente, leemos los roles guardados en localStorage
    // Si no hay roles guardados, dejamos el array vacío
    const storedRoles = localStorage.getItem('roles');
    this.roles = storedRoles ? JSON.parse(storedRoles) : [];
  }

  // 👉 Método para cerrar sesión
  // Elimina el JWT y los roles del localStorage y redirige al login
  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('roles');
    localStorage.removeItem('jwt');
    localStorage.removeItem('roles');
    this.isLoggedIn = false; // 🔹 Actualiza la bandera en frontend
    this.roles = []; // 🔹 Limpia los roles
    this.router.navigate(['/pagina-principal']); // 👈 Ahora redirige al principal
  }
}
