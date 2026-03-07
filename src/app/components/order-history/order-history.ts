import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dota } from '../../service/dota';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss'
})
export class OrderHistory implements OnInit {
  history: any[] = [];
  loading = true;

  constructor(private dotaService: Dota, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.dotaService.getOrderHistory().subscribe({
      next: (data: any[]) => {
        console.log('Historial recibido:', data);
        this.history = data;
        this.loading = false;
        this.cdr.detectChanges(); // Forzar actualización de UI
      },
      error: (err: any) => {
        console.error('Error fetching history', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'Canceled': return 'status-canceled';
      case 'Refunded': return 'status-refunded';
      default: return '';
    }
  }

  openTrade(offerId: string) {
    // Opcional: Abrir detalle en Steam si se tiene el ID
    // window.open(...)
  }

  // 👇 Rating Logic
  ratingModalOpen = false;
  selectedOrder: any = null;
  currentRating = 0;
  ratingComment = '';

  openRatingModal(item: any) {
    this.selectedOrder = item;
    this.currentRating = 0;
    this.ratingComment = '';
    this.ratingModalOpen = true;
  }

  closeRatingModal() {
    this.ratingModalOpen = false;
    this.selectedOrder = null;
  }

  setRating(stars: number) {
    this.currentRating = stars;
  }

  submitRating() {
    if (!this.selectedOrder || this.currentRating === 0) return;

    // Asumimos que item.listingId es el OrderId para este flujo simple, 
    // o deberíamos tener un orderId real en el DTO de historial.
    // Revisando PendingSaleDto tiene orderId. Asumamos que el historial también.
    const orderId = this.selectedOrder.orderId || this.selectedOrder.listingId;

    this.dotaService.rateSeller({
      orderId: orderId,
      rating: this.currentRating,
      comment: this.ratingComment
    }).subscribe({
      next: () => {
        alert('✅ ¡Calificación enviada!');
        this.closeRatingModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message ?? 'Error al enviar calificación');
      }
    });
  }
}
