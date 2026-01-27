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

  constructor(private dotaService: Dota, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
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
      
      // Este parámetro intenta pre-seleccionar el ítem en la ventana de intercambio
      tradeUrl += `&for_item_${appId}_${contextId}_${assetId}=1`;
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
}

