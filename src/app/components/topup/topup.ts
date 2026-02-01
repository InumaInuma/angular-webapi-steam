import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateTopUpRequestDto,
  Walletservice,
} from '../../service/walletservice';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topup',
  standalone: true, // Asumo que es standalone
  imports: [CommonModule, FormsModule],
  templateUrl: './topup.html',
  styleUrl: './topup.scss',
})
export class Topup {
  // amount = 0;
  // currencyCode = 'USD';
  // paymentMethod = '';
  // notes = '';
  // loading = false;
  // success = false;
  // error?: string;
  model: CreateTopUpRequestDto = {
    amount: 0,
    currencyCode: 'PEN',
    paymentMethod: '',
    evidenceUrl: null,
    evidenceBase64: null,
    notes: null,
  };

  loading = false;
  success = false;
  error?: string;

  constructor(private wallet: Walletservice, private router: Router) { }

  // submit() {
  //   if (this.amount <= 0) return;

  //   this.loading = true;
  //   this.wallet
  //     .createTopUp({
  //       amount: this.amount,
  //       currencyCode: this.currencyCode,
  //       paymentMethod: this.paymentMethod,
  //       notes: this.notes,
  //     })
  //     .subscribe({
  //       next: () => {
  //         this.success = true;
  //         this.loading = false;
  //       },
  //       error: (err) => {
  //         this.error = err.error?.message ?? 'Error al crear solicitud';
  //         this.loading = false;
  //       },
  //     });
  // }

  submit() {
    // Validaciones
    if (this.model.amount <= 0) {
      this.error = 'El monto debe ser mayor a 0.';
      return;
    }
    if (!this.model.paymentMethod) {
      this.error = 'Selecciona un método de pago.';
      return;
    }
    if (!this.model.evidenceUrl || this.model.evidenceUrl.length !== 7) {
      this.error = 'El número de operación debe tener 7 dígitos.';
      return;
    }
    if (!this.model.evidenceBase64) {
      this.error = 'Debes subir una captura del comprobante.';
      return;
    }

    this.loading = true;
    this.error = undefined; // Limpiar errores anteriores

    this.wallet.createTopUp(this.model).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;

        // 🚨 Lógica de éxito: Mostrar mensaje y redirigir

        // 1. Mostrar la alerta nativa (opcional, pero da buen feedback)
        alert(
          '✅ Solicitud de recarga enviada con éxito. Pendiente de aprobación.'
        );

        // 2. Redirigir a la página principal (o al dashboard) después de un breve retraso
        setTimeout(() => {
          this.router.navigate(['/pagina-principal']); // 🚨 Redirige a la ruta raíz (página-principal)
        }, 3000); // 3000 milisegundos (3 segundos)

        // Opcional: Si quieres reiniciar el formulario después del éxito
        // this.model = { /* valores iniciales */ };
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Error al crear solicitud';
        this.loading = false;
      },
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.model.evidenceBase64 = reader.result as string;
      this.model.evidenceUrl = null; // prioridad base64
    };
    reader.readAsDataURL(file);
  }

  // Helper para solo permitir números en el input
  onlyNumbers(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
}
