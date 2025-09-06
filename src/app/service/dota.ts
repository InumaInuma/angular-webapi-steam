import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

export interface DotaItemDto {
  assetId: string;
  name: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class Dota {
  private apiUrl = 'http://localhost:5005/Dota'; // URL de tu DotaController

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de ítems de Dota del usuario autenticado.
   *
   * @returns Observable<any[]> - Emite una lista de ítems o un array vacío en caso de error.
   */

  getUserDotaItems(): Observable<DotaItemDto[]> {
    return this.http
      .get<DotaItemDto[]>(`${this.apiUrl}/items-schema`, {
        withCredentials: true,
      })
      .pipe(
        tap((data) =>
          console.log('Datos de ítems recibidos desde backend:', data)
        ),
        catchError((error) => {
          console.error('Error al obtener los ítems de Dota:', error);
          return of([]); // Devuelve array vacío para que no truene
        })
      );
  }
}
