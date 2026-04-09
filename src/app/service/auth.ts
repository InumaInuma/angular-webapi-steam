import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiBaseUrl = `${environment.apiUrl}`; // Tu URL base de la API
  // Signals para estado reactivo (Angular v20) ⚡
  public isLoggedIn = signal<boolean>(false);
  public balance = signal<number>(0);
  public steamId = signal<string | null>(localStorage.getItem('steamId'));
  public isTradeVerified = signal<boolean>(false);
  public isTradeBanned = signal<boolean>(false); // 👈 Re-add
  public daysHeld = signal<number>(0);
  public tradeVerifiedAtUtc = signal<string | null>(null); // 👈 Nuevo: Fecha de comprobación
  public showTradeSuccessModal = signal<boolean>(false); // 👈 Nuevo: Flag para modal de éxito
  public showTradeMismatchModal = signal<boolean>(false); // 🚨 Nuevo: Flag para error de identidad
  public tradeMismatchMessage = signal<string>(''); // 🚨 Nuevo: Mensaje detallado
  public user = signal<any>(null);

  private isSuccessModalShownThisSession = false; // 👈 Evitar molestia al usuario

  // Observables para compatibilidad con RxJS (toObservable)
  public isLoggedIn$ = toObservable(this.isLoggedIn);
  public balance$ = toObservable(this.balance);
  public steamId$ = toObservable(this.steamId);
  public isTradeVerified$ = toObservable(this.isTradeVerified);
  public user$ = toObservable(this.user);

  constructor(private http: HttpClient, private router: Router) {
    this.setupExtensionListener();
  }

  // 🛡️ ESCUCHAR RESULTADOS DE LA EXTENSIÓN GLOBALMENTE
  private setupExtensionListener() {
    window.addEventListener('message', (event) => {
      if (event.data?.type !== 'P2P_MARKET_ESCROW_RESULT') return;

      console.log('🛡️ [Auth] Resultado de extensión recibido:', event.data);

      if (event.data.success) {
        const isVerified = !event.data.hasEscrow && !event.data.isTradeBanned;

        this.isTradeVerified.set(isVerified);
        this.isTradeBanned.set(event.data.isTradeBanned || false);
        this.daysHeld.set(event.data.daysHeld || 0);
        this.tradeVerifiedAtUtc.set(new Date().toISOString());

        // 🔄 SINCRONIZAR CON LA BASE DE DATOS (Expert Mode)
        if (isVerified) {
          this.verifyTrade().subscribe();
        } else {
          // Si falló por desajuste o escrow, revocar en la DB
          this.revokeTrade().subscribe();
          this.showTradeSuccessModal.set(false); // 👈 Limpiar modal previo si ya no es válido
        }

        // 🎉 SI TODO ESTÁ PERFECTO, MOSTRAR MODAL DE ÉXITO (Solo una vez por sesión de carga app)
        if (isVerified && !this.isSuccessModalShownThisSession) {
          this.showTradeSuccessModal.set(true);
          this.isSuccessModalShownThisSession = true;
          console.log('🎉 [Auth] Mostrando modal de éxito por primera vez en la sesión.');
        } else if (!isVerified) {
          this.showTradeSuccessModal.set(false);
        }
      } else if (event.data.type === 'P2P_MARKET_ESCROW_RESULT' && !event.data.success) {
        // 🚨 Manejo de Error Crítico (Ej: Cuentas no coinciden o no logueado en Steam)
        console.error('🚨 [Auth] Error de validación proactive:', event.data.message);

        // Si hay error (éxito=false), nos aseguramos de que IsTradeVerified sea 0 y revocamos en Backend
        this.isTradeVerified.set(false);
        this.showTradeSuccessModal.set(false); // 👈 Limpiar modal de éxito anterior de inmediato
        this.revokeTrade().subscribe();

        // 🛡️ Proyectar el mensaje de error en el Modal de Seguridad
        this.tradeMismatchMessage.set(event.data.message);
        this.showTradeMismatchModal.set(true);
      }
    });

    // Disparar check inicial si ya hay sesión
    if (localStorage.getItem('jwt')) {
      setTimeout(() => this.triggerExtensionCheck(), 2000);
    }
  }

  // 🛠️ MÉTODOS DE SINCRONIZACIÓN CON BACKEND
  private verifyTrade(): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/Account/verify-trade`, {}, { withCredentials: true });
  }

  private revokeTrade(): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/Account/revoke-trade`, {}, { withCredentials: true });
  }

  // 🔍 SOLICITAR VERIFICACIÓN A LA EXTENSIÓN
  public triggerExtensionCheck() {
    const jwtToken = localStorage.getItem('jwt');
    const steamId = this.steamId();

    if (!jwtToken) return;

    // 🧹 Limpiar estados anteriores antes de una nueva comprobación
    this.showTradeSuccessModal.set(false);
    this.showTradeMismatchModal.set(false);

    console.log('🔍 [Auth] Solicitando verificación proactiva a la extensión para SteamID:', steamId);
    window.postMessage({
      type: 'P2P_MARKET_CHECK_ESCROW',
      jwtToken,
      expectedSteamId: steamId
    }, '*');
  }

  /**
   * Obtiene la información del usuario logueado desde la API.
   */
  getUserInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/Account/user-info`).pipe(
      tap((user) => {
        if (user?.userId) {
          localStorage.setItem('userId', user.userId);
        }
        if (user?.steamId) {
          localStorage.setItem('steamId', user.steamId);
          this.steamId.set(user.steamId);
        } else {
          this.steamId.set(null);
        }
        if (user?.isTradeVerified !== undefined) {
          this.isTradeVerified.set(user.isTradeVerified);
          this.tradeVerifiedAtUtc.set(user.tradeVerifiedAtUtc);
        }
        this.isLoggedIn.set(true);
        this.user.set(user);

        // Al obtener info, refrescamos con la extensión para estar seguros
        this.triggerExtensionCheck();
      }),
      catchError((error) => {
        console.error('Error al obtener la información del usuario:', error);
        this.isLoggedIn.set(false);
        return of(null);
      })
    );
  }

  /**
   * Verifica el estado del login haciendo una petición al endpoint protegido.
   * La respuesta del servidor determina si el usuario está autenticado.
   *
   * @returns Observable<boolean> - Emite 'true' si el usuario está logeado, 'false' en caso contrario.
   */
  checkLoginStatus(): Observable<boolean> {
    return this.getUserInfo().pipe(
      map((userInfo) => !!userInfo?.userId), // 👈 Cambiado: Cualquier usuario con ID está logueado
      catchError(() => {
        this.isLoggedIn.set(false);
        return of(false);
      })
    );
  }

  loginWithSteam(): void {
    const userId = localStorage.getItem('userId');
    window.open(
      `${this.apiBaseUrl}/Account/login?userId=${userId}`,
      'SteamLogin',
      'width=700,height=700,top=100,left=200,resizable,scrollbars=yes,status=1'
    );
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/Account/profile`).pipe(
      tap((res) => {
        console.log('📌 Perfil cargado:', res);
        if (res?.isTradeVerified !== undefined) {
          this.isTradeVerified.set(res.isTradeVerified);
          this.tradeVerifiedAtUtc.set(res.tradeVerifiedAtUtc);
        }
      }),
      catchError((error) => {
        console.error('❌ Error al cargar perfil:', error);
        return of(null);
      })
    );
  }

  updateTradeUrl(url: string): Observable<any> {
    // Enviamos la URL en un objeto para que el body sea fácil de leer en .NET
    return this.http.put(
      `${this.apiBaseUrl}/Account/trade-offer-url`,
      { tradeOfferUrl: url },
      { withCredentials: true }
    );
  }

  updateApiKey(apiKey: string): Observable<any> {
    return this.http.put(
      `${this.apiBaseUrl}/Account/steam-api-key`,
      { apiKey: apiKey },
      { withCredentials: true }
    );
  }


  loginWithCredentials(email: string, password: string) {
    return this.http
      .post<any>(`${this.apiBaseUrl}/Account/login-credentials`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          if (res.success) {
            localStorage.setItem('jwt', res.token);
            localStorage.setItem('roles', JSON.stringify(res.roles));
            localStorage.setItem('userId', res.userId.toString());
            if (res.steamId) {
              localStorage.setItem('steamId', res.steamId);
              this.steamId.set(res.steamId);
            }
            this.isLoggedIn.set(true);
            this.isSuccessModalShownThisSession = false; // 👈 Resetear para forzar nueva verificación
            // 🚨 Importante: Cargar info de usuario tras login para activar el check de la extensión
            this.getUserInfo().subscribe();

            // 🚨 Como loginWithCredentials no devuelve el email en 'res' a veces, 
            // idealmente el backend debería devolverlo. Por ahora, usamos lo que tenemos.
            this.user.set({ email: email, ...res });
            // 🔹 Redirigir según rol
            if (res.roles.includes('Admin')) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/pagina-principal']);
            }
          }
        })
      );
  }

  register(
    displayName: string,
    email: string,
    password: string
  ): Observable<any> {
    const payload = {
      DisplayName: displayName,
      Email: email,
      Password: password,
    };
    return this.http
      .post<any>(`${this.apiBaseUrl}/Account/register`, payload)
      .pipe(
        tap((res) => console.log('✅ Usuario registrado:', res)),
        catchError((error) => {
          console.error('❌ Error al registrar usuario:', error);
          return of(null);
        })
      );
  }

  // ⚡ Simple placeholder (tú deberías aplicar hashing real en backend, no en frontend)
  private encodePassword(password: string): Uint8Array {
    return new TextEncoder().encode(password); // convierte a bytes
  }

  /**
   * Cierra la sesión del usuario.
   * Redirige el navegador a tu endpoint de logout de la API para limpiar la cookie de sesión.
   * // Simplificado para que el componente maneje la navegación
   */
  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('roles');
    localStorage.removeItem('userId');
    localStorage.removeItem('steamId');
    this.isLoggedIn.set(false);
    this.isSuccessModalShownThisSession = false; // 👈 Resetear estado de verificación
    this.balance.set(0); // 👈 Balance a 0 al cerrar sesión
    this.router.navigate(['/login']);
  }

  setBalance(amount: number) {
    this.balance.set(amount);
  }

  updateProfileDetails(data: any): Observable<any> {
    return this.http.put(
      `${this.apiBaseUrl}/Account/profile/details`,
      data,
      { withCredentials: true }
    );
  }

  // 🛡️ Admin Methods
  getPendingVerifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/Account/admin/verifications`, { withCredentials: true });
  }

  verifyUser(userId: number, authorize: boolean): Observable<any> {
    return this.http.put(
      `${this.apiBaseUrl}/Account/admin/verify/${userId}`,
      { authorize },
      { withCredentials: true }
    );
  }
}
