import { Component, OnInit } from '@angular/core';
import { Auth } from '../../service/auth';


@Component({
  selector: 'app-login',
  standalone: true, // Si es un componente standalone
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

 
  constructor(private authService: Auth) {} 

  login() {
    this.authService.login();
  }
}
