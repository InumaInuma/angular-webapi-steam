import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Auth } from '../../service/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user: any = null;

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe((profile) => {
      this.user = profile;
      this.cdr.detectChanges();
    });
  }
}
