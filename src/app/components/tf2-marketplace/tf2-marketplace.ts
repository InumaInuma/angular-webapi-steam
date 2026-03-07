import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Dota, MarketplaceItem } from '../../service/dota';
import { Auth } from '../../service/auth';

@Component({
    selector: 'app-tf2-marketplace',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './tf2-marketplace.html',
    styleUrls: ['./tf2-marketplace.scss']
})
export class Tf2Marketplace implements OnInit {
    items: MarketplaceItem[] = [];
    filteredItems: MarketplaceItem[] = [];
    isLoggedIn$: Observable<boolean>;

    searchName = '';
    minPrice: number | null = null;
    maxPrice: number | null = null;

    constructor(
        private dotaService: Dota,
        private cdr: ChangeDetectorRef,
        private authService: Auth,
        private router: Router
    ) {
        this.isLoggedIn$ = this.authService.isLoggedIn$;
    }

    ngOnInit() {
        // AppId 440 for TF2
        this.dotaService.getMarketplaceItems().subscribe((res) => {
            this.items = (res ?? []).filter(item => item.title.includes('TF2') || true);
            this.applyFilter();
            this.cdr.detectChanges();
        });
    }

    applyFilter() {
        this.filteredItems = this.items.filter(item => {
            const matchesName = this.searchName.trim() === '' ||
                item.itemName.toLowerCase().includes(this.searchName.toLowerCase());
            const matchesMinPrice = this.minPrice === null || item.price >= this.minPrice;
            const matchesMaxPrice = this.maxPrice === null || item.price <= this.maxPrice;
            return matchesName && matchesMinPrice && matchesMaxPrice;
        });
    }

    buy(item: MarketplaceItem) {
        if (!this.authService.isLoggedInValue()) {
            if (confirm('Necesitas iniciar sesión para comprar. ¿Ir al login?')) {
                this.router.navigate(['/login']);
            }
            return;
        }

        if (!confirm(`¿Estás seguro de comprar ${item.itemName} por ${item.currencyCode} ${item.price}?`)) {
            return;
        }

        this.dotaService.buyItem(item.listingId).subscribe({
            next: () => {
                alert('✅ ¡Compra exitosa! Revisa tus pedidos pendientes.');
                this.ngOnInit();
            },
            error: (err: any) => {
                alert('❌ Error al comprar: ' + (err.error?.message || err.message));
            }
        });
    }
}
