import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
    private apiBaseUrl = 'http://localhost:5005'; // Tu URL base de la API
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) { }


     /**
     * Obtiene la información del usuario logueado desde la API.
     * Si la llamada falla, devuelve un objeto con un SteamId nulo.
     *
     * @returns Observable<any> - Emite la información del usuario o un error.
     */
    getUserInfo(): Observable<any> {
        return this.http.get<any>(`${this.apiBaseUrl}/Account/user-info`, { withCredentials: true }).pipe(
            catchError(error => {
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
            tap(userInfo => this.isLoggedInSubject.next(!!userInfo.steamId)),
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
     */
   
// src/app/service/auth.ts

// ... (resto del código del servicio)

/**
 * Inicia el flujo de autenticación de Steam.
 * Redirige el navegador a tu endpoint de login de la API.
 */
// login() {
        /* window.location.href = `${this.apiBaseUrl}/Account/login`; */
         // En lugar de una redirección simple, usa una llamada fetch
  // para verificar si el endpoint de login de la API está accesible.
//  fetch(`${this.apiBaseUrl}/Account/login`, { method: 'GET' })
//    .then(response => {
      // Si la respuesta es exitosa (por ejemplo, 200 OK), redirige
      // al navegador para que inicie la autenticación de Steam.
    //  if (response.ok) {
//        window.location.href = `${this.apiBaseUrl}/Account/login`;
   //   } else {
        // Si la API responde con un error, redirige a tu página de error.
     //   window.location.href = 'http://localhost:4200/error';
   //   }
  //  })
  //  .catch(error => {
      // Si la llamada fetch falla completamente (ej. no se puede conectar),
      // redirige a la página de error.
   //   console.error('Error de conexión con la API de autenticación:', error);
    //  window.location.href = 'http://localhost:4200/error';
  //  });
////    }

login() {
    window.location.href = `${this.apiBaseUrl}/Account/login`;
}
    /**
     * Cierra la sesión del usuario.
     * Redirige el navegador a tu endpoint de logout de la API para limpiar la cookie de sesión.
     * // Simplificado para que el componente maneje la navegación
     */
    logout() {
        window.location.href = `${this.apiBaseUrl}/Account/logout`;
    }
  
}
