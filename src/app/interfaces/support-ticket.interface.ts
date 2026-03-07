export interface SupportTicket {
    ticketId: number;
    userId: number;
    subject: string;
    description: string;
    status: 'Pending' | 'InReview' | 'Resolved' | 'Rejected';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    category: string;
    evidenceUrl?: string;
    evidenceBase64?: string;
    adminNotes?: string;
    createdAtUtc: string;
    updatedAtUtc?: string;

    // Admin View Extras
    userEmail?: string;
    userName?: string;
}

export interface CreateSupportTicketDto {
    subject: string;
    description: string;
    category: string;
    priority: string;
    evidenceUrl?: string;
    evidenceBase64?: string;
}

export interface UpdateSupportStatusDto {
    status: string;
    adminNotes?: string;
}
