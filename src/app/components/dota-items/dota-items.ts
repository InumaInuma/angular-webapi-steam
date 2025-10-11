import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Dota, DotaItemDto } from '../../service/dota';
import { Auth } from '../../service/auth';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dota-items',
  standalone: true,
  imports: [CommonModule,FormsModule],
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

  // 👇 Modal state
  modalOpen = false;
  selectedItem: DotaItemDto | null = null;
  price: number | null = null;

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

 

  loginWithSteam(): void {
    this.authService.loginWithSteam();
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
  }

  confirmAdd() {
    if (!this.selectedItem || !this.price || this.price <= 0) return;
    // Aquí haz lo que necesites (emitir evento, llamar API, etc.)
    console.log('Agregar al marketplace:', {
      assetId: this.selectedItem.assetId,
      name: this.selectedItem.name,
      price: this.price,
      imageUrl: this.selectedItem.imageUrl,
    });
    this.closeModal();
  }

  // Cerrar con tecla ESC
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.modalOpen) this.closeModal();
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
