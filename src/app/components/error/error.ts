import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true, // 🚨 Falta el standalone: true en tu ejemplo
  imports: [RouterLink],
  templateUrl: './error.html',
  styleUrl: './error.scss'
})
export class Error {

}
