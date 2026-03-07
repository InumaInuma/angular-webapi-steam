import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

export interface ItemGem {
  name: string;
  color: string;
  type: string;
  iconUrl?: string; // 👈 New property
}

export interface ItemStyle {
  name: string;
  isLocked: boolean;
}

export interface DotaItemDto {
  assetId: string;
  name: string;
  imageUrl: string;
  isTradable: boolean;
  rarity?: string;
  type?: string;
  hero?: string;
  rarityColor?: string;
  gems?: ItemGem[]; // 👈 Add gems
  styles?: ItemStyle[]; // 👈 Fixed missingStyles
  description?: string; // 👈 Add description (Lore)
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
  sellerRating?: number; // 👈 New
  totalRatings?: number; // 👈 New
  rarity?: string;
  type?: string;
  hero?: string;
  rarityColor?: string;
  gems?: ItemGem[]; // 👈 Fixed type for ngFor
  styles?: ItemStyle[]; // 👈 Add styles
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

import { environment } from '../../environments/environment';

@Injectable({

  providedIn: 'root',
})
export class Dota {
  private apiUrl = `${environment.apiUrl}/Dota`; // URL de tu DotaController
  private apiBaseUrl = `${environment.apiUrl}/Account`;
  constructor(private http: HttpClient) { }

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
    rarity?: string;
    type?: string;
    hero?: string;
    gems?: any[];
    styles?: any[];
  }) {
    return this.http.post<any>(`${this.apiUrl}/sell`, payload);
  }

  // 👇 Nuevo método para calificar
  rateSeller(payload: { orderId: number; rating: number; comment: string }) {
    return this.http.post<any>(`${environment.apiUrl}/Rating`, payload);
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

  cancelSale(orderId: number) {
    return this.http.post<any>(`${this.apiBaseUrl}/sales/cancel/${orderId}`, {}, {
      withCredentials: true
    });
  }
}



