import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Header } from '../header/header';
import { RouterModule } from '@angular/router';
import { Dota, MarketplaceItem } from '../../service/dota';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [CommonModule, RouterModule, Header],
  templateUrl: './pagina-principal.html',
  styleUrl: './pagina-principal.scss',
})
export class PaginaPrincipal implements AfterViewInit {
  items: MarketplaceItem[] = [];
  constructor(private dotaService: Dota, private cdr: ChangeDetectorRef) {}
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
          this.video.nativeElement.play();
        } else {
          this.video.nativeElement.pause();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(this.video.nativeElement);
  }
}
