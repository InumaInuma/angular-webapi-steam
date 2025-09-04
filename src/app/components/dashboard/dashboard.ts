import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Auth } from '../../service/auth';
import { Router } from '@angular/router';
import { DotaItems } from '../dota-items/dota-items';

@Component({
  selector: 'app-dashboard',
  standalone: true, // 🚨 Agrega standalone
  imports: [CommonModule,DotaItems],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit{
    steamId: string | null = null;

   constructor(private authService: Auth, private router: Router) { } // 🚨 Inyecta el Router


   ngOnInit(): void {
    // Al iniciar el componente, obtiene la información del usuario
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.steamId = response.steamId;
      },
      error: (err) => {
        // En caso de error, el guard ya redirigió al login,
        // por lo que este código de error es poco probable.
         console.error('Error al obtener info del usuario', err);
        // Si hay un error, redirige al login.
        this.router.navigate(['/login']);
      }
    });
     }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // 🚨 Redirige al login después del logout
  }
}
