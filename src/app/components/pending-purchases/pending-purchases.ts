import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dota } from '../../service/dota';

export interface PendingPurchaseDto {
    orderId: number;
    listingId: number;
    price: number;
    currencyCode: string;
    createdAtUtc: string;
    itemName: string;
    iconUrl: string;
    itemAssetId?: string;
    sellerName: string;
    tradeOfferId?: string;
    buyerSteamId?: string;
    sellerSteamId?: string;
}

@Component({
    selector: 'app-pending-purchases',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pending-purchases.html',
    styleUrls: ['./pending-purchases.scss']
})
export class PendingPurchasesComponent implements OnInit {
    purchases: PendingPurchaseDto[] = [];
    loading = true;
    selectedPurchase: PendingPurchaseDto | null = null;
    isAccepting = false;

    constructor(private dotaService: Dota, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.loadPurchases();

        // Escuchar respuesta de la Extensión (Comprador)
        window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "P2P_MARKET_ACCEPT_RESULT") {
                this.isAccepting = false;
                if (event.data.success) {
                    alert("✅ " + event.data.message);

                    if (this.selectedPurchase) {
                        this.dotaService.markOrderAsAccepted(this.selectedPurchase.orderId).subscribe({
                            next: () => {
                                this.loadPurchases(); // Recargar compras para que desaparezca la que ya se aceptó
                                this.closeModal();
                            },
                            error: (err) => {
                                console.error(err);
                                alert("⚠️ Aunque se aceptó en Steam, hubo un problema actualizando la plataforma. " + (err.error?.message || 'Error desconocido'));
                                this.loadPurchases();
                                this.closeModal();
                            }
                        });
                    } else {
                        this.loadPurchases();
                        this.closeModal();
                    }
                } else {
                    let errorMessage = event.data.message;
                    if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("Null")) {
                        errorMessage += "\n\nSi el vendedor acaba de enviar la oferta, Steam Guard podría estar reteniéndola o pendiente de confirmación móvil. ¡Espera 1 o 2 minutos y vuelve a intentarlo!";
                    }
                    alert("❌ Error al aceptar: " + errorMessage);
                    this.cdr.detectChanges(); // Reset UI state explicitly
                }
            }
        });
    }

    loadPurchases() {
        this.loading = true;
        this.dotaService.getPendingPurchases().subscribe({
            next: (res: any[]) => {
                this.purchases = res;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    openModal(purchase: PendingPurchaseDto) {
        this.selectedPurchase = purchase;
    }

    closeModal() {
        if (!this.isAccepting) {
            this.selectedPurchase = null;
        }
    }

    confirmAccept() {
        if (!this.selectedPurchase || !this.selectedPurchase.tradeOfferId) return;

        this.isAccepting = true;

        // Enviar mensaje a la Extensión de Chrome (Buyer Content Script)
        window.postMessage({
            type: "P2P_MARKET_ACCEPT_OFFER",
            payload: {
                orderId: this.selectedPurchase.orderId,
                tradeOfferId: this.selectedPurchase.tradeOfferId,
                partnerSteamId: this.selectedPurchase.sellerSteamId // El ID del Vendedor
            }
        }, "*");

        // Timeout por si la extensión falla
        setTimeout(() => {
            if (this.isAccepting) {
                this.isAccepting = false;
                alert("⚠️ Tiempo de espera agotado. Asegúrate de tener la extensión actualizada y encendida.");
                this.openManualSteamApp();
            }
        }, 15000);
    }

    openManualSteamApp() {
        if (!this.selectedPurchase || !this.selectedPurchase.tradeOfferId) return;
        const url = `https://steamcommunity.com/tradeoffer/${this.selectedPurchase.tradeOfferId}/`;
        window.open(url, '_blank');
        this.closeModal();
    }
}
