import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  HostListener,
  NgZone,
  OnInit,
} from '@angular/core';
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
    public authService: Auth,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private zone: NgZone
  ) {
    // 🛡️ REACCIÓN AUTOMÁTICA A CAMBIOS DE STEAM ID (Angular v20 Effect)
    effect(() => {
      const currentSteamId = this.authService.steamId();
      if (currentSteamId) {
        this.hasSteamLinked = true;
        this.steamId = currentSteamId;
        this.loadItems();
      } else {
        this.hasSteamLinked = false;
        // Solo dejamos de cargar si estamos seguros de que no hay sesión
        if (!localStorage.getItem('jwt')) {
          this.loading = false;
        }
      }
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    const savedSteamId = localStorage.getItem('steamId');
    const hasToken = !!localStorage.getItem('jwt');

    // 1. Sincronización inmediata para evitar parpadeos
    if (savedSteamId) {
      this.hasSteamLinked = true;
      this.steamId = savedSteamId;
    }

    // 2. Si hay token pero no SteamID, forzar una recarga de info del servidor
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

    // 3. Procesar retorno de Steam (Query Params)
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

  // 🛡️ Escrow modal state
  escrowModalOpen = false;
  escrowChecking = false;
  escrowResult: { hasEscrow: boolean; daysHeld: number; message: string } | null = null;

  // 🛡️ VERIFICAR ESCROW ANTES DE VENDER (Simplificado con Signals)
  confirmSell() {
    if (!this.selectedItem || !this.price || this.price <= 0) return;

    if (this.authService.isTradeBanned()) {
      alert('🚫 No puedes vender ítems. Tu cuenta de Steam tiene los intercambios bloqueados permanentemente.');
      return;
    }

    // Abrir el modal de verificación reflejando el estado global
    this.escrowModalOpen = true;

    // Si ya sabemos si está verificado o no, no hace falta "buscar"
    // Pero forzamos un mini-check proactivo por si acaso el usuario acaba de limpiar su Steam
    this.escrowChecking = true;
    this.cdr.detectChanges();

    this.authService.triggerExtensionCheck();

    // Simulamos un delay de "comprobación" para feedback visual
    setTimeout(() => {
      this.escrowChecking = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  // ✅ CONFIRMAR VENTA REAL (Se llama solo si el usuario pasa la verificación de escrow)
  proceedWithSale() {
    if (!this.selectedItem || !this.price || this.price <= 0) return;

    this.escrowModalOpen = false;
    this.cdr.detectChanges();

    this.dotaService
      .sellItem({
        assetId: this.selectedItem.assetId,
        title: this.selectedItem.name,
        iconUrl: this.selectedItem.imageUrl,
        price: this.price,
        rarity: this.selectedItem.rarity,
        type: this.selectedItem.type,
        hero: this.selectedItem.hero,
        gems: this.selectedItem.gems,
        styles: this.selectedItem.styles
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

  // Cerrar modal de escrow
  closeEscrowModal() {
    this.escrowModalOpen = false;
    this.escrowResult = null;
    this.escrowChecking = false;
    this.cdr.detectChanges();
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
    if (this.escrowModalOpen) { this.closeEscrowModal(); return; }
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
