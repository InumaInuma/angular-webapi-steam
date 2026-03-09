import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FcmService {
    private http = inject(HttpClient);

    // 🚨 REEMPLAZA ESTO CON LOS DATOS DE TU CONSOLA FIREBASE (Sección: Configuración de la SDK Web)
    private firebaseConfig = {
        apiKey: "AIzaSyBnAsTBEXou0aSjFTrrlRrFJjReBeDNiYo",
        authDomain: "steam-abde8.firebaseapp.com",
        projectId: "steam-abde8",
        storageBucket: "steam-abde8.firebasestorage.app",
        messagingSenderId: "37692643229",
        appId: "1:37692643229:web:bce92e7b310735d1b14174"
    };

    private messaging = getMessaging(initializeApp(this.firebaseConfig));
    currentMessage = new BehaviorSubject(null);

    constructor() { }

    requestPermission() {
        console.log('Solicitando permiso para notificaciones...');
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('Permiso concedido.');
                // 🚨 REEMPLAZA LA VAPID KEY CON LA QUE TE GENERE FIREBASE (Pestaña "Cloud Messaging")
                // Opcional pero recomendado:
                getToken(this.messaging, { vapidKey: 'BOjYw5TlSAWgjA42TCr_rclL_39CS-kH4OqdWKypNWeMyYTLbzfr3TNHPxJNCnZ6O5Ocb3tR1QM1ZXy6abjS7NU' })
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
        onMessage(this.messaging, (payload: any) => {
            console.log("Nuevo Mensaje de FCM (Primer Plano): ", payload);
            this.currentMessage.next(payload);
        });
    }

    private sendTokenToBackend(token: string) {
        // Si tienes el token JWT en tu interceptor, se enviará automáticamente.
        this.http.post(`${environment.apiUrl}/Account/fcm-token`, { token }).subscribe({
            next: () => console.log('Token FCM guardado en la base de datos de SiglaStore.'),
            error: (err) => console.error('Error enviando token al backend:', err)
        });
    }
}
