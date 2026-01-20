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

  openTradeUrl(url: string | null) {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('El comprador no tiene URL de trade válida.');
    }
  }
}
