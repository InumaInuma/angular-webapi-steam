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
    return this.http
      .get<any>(`${this.apiBaseUrl}/Account/user-info`, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener la información del usuario:', error);
          // Retornar un observable con un valor predeterminado en caso de error
          return of({ steamId: null });
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

  /**
   * Inicia el flujo de autenticación de Steam.
   * Redirige el navegador a tu endpoint de login de la API.
   * Tu API manejará la redirección a la página de login de Steam.
   * Inicia el flujo de autenticación de Steam.
   * Redirige el navegador a tu endpoint de login de la API.
   */

  /*  login() {
    window.location.href = `${this.apiBaseUrl}/Account/login`;
  } */
  login() {
    const width = 700;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 8;

    const popup = window.open(
      `${this.apiBaseUrl}/Account/login`,
      'SteamLogin',
      `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars=yes,status=1`
    );

    // Listener para mensajes que envíe el popup (ver paso 2)
    window.addEventListener('message', (event) => {
      if (event.data === 'steam-login-success') {
        // 🔥 Ya se logeó en Steam
        popup?.close();
        this.checkLoginStatus().subscribe((loggedIn) => {
          if (loggedIn) {
            // 👈 aquí rediriges a tu dashboard
            window.location.href = '/dashboard';
          }
        });
      }
    });
  }

  /*  loginWithCredentials(email: string, password: string) {
    return this.http.post<any>(`${this.apiBaseUrl}/Account/login-credentials`, {
      email,
      password,
    });
  } */
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
