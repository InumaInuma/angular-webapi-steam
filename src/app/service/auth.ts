import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiBaseUrl = `${environment.apiUrl}`; // Tu URL base de la API
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  public isLoggedInValue(): boolean {
    return this.isLoggedInSubject.value;
  }

  private balanceSubject = new BehaviorSubject<number>(0);
  public balance$ = this.balanceSubject.asObservable();
  private steamIdSubject = new BehaviorSubject<string | null>(localStorage.getItem('steamId'));
  public steamId$ = this.steamIdSubject.asObservable();

  // 🆕 Nuevo Subject para info completa del usuario (email, rol, etc)
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Obtiene la información del usuario logueado desde la API.
   * Si la llamada falla, devuelve un objeto con un SteamId nulo.
   *
   * @returns Observable<any> - Emite la información del usuario o un error.
   */
  getUserInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/Account/user-info`).pipe(
      tap((user) => {
        if (user?.userId) {
          localStorage.setItem('userId', user.userId);
        }
        if (user?.steamId) {
          localStorage.setItem('steamId', user.steamId);
          this.steamIdSubject.next(user.steamId);
        } else {
          this.steamIdSubject.next(null);
        }
        this.isLoggedInSubject.next(true);
        this.userSubject.next(user); // 👈 Emitir datos del usuario
      }),
      catchError((error) => {
        console.error('Error al obtener la información del usuario:', error);
        this.isLoggedInSubject.next(false);
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
        this.isLoggedInSubject.next(false);
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
      tap((res) => console.log('📌 Perfil cargado:', res)),
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
              this.steamIdSubject.next(res.steamId);
            }
            this.isLoggedInSubject.next(true);
            // 🚨 Como loginWithCredentials no devuelve el email en 'res' a veces, 
            // idealmente el backend debería devolverlo. Por ahora, usamos lo que tenemos.
            this.userSubject.next({ email: email, ...res });
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
    this.isLoggedInSubject.next(false);
    this.balanceSubject.next(0); // 👈 Balance a 0 al cerrar sesión
    this.router.navigate(['/login']);
  }

  setBalance(amount: number) {
    this.balanceSubject.next(amount);
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
