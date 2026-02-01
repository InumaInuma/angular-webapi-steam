import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Dota, MarketplaceItem } from '../../service/dota';

import { Auth } from '../../service/auth';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pagina-principal.html',
  styleUrl: './pagina-principal.scss',
})
export class PaginaPrincipal implements AfterViewInit {
  items: MarketplaceItem[] = [];
  isLoggedIn$: Observable<boolean>; // 👈 Declarar tipo

  constructor(
    private dotaService: Dota,
    private cdr: ChangeDetectorRef,
    private authService: Auth // 👈 Inyectar Auth
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$; // 👈 Inicializar en constructor
  }

  ngOnInit() {
    this.dotaService.getMarketplaceItems().subscribe((res) => {
      this.items = res ?? [];
      this.cdr.detectChanges();
    });
  }

  buy(item: MarketplaceItem) {
    if (!confirm(`¿Estás seguro de comprar ${item.itemName} por ${item.currencyCode} ${item.price}?`)) {
      return;
    }

    this.dotaService.buyItem(item.listingId).subscribe({
      next: (res) => {
        alert('✅ ¡Compra exitosa! Revisa tus pedidos pendientes.');
        // Recargar items para quitar el comprado
        this.ngOnInit();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al comprar: ' + (err.error?.message || err.message));
      }
    });
  }

  @ViewChild('videoRef') video!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!this.video) return;

        if (entry.isIntersecting) {
          this.video.nativeElement.muted = false; // 👈 Forzar mute para políticas de navegador
          this.video.nativeElement.play().catch(err => console.warn('Error autoplay:', err));
          this.cdr.detectChanges(); // 👈 Solicitado por usuario
        } else {
          try {
            this.video.nativeElement.pause();
          } catch (e) { } // Ignorar errores de pausa si no estaba reproduciendo
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(this.video.nativeElement);
    this.cdr.detectChanges(); // 👈 Forzar chequeo inicial
  }
}
