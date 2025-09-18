import { Component, OnInit } from '@angular/core';
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
  loading = true;
  error: string | null = null;

  constructor(private authService: Auth) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
