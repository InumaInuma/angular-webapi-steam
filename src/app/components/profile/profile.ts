import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Auth } from '../../service/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user: any = null;
  newTradeUrl: string = ''; // Variable para el input
  newApiKey: string = ''; // Input para API Key
  isSaving: boolean = false;
  isSavingKey: boolean = false;

  // Nuevos campos
  numeroDocumento: string = '';
  celular: string = '';
  fotoDniF: string = '';
  fotoDniR: string = '';
  isSavingProfile: boolean = false;


  constructor(private authService: Auth, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.authService.getProfile().subscribe((profile) => {
      this.user = profile;
      this.newTradeUrl = profile.tradeOfferUrl || ''; // Cargamos la URL actual si existe

      // Cargar datos nuevos si existen
      this.numeroDocumento = profile.numeroDocumento || '';
      this.celular = profile.celular || '';
      // No cargamos las fotos base64 por performance/privacidad en la vista inicial, 
      // solo mostramos si ya verificó, pero si quieres previsualizar, tendrías que traerlas.

      this.cdr.detectChanges();
    });
  }

  saveTradeUrl() {
    const mensaje =
      '¿Deseas insertar la URL? Fíjate que sea la real porque con ello se hace el trade, si no habrá problemas a la hora que te quieran comprar tus ítems.';

    if (confirm(mensaje)) {
      this.isSaving = true;
      this.authService.updateTradeUrl(this.newTradeUrl).subscribe({
        next: (res) => {
          alert('✅ URL actualizada correctamente');
          this.user.tradeOfferUrl = this.newTradeUrl;
          this.isSaving = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert('❌ Error al actualizar la URL');
          this.isSaving = false;
        },
      });
    }
  }

  saveApiKey() {
    if (!this.newApiKey) return;

    if (confirm('¿Seguro quieres guardar esta API Key? Se usará para automatizar tus intercambios.')) {
      this.isSavingKey = true;
      this.authService.updateApiKey(this.newApiKey).subscribe({
        next: (res) => {
          this.isSavingKey = false;
          this.newApiKey = '';
          alert('✅ API Key guardada correctamente');
          this.cdr.detectChanges(); // Forzar actualización de vista
        },
        error: (err) => {
          console.error(err);
          this.isSavingKey = false;
          alert('❌ Error al guardar API Key');
          this.cdr.detectChanges();
        }
      });
    }
  }

  onFileSelected(event: any, side: 'F' | 'R') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (side === 'F') this.fotoDniF = base64;
        else this.fotoDniR = base64;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfileDetails() {
    if (!this.numeroDocumento || !this.celular || !this.fotoDniF || !this.fotoDniR) {
      alert('⚠️ Por favor completa todos los campos y sube ambas fotos de tu DNI.');
      return;
    }

    if (this.numeroDocumento.length > 10) {
      alert('⚠️ El número de documento no puede exceder los 10 caracteres.');
      return;
    }

    if (this.celular.length > 16) {
      alert('⚠️ El celular no puede exceder los 16 caracteres.');
      return;
    }

    this.isSavingProfile = true;
    const dto = {
      NumeroDocumento: this.numeroDocumento,
      Celular: this.celular,
      FotoDniF: this.fotoDniF,
      FotoDniR: this.fotoDniR
    };

    this.authService.updateProfileDetails(dto).subscribe({
      next: (res) => {
        alert('✅ Datos enviados correctamente. Espera la verificación del admin.');
        this.isSavingProfile = false;
        // Opcional: recargar el user para ver cambios si el backend devolviera el objeto actualizado
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isSavingProfile = false;
        alert('❌ Error al guardar datos: ' + (err.error?.message || 'Error desconocido'));
        this.cdr.detectChanges();
      }
    });
  }
}


