// Service Worker para Firebase Cloud Messaging

// Scripts necesarios v9 compat (ya que Angular usa web workers, importScripts es más fácil aquí para el SW background)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// 🚨 REEMPLAZA ESTO CON LOS DATOS DE TU CONSOLA FIREBASE (Sección: Configuración de la SDK Web)
const firebaseConfig = {
    apiKey: "AIzaSyBnAsTBEXou0aSjFTrrlRrFJjReBeDNiYo",
    authDomain: "steam-abde8.firebaseapp.com",
    projectId: "steam-abde8",
    storageBucket: "steam-abde8.firebasestorage.app",
    messagingSenderId: "37692643229",
    appId: "1:37692643229:web:bce92e7b310735d1b14174"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Recibió mensaje de fondo ', payload);
    // Personaliza la notificación aquí
    const notificationTitle = payload.notification?.title || 'Notificación P2P Market';
    const notificationOptions = {
        body: payload.notification?.body,
        icon: '/public/cabeseradota.png', // O el logo de la página
        data: payload.data,
        vibrate: [200, 100, 200, 100, 200], // Patrón de vibración prolongado
        requireInteraction: true // Evita que la notificación desaparezca de la pantalla hasta que el usuario le haga clic
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
