import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CreateTopUpRequestDto {
  amount: number;
  currencyCode: string;
  paymentMethod: string;
  evidenceUrl?: string | null;
  evidenceBase64?: string | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Walletservice {
  private api = 'http://localhost:5005/wallet';

  constructor(private http: HttpClient) {}

  getBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.api}/balance`);
  }

  getPendingToday() {
    return this.http.get<any[]>(`${this.api}/pending-today`);
  }

  approve(requestId: number) {
    return this.http.post(`${this.api}/${requestId}/approve`, {});
  }

  reject(requestId: number, reason?: string) {
    return this.http.post(`${this.api}/${requestId}/reject`, {
      reason,
    });
  }

  // createTopUp(dto: {
  //   amount: number;
  //   currencyCode: string;
  //   paymentMethod: string;
  //   notes?: string;
  // }) {
  //   return this.http.post(`${this.api}`, dto);
  // }
  createTopUp(dto: CreateTopUpRequestDto) {
    return this.http.post<{
      success: boolean;
      requestId: number;
    }>(`${this.api}`, dto);
  }

  getMyRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/my`);
  }
}
