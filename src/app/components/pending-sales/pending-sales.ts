import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dota, PendingSaleDto } from '../../service/dota';

@Component({
  selector: 'app-pending-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-sales.html',
  styleUrl: './pending-sales.scss'
})
export class PendingSales implements OnInit {
  sales: PendingSaleDto[] = [];
  loading = true;
  selectedSale: PendingSaleDto | null = null;
  isSending = false;

  constructor(private dotaService: Dota, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadSales();

    // Escuchar respuesta de la Extensión
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "P2P_MARKET_OFFER_RESULT") {
        this.isSending = false;
        if (event.data.success) {
          alert("✅ " + event.data.message);
          this.loadSales(); // Recargar ventas
          this.closeModal();
        } else {
          alert("❌ Error desde Extensión: " + event.data.message);
        }
      }
    });
  }

  loadSales() {
    this.loading = true;
    this.dotaService.getPendingSales().subscribe({
      next: (res: PendingSaleDto[]) => {
        this.sales = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
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

    this.isSending = true;

    // Enviar mensaje a la Extensión de Chrome
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

    // Timeout por si la extensión no está instalada o falla en responder (20 segundos)
    setTimeout(() => {
      if (this.isSending) {
        this.isSending = false;
        alert("⚠️ Tiempo de espera agotado. Asegúrate de tener la Extensión 'P2P Market Auto-Sender' instalada y activa.");

        // Fallback: abrir manual
        this.openManualTradeUrl();
      }
    }, 20000); // <-- 20 segundos para dar tiempo a la macro de UI
  }

  extractSteamId(tradeUrl: string): string {
    // tradeUrl ejemplo: https://steamcommunity.com/tradeoffer/new/?partner=12345678&token=abcde
    const urlObj = new URL(tradeUrl);
    return urlObj.searchParams.get('partner') || '';
  }

  openManualTradeUrl() {
    if (!this.selectedSale) return;
    let tradeUrl = this.selectedSale.buyerTradeUrl;
    if (this.selectedSale.itemAssetId) {
      const appId = this.selectedSale.appId || 570;
      const contextId = this.selectedSale.contextId || 2;
      tradeUrl += `&add_item=${appId}_${contextId}_${this.selectedSale.itemAssetId}`;
    }
    const width = 1050;
    const height = 850;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(tradeUrl, 'SteamTrade', `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars=yes,status=1`);
    this.closeModal();
  }

  copyAssetId(id: string | undefined) {
    if (!id) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        alert('✅ AssetID copiado: ' + id);
      });
    } else {
      // Fallback
      alert('AssetID: ' + id);
    }
  }

  cancel(sale: PendingSaleDto) {
    if (!confirm('¿Estás seguro de cancelar esta venta? El dinero será devuelto al comprador y la venta se cancelará permanentemente.')) {
      return;
    }

    this.dotaService.cancelSale(sale.orderId).subscribe({
      next: () => {
        alert('✅ Venta cancelada correctamente.');
        this.loadSales(); // 👈 Recargar desde el servidor para asegurar sincronización
      },
      error: (err: any) => {
        console.error(err);
        alert('❌ Error al cancelar la venta: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }
}

