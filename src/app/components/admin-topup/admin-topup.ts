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
  ) { }

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

  // Lógica del Modal de Evidencia
  selectedEvidence: string | null = null;

  openEvidence(base64: string | null, url: string | null) {
    if (base64) {
      if (base64.startsWith('data:image')) {
        this.selectedEvidence = base64;
      } else {
        // 🛠️ Fix: Si viene sin cabecera (raw base64), asumimos JPEG/PNG
        // Lo ideal es que el backend guarde el mime type, pero esto soluciona el 90% de casos
        this.selectedEvidence = `data:image/jpeg;base64,${base64}`;
      }
    } else if (url) {
      this.selectedEvidence = url;
    } else {
      alert('No hay comprobante adjunto');
    }
  }

  closeEvidence() {
    this.selectedEvidence = null;
  }
}
