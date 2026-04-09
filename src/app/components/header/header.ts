import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Walletservice } from '../../service/walletservice';
import { Auth } from '../../service/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  roles: string[] = [];

  constructor(
    private router: Router,
    private walletService: Walletservice,
    public authService: Auth
  ) {
    const storedRoles = localStorage.getItem('roles');
    this.roles = storedRoles ? JSON.parse(storedRoles) : [];

    if (this.authService.isLoggedIn() && this.roles.includes('Customer')) {
      this.loadBalance();
    }
  }

  loadBalance() {
    this.walletService.getBalance().subscribe({
      next: (res: any) => {
        this.authService.balance.set(res.balance);
      },
      error: () => this.authService.balance.set(0),
    });
  }

  logout() {
    this.authService.logout();
  }
}
