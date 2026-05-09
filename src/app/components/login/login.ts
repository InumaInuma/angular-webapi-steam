import { Component, OnInit } from '@angular/core';
import { Auth } from '../../service/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true, // Si es un componente standalone
  imports: [
    CommonModule, // 👈 para usar *ngIf, ng-template
    FormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  isRegisterMode = false; // 👈 controla si estamos en login o registro

  constructor(private authService: Auth, private route: ActivatedRoute) {}

  ngOnInit() {
    // Detectar si venimos con el parámetro ?register=true
    this.route.queryParams.subscribe((params) => {
      this.isRegisterMode = !!params['register'];
    });
  }

  // Cambiar entre login y registro
  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  loginWithCredentials(email: string, password: string) {
    this.authService.loginWithCredentials(email, password).subscribe({
      next: (res) => {
        if (!res.success) {
          alert(res.message);
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        alert('Error en login');
      },
    });
  }
  register(displayName: string, email: string, password: string) {
    this.authService.register(displayName, email, password).subscribe((res) => {
      if (res && res.userId) {
        alert('🎉 Registro exitoso. Ahora puedes iniciar sesión.');
        this.isRegisterMode = false;
      } else {
        alert('❌ No se pudo registrar el usuario.');
      }
    });
  }
}
