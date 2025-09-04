import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

export interface DotaItemDto {
  assetId: string;
  name: string;
  imageUrl: string;
}


@Injectable({
  providedIn: 'root'
})


export class Dota {
  private apiUrl = 'http://localhost:5005/Dota'; // URL de tu DotaController
  
  constructor(private http: HttpClient) { }

   /**
   * Obtiene la lista de ítems de Dota del usuario autenticado.
   *
   * @returns Observable<any[]> - Emite una lista de ítems o un array vacío en caso de error.
   */
  /* getUserDotaItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Error al obtener los ítems de Dota:', error);
        return of([]); // Devuelve un array vacío para que la aplicación no se rompa
      })
    );
  } */

     /* getUserDotaItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`, { withCredentials: true }).pipe(
      tap(data => console.log('Datos de ítems recibidos:', data)), // 🚨 Agrega esta línea
      catchError(error => {
        console.error('Error al obtener los ítems de Dota:', error);
        return of([]);
      })
    );
  } */

    getUserDotaItems(): Observable<DotaItemDto[]> {
    return this.http.get<DotaItemDto[]>(`${this.apiUrl}/items-schema`, { withCredentials: true }).pipe(
      tap(data => console.log('Datos de ítems recibidos desde backend:', data)),
      catchError(error => {
        console.error('Error al obtener los ítems de Dota:', error);
        return of([]); // Devuelve array vacío para que no truene
      })
    );
  }

  /**
   * Obtiene el esquema de ítems de Dota para mapear defindex a nombres.
   *
   * @returns Observable<any> - Emite el mapa de esquemas o un objeto vacío en caso de error.
   */
 /*  getDotaItemSchema(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/items-schema`,{ withCredentials: true }).pipe(
      tap(data => console.log('Datos de ítems recibidos:', data)), // 🚨 Agrega esta línea
      catchError(error => {
        console.error('Error al obtener el esquema de ítems:', error);
        return of({});
      })
    );
  } */
}
