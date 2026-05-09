import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dota, PendingSaleDto } from '../../service/dota';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sales-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sales-hub.html',
  styleUrl: './sales-hub.scss'
})
export class SalesHub implements OnInit {
  activeTab: 'pending' | 'listings' = 'pending';
  
  // Pending Sales Data
  sales: PendingSaleDto[] = [];
  loadingSales = true;
  selectedSale: PendingSaleDto | null = null;
  isSending = false;

  // My Listings Data
  listings: any[] = [];
  loadingListings = true;

  constructor(private dotaService: Dota, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadSales();
    this.loadListings();
    this.cleanupLocks();

    // Listen for extension messages
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "P2P_MARKET_OFFER_RESULT") {
        this.handleExtensionResult(event.data);
      }
    });
  }

  setTab(tab: 'pending' | 'listings') {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  // --- Pending Sales Logic ---
  loadSales() {
    this.loadingSales = true;
    this.dotaService.getPendingSales().subscribe({
      next: (res: PendingSaleDto[]) => {
        this.sales = res;
        this.loadingSales = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.loadingSales = false;
      }
    });
  }

  handleExtensionResult(data: any) {
    if (data.success) {
      if (data.tradeOfferId && this.selectedSale) {
        this.dotaService.markOrderAsSent(this.selectedSale.orderId, data.tradeOfferId).subscribe({
          next: () => {
            this.isSending = false;
            this.removeLock(this.selectedSale?.orderId);
            alert("✅ Oferta enviada con éxito.");
            this.loadSales();
            this.closeModal();
          },
          error: (err) => {
            console.error(err);
            this.isSending = false;
            this.removeLock(this.selectedSale?.orderId);
            alert("❌ Error al guardar en base de datos.");
          }
        });
      }
    } else {
      this.isSending = false;
      this.removeLock(this.selectedSale?.orderId);
      alert("❌ Error desde Extensión: " + data.message);
      this.cdr.detectChanges();
    }
  }

  openModal(sale: PendingSaleDto) {
    this.selectedSale = sale;
  }

  closeModal() {
    if (!this.isSending) {
      this.selectedSale = null;
    }
  }

  confirmSend() {
    if (!this.selectedSale || !this.selectedSale.buyerTradeUrl) return;
    if (this.isSending || this.isOrderLocked(this.selectedSale.orderId)) return;

    this.isSending = true;
    this.setLock(this.selectedSale.orderId);

    window.postMessage({
      type: "P2P_MARKET_SEND_OFFER",
      payload: {
        orderId: this.selectedSale.orderId,
        buyerTradeUrl: this.selectedSale.buyerTradeUrl,
        buyerSteamId: this.extractSteamId(this.selectedSale.buyerTradeUrl),
        assetId: this.selectedSale.itemAssetId,
        appId: this.selectedSale.appId || 570,
        contextId: this.selectedSale.contextId || 2
      }
    }, "*");

    setTimeout(() => {
      if (this.isSending) {
        this.isSending = false;
        alert("⚠️ Tiempo de espera agotado.");
        this.removeLock(this.selectedSale?.orderId);
        this.openManualTradeUrl();
      }
    }, 20000);
  }

  extractSteamId(tradeUrl: string): string {
    try {
      const urlObj = new URL(tradeUrl);
      return urlObj.searchParams.get('partner') || '';
    } catch { return ''; }
  }

  openManualTradeUrl() {
    if (!this.selectedSale) return;
    let tradeUrl = this.selectedSale.buyerTradeUrl;
    if (this.selectedSale.itemAssetId) {
      const appId = this.selectedSale.appId || 570;
      const contextId = this.selectedSale.contextId || 2;
      tradeUrl += `&add_item=${appId}_${contextId}_${this.selectedSale.itemAssetId}`;
    }
    window.open(tradeUrl, 'SteamTrade', 'width=1050,height=850');
    this.closeModal();
  }

  cancelSale(sale: PendingSaleDto) {
    if (!confirm('¿Estás seguro de cancelar esta venta?')) return;
    this.dotaService.cancelSale(sale.orderId).subscribe({
      next: () => {
        alert('✅ Venta cancelada.');
        this.loadSales();
      },
      error: (err) => alert('❌ Error: ' + (err.error?.message || 'Error'))
    });
  }

  // --- My Listings Logic ---
  loadListings() {
    this.loadingListings = true;
    this.dotaService.getSellerListings().subscribe({
      next: (data: any[]) => {
        this.listings = data;
        this.loadingListings = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadingListings = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Reserved': return 'status-reserved';
      case 'Sold': return 'status-sold';
      case 'Canceled': return 'status-canceled';
      case 'Suspended': return 'status-suspended';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Active': return 'En Venta';
      case 'Reserved': return 'Reservado';
      case 'Sold': return 'Vendido';
      case 'Canceled': return 'Cancelado';
      case 'Suspended': return 'Suspendido';
      default: return status;
    }
  }

  // --- Locks Management ---
  isOrderLocked(orderId: number | undefined): boolean {
    if (!orderId) return false;
    const lockTime = localStorage.getItem(`sending_order_${orderId}`);
    if (!lockTime) return false;
    if (Date.now() - parseInt(lockTime) > 60000) {
      this.removeLock(orderId);
      return false;
    }
    return true;
  }
  setLock(orderId: number) { localStorage.setItem(`sending_order_${orderId}`, Date.now().toString()); }
  removeLock(orderId: number | undefined) { if (orderId) localStorage.removeItem(`sending_order_${orderId}`); }
  cleanupLocks() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sending_order_')) {
        const time = localStorage.getItem(key);
        if (time && (Date.now() - parseInt(time) > 60000)) localStorage.removeItem(key);
      }
    }
  }
}
