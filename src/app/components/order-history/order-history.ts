import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dota } from '../../service/dota';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss'
})
export class OrderHistory implements OnInit {
  history: any[] = [];
  loading = true;

  constructor(private dotaService: Dota, private router: Router,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.dotaService.getOrderHistory().subscribe({
      next: (data) => {
        this.history = data;
        this.loading = false;
      },
      error: (err) => {
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
}
