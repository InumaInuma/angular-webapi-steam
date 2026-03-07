import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SupportTicket, CreateSupportTicketDto, UpdateSupportStatusDto } from '../interfaces/support-ticket.interface';

@Injectable({
    providedIn: 'root'
})
export class SupportService {
    private apiUrl = `${environment.apiUrl}/support`;

    constructor(private http: HttpClient) { }

    createTicket(ticket: CreateSupportTicketDto): Observable<{ success: boolean; ticketId: number; message: string }> {
        return this.http.post<{ success: boolean; ticketId: number; message: string }>(`${this.apiUrl}/create`, ticket);
    }

    getMyTickets(): Observable<SupportTicket[]> {
        return this.http.get<SupportTicket[]>(`${this.apiUrl}/my-tickets`);
    }

    getTicketDetails(id: number): Observable<SupportTicket> {
        return this.http.get<SupportTicket>(`${this.apiUrl}/${id}`);
    }

    // Admin endpoints
    getAllTickets(): Observable<SupportTicket[]> {
        return this.http.get<SupportTicket[]>(`${this.apiUrl}/admin/all`);
    }

    updateStatus(id: number, dto: UpdateSupportStatusDto): Observable<{ success: boolean; message: string }> {
        return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/admin/${id}/status`, dto);
    }
}
