import { Injectable, inject } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FcmService {
    private http = inject(HttpClient);

    private firebaseConfig = {
        apiKey: "AIzaSyBnAsTBEXou0aSjFTrrlRrFJjReBeDNiYo",
        authDomain: "steam-abde8.firebaseapp.com",
        projectId: "steam-abde8",
        storageBucket: "steam-abde8.firebasestorage.app",
        messagingSenderId: "37692643229",
        appId: "1:37692643229:web:bce92e7b310735d1b14174"
    };

    private app: FirebaseApp | null = null;
    private messaging: Messaging | null = null;
    currentMessage = new BehaviorSubject(null);

    /** Verifica si el navegador soporta FCM (requiere HTTPS + Service Worker) */
    private get isSupported(): boolean {
        return (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            'serviceWorker' in navigator &&
            location.protocol === 'https:'
        );
    }

    /** Inicialización lazy: solo crea Firebase cuando realmente se necesita */
    private initMessaging(): Messaging | null {
        if (this.messaging) return this.messaging;
        if (!this.isSupported) {
            console.warn('[FCM] Firebase Messaging no disponible (requiere HTTPS). Notificaciones desactivadas.');
            return null;
        }
        this.app = initializeApp(this.firebaseConfig);
        this.messaging = getMessaging(this.app);
        return this.messaging;
    }

    requestPermission() {
        const msg = this.initMessaging();
        if (!msg) return; // HTTP o navegador sin soporte → salir silenciosamente

        console.log('Solicitando permiso para notificaciones...');
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('Permiso concedido.');
                getToken(msg, { vapidKey: 'BOjYw5TlSAWgjA42TCr_rclL_39CS-kH4OqdWKypNWeMyYTLbzfr3TNHPxJNCnZ6O5Ocb3tR1QM1ZXy6abjS7NU' })
                    .then((currentToken) => {
                        if (currentToken) {
                            console.log('Token FCM recibido:', currentToken);
                            this.sendTokenToBackend(currentToken);
                        } else {
                            console.log('No registration token available. Request permission to generate one.');
                        }
                    }).catch((err) => {
                        console.log('An error occurred while retrieving token. ', err);
                    });
            } else {
                console.log('El usuario denegó el permiso.');
            }
        });
    }

    receiveMessage() {
        const msg = this.initMessaging();
        if (!msg) return;

        onMessage(msg, (payload: any) => {
            console.log("Nuevo Mensaje de FCM (Primer Plano): ", payload);
            this.currentMessage.next(payload);
        });
    }

    private sendTokenToBackend(token: string) {
        this.http.post(`${environment.apiUrl}/Account/fcm-token`, { token }).subscribe({
            next: () => console.log('Token FCM guardado en la base de datos.'),
            error: (err) => console.error('Error enviando token al backend:', err)
        });
    }
}
