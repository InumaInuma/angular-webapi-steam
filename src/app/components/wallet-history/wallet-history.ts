import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Walletservice } from '../../service/walletservice';
import { interval, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-wallet-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet-history.html',
  styleUrl: './wallet-history.scss',
})
export class WalletHistory implements OnInit {
  requests: any[] = [];
  loading = true;
  private sub?: Subscription;

  constructor(
    private walletService: Walletservice,
    private cdr: ChangeDetectorRef
  ) {}

  // ngOnInit() {
  //   this.walletService.getMyRequests().subscribe({
  //     next: (res) => {
  //       this.requests = res;
  //       this.loading = false;
  //       this.cdr.detectChanges();
  //     },
  //     error: () => (this.loading = false),
  //   });
  // }

  ngOnInit() {
    // 🔁 Polling cada 10 segundos
    this.sub = interval(10000)
      .pipe(switchMap(() => this.walletService.getMyRequests()))
      .subscribe({
        next: (res) => {
          this.requests = res;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => (this.loading = false),
      });

    // 👉 Primera carga inmediata
    this.walletService.getMyRequests().subscribe((res) => {
      this.requests = res;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
