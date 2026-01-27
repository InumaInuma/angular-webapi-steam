import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiBaseUrl = 'http://localhost:5005'; // Tu URL base de la API
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

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
        }
        this.isLoggedInSubject.next(true);
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
    // Usa el nuevo método para verificar el estado
    return this.getUserInfo().pipe(
      tap((userInfo) => this.isLoggedInSubject.next(!!userInfo.steamId)),
      catchError(() => {
        this.isLoggedInSubject.next(false);
        return [false];
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
            localStorage.setItem('userId', res.userId.toString()); // 👈 guarda también el userId
            this.isLoggedInSubject.next(true);
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
    this.router.navigate(['/login']); // 👈 ya no redirige con window.location.href
  }
}
