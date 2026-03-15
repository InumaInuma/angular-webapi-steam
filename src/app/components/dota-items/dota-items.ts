import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { distinctUntilChanged } from 'rxjs/operators';
import { Dota, DotaItemDto } from '../../service/dota';
import { Auth } from '../../service/auth';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dota-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dota-items.html',
  styleUrl: './dota-items.scss',
})
export class DotaItems implements OnInit {
  /*  items: any[] = []; */
  items: DotaItemDto[] = [];
  filteredItems: DotaItemDto[] = []; // 👈 Nuevo: Lista de ítems filtrados
  pagedItems: DotaItemDto[] = [];
  searchTerm: string = ''; // 👈 Nuevo: Término de búsqueda
  loading = true;
  currentPage = 1;
  pageSize = 10; // 👈 cantidad de ítems por página
  steamId: string | null = null;

  // 👇 Modal state
  modalOpen = false;
  selectedItem: DotaItemDto | null = null;
  price: number | null = null;
  showSuccessMessage = false;
  hasSteamLinked = false;

  constructor(
    private dotaService: Dota,
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const savedSteamId = localStorage.getItem('steamId');
    const hasToken = !!localStorage.getItem('jwt');

    // 1. Sincronización inmediata para evitar parpadeos
    if (savedSteamId) {
      this.hasSteamLinked = true;
      this.steamId = savedSteamId;
    }

    // 2. Escuchar cambios reactivos y forzar detección
    this.authService.steamId$
      .pipe(distinctUntilChanged()) // 👈 Evitar duplicados si el ID es el mismo
      .subscribe(steamId => {
        if (steamId) {
          this.hasSteamLinked = true;
          this.steamId = steamId;
          this.loadItems();
        } else {
          this.hasSteamLinked = false;
          // Solo dejamos de cargar si estamos seguros de que no hay Steam (o no hay sesión)
          if (!hasToken) {
            this.loading = false;
          }
        }
        this.cdr.detectChanges(); // 👈 Forzar para que el HTML reaccione al instante
      });

    // 3. Si hay token pero no SteamID, forzar una recarga de info del servidor
    if (hasToken && !savedSteamId) {
      this.loading = true; // Aseguramos que el loader esté activo mientras esperamos al server
      this.authService.getUserInfo().subscribe({
        next: (user) => {
          if (!user?.steamId) {
            this.loading = false; // Ahora sí, confirmamos que no tiene Steam vinculado
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }

    // 4. Procesar retorno de Steam (Query Params)
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const steamIdFromUrl = params['steamId'];

      if (token && steamIdFromUrl) {
        localStorage.setItem('jwt', token);
        localStorage.setItem('steamId', steamIdFromUrl);
        this.authService.getUserInfo().subscribe(); // Refrescar estado global
        this.showSuccessMessage = true;
        setTimeout(() => { this.showSuccessMessage = false; this.cdr.detectChanges(); }, 5000);
      }
    });
  }
  // ✅ Ahora solo los cargo después de vincular Steam
  loadItems(): void {
    this.loading = true; // 👈 Asegurar que el loader se vea al empezar
    this.dotaService.getUserDotaItems().subscribe((items) => {
      this.items = items.filter((i) => i.isTradable);
      this.applyFilter(); // 👈 Llama al filtro inicial (que copia todos a filteredItems)
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  // 👇 Filtrar localmente por nombre
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(item =>
        item.name.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1; // 👈 Volver a pág 1 al filtrar
    this.updatePagedItems();
  }

  loginWithSteam(): void {
    this.authService.loginWithSteam();
  }

  //   confirmSell() {
  //   if (!confirm('¿Estás seguro que deseas vender este item?')) {
  //     return;
  //   }
  //   this.dotaService.sellItem({
  //     assetId: this.selectedItem.assetId,
  //     title: this.selectedItem.name,
  //     price: this.price
  //   }).subscribe({
  //     next: () => {
  //       alert('✅ Item publicado correctamente');
  //       this.closeModal();
  //       this.removeItemFromList(this.selectedItem.assetId);
  //     },
  //     error: (err) => {
  //       alert(err.error?.message ?? 'Error al publicar');
  //     }
  //   });
  // }

  // ✅ CONFIRMAR VENTA (BACKEND REAL)
  confirmSell() {
    if (!this.selectedItem || !this.price || this.price <= 0) return;

    const ok = confirm(
      `¿Estás seguro que deseas vender "${this.selectedItem.name}" por S/ ${this.price}?`
    );
    if (!ok) return;

    this.dotaService
      .sellItem({
        assetId: this.selectedItem.assetId,
        title: this.selectedItem.name,
        iconUrl: this.selectedItem.imageUrl,
        price: this.price,
        rarity: this.selectedItem.rarity,
        type: this.selectedItem.type,
        hero: this.selectedItem.hero,
        gems: this.selectedItem.gems, // 👈 Include gems
        styles: this.selectedItem.styles // 👈 Include styles
      })
      .subscribe({
        next: () => {
          alert('✅ Ítem publicado correctamente');
          this.removeItemFromList(this.selectedItem!.assetId);
          this.closeModal();
        },
        error: (err) => {
          alert(err.error?.message ?? '❌ Error al publicar el ítem');
        },
      });
  }

  // 🧹 Quitar ítem del listado local
  removeItemFromList(assetId: string) {
    this.items = this.items.filter((i) => i.assetId !== assetId);
    this.applyFilter(); // 👈 Refrescar filtros y paginación
    this.cdr.detectChanges();
  }

  // 🔵 Modal handlers
  openModal(item: DotaItemDto) {
    this.selectedItem = item;
    this.price = null;
    this.modalOpen = true;
    document.body.style.overflow = 'hidden'; // evita scroll de fondo
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedItem = null;
    document.body.style.overflow = ''; // restaura scroll
    this.cdr.detectChanges();
  }

  // AQUI ES EL MODAL PARA ENVIARLE LOS DATOS PARA VENDER MIS ITEMS
  // confirmAdd() {
  //   if (!this.selectedItem || !this.price || this.price <= 0) return;
  //   // Aquí haz lo que necesites (emitir evento, llamar API, etc.)
  //   console.log('Agregar al marketplace:', {
  //     assetId: this.selectedItem.assetId,
  //     name: this.selectedItem.name,
  //     price: this.price,
  //     imageUrl: this.selectedItem.imageUrl,
  //   });
  //   this.closeModal();
  // }

  // Cerrar con tecla ESC
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.modalOpen) this.closeModal();
  }

  // 👇 Getter que evita usar Math directamente en el template
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
  }

  updatePagedItems(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedItems = this.filteredItems.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedItems();
      this.cdr.detectChanges();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedItems();
      this.cdr.detectChanges();
    }
  }
}
