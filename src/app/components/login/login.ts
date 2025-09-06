import { Component, OnInit } from '@angular/core';
import { Auth } from '../../service/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true, // Si es un componente standalone
  imports: [
    CommonModule, // 👈 para usar *ngIf, ng-template
    FormsModule, // 👈 opcional, si luego usas ngModel
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  isRegisterMode = false; // 👈 controla si estamos en login o registro

  constructor(private authService: Auth) {}

  // Cambiar entre login y registro
  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  loginWithCredentials(email: string, password: string) {
    this.authService.loginWithCredentials(email, password).subscribe({
      next: (res) => {
        if (res.success) {
          console.log('✅ Login correcto', res.userId);
          window.location.href = '/dashboard'; // Redirige al dashboard
        } else {
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
    // TODO: llamar a tu API de registro
    this.authService.register(displayName, email, password).subscribe((res) => {
      if (res && res.userId) {
        alert('🎉 Registro exitoso. Ahora puedes iniciar sesión.');
        this.isRegisterMode = false; // cambia al modo login
      } else {
        alert('❌ No se pudo registrar el usuario.');
      }
    });
  }
}
