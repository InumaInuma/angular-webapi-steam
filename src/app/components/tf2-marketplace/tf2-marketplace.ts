import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Dota, MarketplaceItem } from '../../service/dota';
import { Auth } from '../../service/auth';
import { Walletservice } from '../../service/walletservice';

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
        private router: Router,
        private walletService: Walletservice
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
        if (!this.authService.isLoggedIn()) {
            if (confirm('Necesitas iniciar sesión para comprar. ¿Ir al login?')) {
                this.router.navigate(['/login']);
            }
            return;
        }

        // 🚨 1.1 Validar IDENTIDAD Y TRADES (Expert Mode)
        if (!this.authService.isTradeVerified()) {
            this.authService.triggerExtensionCheck();
            return;
        }

        // 2. Validar que no sea su propio item
        const currentUserId = Number(localStorage.getItem('userId'));
        if (item.sellerUserId === currentUserId) {
            alert('❌ No Puedes Comprar un artículo que tú mismo has puesto en venta.');
            return;
        }

        if (!confirm(`¿Estás seguro de comprar ${item.itemName} por ${item.currencyCode} ${item.price}?`)) {
            return;
        }

        // 3. 🔒 Verificar estado de Escrow en Tiempo Real antes de comprar
        const jwtToken = localStorage.getItem('jwt');
        let escrowListenerRemoved = false;

        const escrowBuyerListener = (event: MessageEvent) => {
            if (event.data.type !== 'P2P_MARKET_ESCROW_RESULT') return;
            if (escrowListenerRemoved) return;

            escrowListenerRemoved = true;
            window.removeEventListener('message', escrowBuyerListener);

            if (!event.data.success) {
                if (!event.data.message.includes('coincide')) {
                    alert('❌ Falló la verificación de seguridad: ' + event.data.message);
                }
                return;
            }

            if (event.data.hasEscrow) {
                const reason = event.data.isTradeBanned
                    ? '🚫 Tu cuenta de Steam tiene los intercambios bloqueados permanentemente.'
                    : `⏳ Tu cuenta tiene una retención de ${event.data.daysHeld} días.`;
                alert(reason);
            } else {
                this.dotaService.buyItem(item.listingId).subscribe({
                    next: () => {
                        alert('✅ ¡Compra exitosa! Revisa tus pedidos pendientes.');
                        this.ngOnInit();
                        this.walletService.getBalance().subscribe({
                            next: (res: any) => {
                                if (res && res.balance !== undefined) {
                                    this.authService.setBalance(res.balance);
                                }
                            },
                            error: (err) => console.error('Error fetching balance:', err)
                        });
                    },
                    error: (err: any) => {
                        alert('❌ Error al comprar: ' + (err.error?.message || err.message));
                    }
                });
            }
        };

        window.addEventListener('message', escrowBuyerListener);
        window.postMessage({ type: 'P2P_MARKET_CHECK_ESCROW', jwtToken, expectedSteamId: this.authService.steamId() }, '*');

        setTimeout(() => {
            if (!escrowListenerRemoved) {
                escrowListenerRemoved = true;
                window.removeEventListener('message', escrowBuyerListener);
                alert('⚠️ La extensión P2P Market no respondió. Inténtalo de nuevo.');
            }
        }, 8000);
    }
}
