import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Dota, DotaItemDto } from '../../service/dota';
import { Auth } from '../../service/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dota-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dota-items.html',
  styleUrl: './dota-items.scss',
})
export class DotaItems implements OnInit {
  /*  items: any[] = []; */
  items: DotaItemDto[] = [];
  pagedItems: DotaItemDto[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 10; // 👈 cantidad de ítems por página
  steamId: string | null = null;
  constructor(
    private dotaService: Dota,
    private cdr: ChangeDetectorRef,
    private authService: Auth,
    private route: ActivatedRoute // 👈 aquí
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const steamId = params['steamId'];

      if (token) {
        localStorage.setItem('jwt', token);
        if (steamId) {
          localStorage.setItem('steamId', steamId);
        }

        // 🚀 Apenas recibo el token, cargo los ítems
        this.loadItems();
      }
    });
  }
  // ✅ Ahora solo los cargo después de vincular Steam
  loadItems(): void {
    this.dotaService.getUserDotaItems().subscribe((items) => {
      this.items = items;
      this.updatePagedItems();
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  /*  loginWithSteam() {
    this.authService.loginWithSteam().subscribe({
      next: (res) => {
        if (res.success) {
          // Guarda el nuevo token
          localStorage.setItem('jwt', res.token);
          localStorage.setItem('steamId', res.steamId);

          this.dotaService.getUserDotaItems().subscribe((items) => {
            this.items = items;
            this.updatePagedItems();
          });
        }
      },
      error: (err) => console.error('❌ Error en login con Steam:', err),
    });
  } */

  loginWithSteam(): void {
    this.authService.loginWithSteam();
  }

  // 👇 Getter que evita usar Math directamente en el template
  get totalPages(): number {
    return Math.ceil(this.items.length / this.pageSize);
  }

  updatePagedItems(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedItems = this.items.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedItems();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedItems();
    }
  }
}
