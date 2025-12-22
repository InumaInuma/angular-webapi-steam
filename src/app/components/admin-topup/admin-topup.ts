import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Walletservice } from '../../service/walletservice';

@Component({
  selector: 'app-admin-topup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-topup.html',
  styleUrl: './admin-topup.scss',
})
export class AdminTopup implements OnInit {
  pending: any[] = [];
  expandedId: number | null = null;
  loading = false;

  constructor(
    private walletService: Walletservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.walletService.getPendingToday().subscribe((res) => {
      this.pending = res;
      this.cdr.detectChanges();
    });
  }

  toggle(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  // approve(id: number) {
  //   if (!confirm('¿Confirmar aprobación?')) return;

  //   this.walletService.approve(id).subscribe(() => {
  //     this.pending = this.pending.filter((x) => x.requestId !== id);
  //   });
  // }

  // reject(id: number) {
  //   const reason = prompt('Motivo del rechazo');
  //   if (!reason) return;

  //   this.walletService.reject(id, reason).subscribe(() => {
  //     this.pending = this.pending.filter((x) => x.requestId !== id);
  //   });
  // }

  approve(id: number) {
    if (!confirm('¿Confirmar aprobación?')) return;

    this.loading = true;

    this.walletService.approve(id).subscribe({
      next: () => {
        this.pending = this.pending.filter((p) => p.requestId !== id);
        this.expandedId = null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('No se pudo aprobar');
        this.loading = false;
      },
    });
  }

  reject(id: number) {
    const reason = prompt('Motivo del rechazo');
    if (!reason) return;

    this.loading = true;

    this.walletService.reject(id, reason).subscribe({
      next: () => {
        this.pending = this.pending.filter((p) => p.requestId !== id);
        this.expandedId = null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('No se pudo rechazar');
        this.loading = false;
      },
    });
  }
}
