import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

export interface DotaItemDto {
  assetId: string;
  name: string;
  imageUrl: string;
}

export interface MarketplaceItem {
  listingId: number;
  title: string;
  price: number;
  currencyCode: string;
  name: string;
  iconUrl: string;
  itemName: string;
  sellerUserId: number;
  seller: string;
}

export interface PendingSaleDto {
  orderId: number;
  listingId: number;
  price: number;
  currencyCode: string;
  createdAtUtc: string;
  itemName: string;
  iconUrl: string;
  buyerName: string;
  buyerTradeUrl: string;
  itemAssetId?: string;
  appId?: number;
  contextId?: number;
}

@Injectable({

  providedIn: 'root',
})
export class Dota {
  private apiUrl = 'http://localhost:5005/Dota'; // URL de tu DotaController
  private apiBaseUrl = 'http://localhost:5005/Account';
  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de ítems de Dota del usuario autenticado.
   *
   * @returns Observable<any[]> - Emite una lista de ítems o un array vacío en caso de error.
   */

  /*   getUserDotaItems(): Observable<DotaItemDto[]> {
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
  } */
  getUserDotaItems(): Observable<DotaItemDto[]> {
    return this.http.get<DotaItemDto[]>(`${this.apiUrl}/items-schema`).pipe(
      tap((data) => console.log('✅ Ítems de Dota recibidos:', data)),
      catchError((error) => {
        console.error('❌ Error al obtener ítems de Dota:', error);
        return of([]);
      })
    );
  }

  sellItem(payload: {
    assetId: string;
    title: string;
    iconUrl: string;
    price: number;
  }) {
    return this.http.post<any>(`${this.apiUrl}/sell`, payload);
  }

  getMarketplaceItems() {
    return this.http.get<MarketplaceItem[]>(`${this.apiBaseUrl}/marketplace`);
  }

  buyItem(listingId: number) {
    return this.http.post<any>(`${this.apiBaseUrl}/buy`, { listingId }, {
      withCredentials: true
    });
  }

  getPendingSales() {
    return this.http.get<PendingSaleDto[]>(`${this.apiBaseUrl}/sales/pending`, {
      withCredentials: true
    });
  }

  sendTradeOffer(orderId: number) {
    return this.http.post<any>(`${this.apiBaseUrl}/trade/send`, { orderId }, {
      withCredentials: true
    });
  }

  getOrderHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/history`, {
      withCredentials: true
    });
  }
}



