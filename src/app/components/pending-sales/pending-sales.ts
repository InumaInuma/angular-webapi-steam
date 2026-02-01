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
  }

  loadSales() {
    this.loading = true;
    this.dotaService.getPendingSales().subscribe({
      next: (res) => {
        this.sales = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
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

    // Construir URL manual
    // Intenta pre-seleccionar el ítem del inventario del vendedor (nosotros)
    // Formato: &for_item_<APPID>_<CONTEXTID>_<ASSETID>=1
    // Ejemplo: &for_item_570_2_123456789=1

    let tradeUrl = this.selectedSale.buyerTradeUrl;

    if (this.selectedSale.itemAssetId) {
      const appId = this.selectedSale.appId || 570;
      const contextId = this.selectedSale.contextId || 2;
      const assetId = this.selectedSale.itemAssetId;

      // 🚀 add_item: Intenta que el item aparezca en los cuadros de la derecha (Tus artículos)
      tradeUrl += `&add_item=${appId}_${contextId}_${assetId}`;
    }

    // Abrir en popup centrado
    const width = 1050;
    const height = 850;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      tradeUrl,
      'SteamTrade',
      `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars=yes,status=1`
    );
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
      error: (err) => {
        console.error(err);
        alert('❌ Error al cancelar la venta: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }
}

