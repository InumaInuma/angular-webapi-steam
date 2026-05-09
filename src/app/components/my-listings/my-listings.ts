import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dota } from '../../service/dota';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-listings.html',
  styleUrl: './my-listings.scss'
})
export class MyListings implements OnInit {
  listings: any[] = [];
  loading = true;

  constructor(private dotaService: Dota, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    this.loading = true;
    this.dotaService.getSellerListings().subscribe({
      next: (data: any[]) => {
        this.listings = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching listings', err);
        this.loading = false;
        this.cdr.detectChanges();
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
}
