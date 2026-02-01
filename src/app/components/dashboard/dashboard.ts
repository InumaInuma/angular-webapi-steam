import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Auth } from '../../service/auth';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { DotaItems } from '../dota-items/dota-items';

@Component({
  selector: 'app-dashboard',
  standalone: true, // 🚨 Agrega standalone
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  isLoggedIn = !!localStorage.getItem('jwt');
  roles: string[] = [];
  steamId: string | null = null;

  // 🛡️ Admin Properties
  pendingVerifications: any[] = [];
  isLoadingVerifications = false;
  activeTab: 'recargas' | 'verificaciones' = 'recargas'; // Control de Tabs

  // 🖼️ Modal Properties
  showModal = false;
  selectedUserForModal: any = null;

  constructor(
    public authService: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // 1. Obtener Info Usuario
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.steamId = response.steamId;
      },
      error: (err) => {
        console.error('Error al obtener info del usuario', err);
        this.router.navigate(['/login']);
      },
    });

    // 2. Por defecto cargamos lo que diga la URL
    if (this.router.url.includes('recargas')) {
      this.activeTab = 'recargas';
    }
  }

  loadPendingVerifications() {
    this.isLoadingVerifications = true;
    this.authService.getPendingVerifications().subscribe({
      next: (users) => {
        this.pendingVerifications = users;
        this.isLoadingVerifications = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando verificaciones', err);
        this.isLoadingVerifications = false;
      }
    });
  }

  openPhotoModal(user: any) {
    this.selectedUserForModal = user;
    this.showModal = true;
  }

  closePhotoModal() {
    this.showModal = false;
    this.selectedUserForModal = null;
  }

  approveUser(userId: number) {
    if (!confirm('¿Estás seguro de APROBAR a este usuario?')) return;
    this.authService.verifyUser(userId, true).subscribe({
      next: () => {
        alert('Usuario Aprobado ✅');
        this.loadPendingVerifications();
        this.closePhotoModal(); // Cerrar modal si estaba abierto
      },
      error: (err) => alert('Error: ' + err.error?.message)
    });
  }

  rejectUser(userId: number) {
    if (!confirm('¿Estás seguro de RECHAZAR a este usuario?')) return;
    this.authService.verifyUser(userId, false).subscribe({
      next: () => {
        alert('Usuario Rechazado ❌');
        this.loadPendingVerifications();
        this.closePhotoModal();
      },
      error: (err) => alert('Error: ' + err.error?.message)
    });
  }

  switchTab(tab: 'recargas' | 'verificaciones') {
    this.activeTab = tab;
    if (tab === 'verificaciones') {
      this.loadPendingVerifications();
      this.router.navigate(['/dashboard']);
    } else if (tab === 'recargas') {
      this.router.navigate(['recargas'], { relativeTo: this.route });
    }
  }

  // 👉 Redirigir al login
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // 👉 Redirigir al registro (en caso de que tengas un componente)
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  logout() {
    this.authService.logout();
  }
}
