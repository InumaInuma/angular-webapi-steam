import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupportService } from '../../services/support.service';
import { SupportTicket, CreateSupportTicketDto } from '../../interfaces/support-ticket.interface';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-support-center',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './support-center.component.html',
    styleUrls: ['./support-center.component.scss']
})
export class SupportCenter implements OnInit {
    tickets: SupportTicket[] = [];
    selectedTicket: SupportTicket | null = null;
    isLoading = true;
    showCreateModal = false;
    isSubmitting = false;
    createForm: FormGroup;

    constructor(
        private supportService: SupportService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.createForm = this.fb.group({
            subject: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            category: ['', Validators.required],
            priority: ['Medium', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadTickets();
    }

    async loadTickets() {
        this.isLoading = true;
        try {
            this.tickets = await firstValueFrom(this.supportService.getMyTickets());
        } catch (error) {
            console.error('Error loading tickets', error);
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    openCreateModal() {
        this.showCreateModal = true;
    }

    closeCreateModal() {
        this.showCreateModal = false;
        this.createForm.reset({ priority: 'Medium' });
    }

    async submitTicket() {
        if (this.createForm.invalid) return;

        this.isSubmitting = true;
        try {
            const dto: CreateSupportTicketDto = this.createForm.value;
            await firstValueFrom(this.supportService.createTicket(dto));

            // Refresh list and close modal
            await this.loadTickets();
            this.closeCreateModal();

            // Optional: Show toast notification here
            // alert('Ticket creado exitosamente');
        } catch (error) {
            console.error('Error creating ticket', error);
            alert('Error al crear el ticket. Inténtalo de nuevo.');
        } finally {
            this.isSubmitting = false;
            this.cdr.detectChanges();
        }
    }

    viewTicket(ticket: SupportTicket) {
        this.selectedTicket = ticket;
    }

    closeViewModal() {
        this.selectedTicket = null;
    }

    getStatusLabel(status: string): string {
        const labels: any = {
            'Pending': 'Pendiente',
            'InReview': 'En Revisión',
            'Resolved': 'Resuelto',
            'Rejected': 'Rechazado'
        };
        return labels[status] || status;
    }

    isInvalid(field: string): boolean {
        const control = this.createForm.get(field);
        return control ? (control.invalid && (control.dirty || control.touched)) : false;
    }
}
