import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService } from '../../services/support.service';
import { SupportTicket, UpdateSupportStatusDto } from '../../interfaces/support-ticket.interface';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-admin-support',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-support.component.html',
    styleUrls: ['./admin-support.component.scss']
})
export class AdminSupport implements OnInit {
    tickets: SupportTicket[] = [];
    filteredTickets: SupportTicket[] = [];
    isLoading = true;
    filterStatus = 'All';

    selectedTicket: SupportTicket | null = null;
    newStatus: 'Pending' | 'InReview' | 'Resolved' | 'Rejected' = 'Pending';
    adminNotes = '';
    isUpdating = false;

    constructor(
        private supportService: SupportService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadTickets();
    }

    async loadTickets() {
        this.isLoading = true;
        try {
            this.tickets = await firstValueFrom(this.supportService.getAllTickets());
            this.applyFilter();
        } catch (error) {
            console.error('Error loading tickets', error);
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    setFilter(status: string) {
        this.filterStatus = status;
        this.applyFilter();
    }

    applyFilter() {
        if (this.filterStatus === 'All') {
            this.filteredTickets = this.tickets;
        } else {
            this.filteredTickets = this.tickets.filter(t => t.status === this.filterStatus);
        }
        // Sort by date desc
        this.filteredTickets.sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime());
    }

    openTicketModal(ticket: SupportTicket) {
        this.selectedTicket = ticket;
        // Ensure the status from backend matches the type, or default to Pending if mismatch
        this.newStatus = (ticket.status as 'Pending' | 'InReview' | 'Resolved' | 'Rejected') || 'Pending';
        this.adminNotes = ticket.adminNotes || '';
    }

    closeModal() {
        this.selectedTicket = null;
    }

    async updateStatus() {
        if (!this.selectedTicket) return;

        this.isUpdating = true;
        try {
            const dto: UpdateSupportStatusDto = {
                status: this.newStatus,
                adminNotes: this.adminNotes
            };

            await firstValueFrom(this.supportService.updateStatus(this.selectedTicket.ticketId, dto));

            // Update local state
            this.selectedTicket.status = this.newStatus;
            this.selectedTicket.adminNotes = this.adminNotes;

            // Refresh list
            await this.loadTickets();
            this.closeModal();

        } catch (error) {
            console.error('Error updating ticket', error);
            alert('Error al actualizar el ticket.');
        } finally {
            this.isUpdating = false;
            this.cdr.detectChanges();
        }
    }
}
