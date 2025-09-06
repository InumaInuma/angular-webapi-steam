import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Dota, DotaItemDto } from '../../service/dota';
import { Auth } from '../../service/auth';

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

  constructor(
    private dotaService: Dota,
    private cdr: ChangeDetectorRef,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    this.dotaService.getUserDotaItems().subscribe((items) => {
      this.items = items;
      this.updatePagedItems();
      this.loading = false; // 👈 cuando termina, quitamos el spinner
      // 👇 Forzamos a Angular a detectar los cambios
      this.cdr.detectChanges();
    });
  }

  loginWithSteam() {
    this.authService.login();
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
