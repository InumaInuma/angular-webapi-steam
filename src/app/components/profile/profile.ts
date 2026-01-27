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


  constructor(private authService: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe((profile) => {
      this.user = profile;
      this.newTradeUrl = profile.tradeOfferUrl || ''; // Cargamos la URL actual si existe
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
}


