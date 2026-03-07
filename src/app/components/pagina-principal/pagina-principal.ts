import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Dota, MarketplaceItem } from '../../service/dota';

import { Auth } from '../../service/auth';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pagina-principal.html',
  styleUrl: './pagina-principal.scss',
})
export class PaginaPrincipal implements AfterViewInit {
  isLoggedIn$: Observable<boolean>;
  constructor(
    private cdr: ChangeDetectorRef,
    private authService: Auth
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit() {
  }

  @ViewChild('videoRef') video!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!this.video) return;

        if (entry.isIntersecting) {
          this.video.nativeElement.muted = true; // 👈 Forzar mute para políticas de navegador
          this.video.nativeElement.play().catch(err => console.warn('Error autoplay:', err));
          this.cdr.detectChanges(); // 👈 Solicitado por usuario
        } else {
          try {
            this.video.nativeElement.pause();
          } catch (e) { } // Ignorar errores de pausa si no estaba reproduciendo
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(this.video.nativeElement);
    this.cdr.detectChanges(); // 👈 Forzar chequeo inicial
  }
}
