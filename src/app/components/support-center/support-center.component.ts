import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupportService } from '../../services/support.service';
import { SupportTicket, CreateSupportTicketDto } from '../../interfaces/support-ticket.interface';
import { firstValueFrom } from 'rxjs';

interface FaqItem {
    question: string;
    answer: string;
}

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

    // FAQ Data
    activeFaqIndex: number | null = null;
    faqItems: FaqItem[] = [
        {
            question: "Problemas de cuenta",
            answer: "Si olvidaste tu contraseña o perdiste acceso a tu cuenta de Steam, por favor asegúrate de verificar tu correo electrónico asociado. Nuestro equipo soporte no puede recuperar cuentas que pertenecen directamente a Steam."
        },
        {
            question: "¿Cómo empezar a operar?",
            answer: "Para empezar, asegúrate de tener tu inventario de Steam público. Luego inicia sesión en nuestra web, ve a la sección 'Mi Inventario' y publica los ítems que deseas vender, o explora la sección 'Mercado' para hacer compras."
        },
        {
            question: "PROBLEMAS CON RECARGAS",
            answer: "Las recargas pueden demorar hasta 15 minutos en reflejarse. Si el monto fue descontado de tu cuenta bancaria y no aparece en tu saldo (S/), por favor envíanos un ticket adjuntando el voucher de pago para validarlo."
        },
        {
            question: "PROBLEMAS CON ARTÍCULOS",
            answer: "Si has comprado un artículo y no te ha llegado la oferta de intercambio a Steam, asegúrate de que tu Trade URL sea correcta y que no tengas ningún bloqueo de intercambio (Trade Ban) ni Steam Guard desactivado."
        },
        {
            question: "Seguridad de la cuenta y protección contra estafas comerciales",
            answer: "Nosotros NUNCA te pediremos tu contraseña ni que nos envíes tus ítems 'para revisión'. Nuestro sistema de intercambio maneja transacciones exclusivamente a través del Robot del sistema. Cuidado con usuarios haciéndose pasar por Administradores."
        },
        {
            question: "Programa de afiliados",
            answer: "Actualmente estamos desarrollando nuestro programa de afiliados, ¡donde podrás recibir recompensas en saldo por invitar a tus amigos con tu código único! Mantente al tanto de nuestros próximos anuncios."
        }
    ];

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

    toggleFaq(index: number) {
        // Si clicamos el mismo que está abierto, lo cerramos. Si no, lo abrimos.
        this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
    }
}
