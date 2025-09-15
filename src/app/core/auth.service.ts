import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserInfo {
  fullName: string;
  email: string;
  password: string;
  role: number; // 1 = Aluno, 2 = Professor
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  role: number; // 1 = Aluno, 2 = Professor
  fullName: string;
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'Aluno' | 'Professor';
  fullName: string;
}

// Função para converter role numérico para string
function convertRoleToString(role: number): 'Aluno' | 'Professor' {
  switch (role) {
    case 1:
      return 'Aluno';
    case 2:
      return 'Professor';
    default:
      return 'Aluno';
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private readonly TOKEN_KEY = 'tuking_token';
  private readonly USER_KEY = 'tuking_user';

  // Signals para reatividade
  public isAuthenticated = signal<boolean>(false);
  public currentUser = signal<User | null>(null);

  // BehaviorSubject para compatibilidade com código existente
  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.isAuthenticated.set(true);
      this.currentUser.set(user);
      this.authStateSubject.next(true);
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          const user = {
            id: response.userId,
            email: response.email,
            role: convertRoleToString(response.role),
            fullName: response.fullName
          };
          this.setUser(user);
          this.isAuthenticated.set(true);
          this.currentUser.set(user);
          this.authStateSubject.next(true);
        })
      );
  }

  register(userInfo: RegisterUserInfo): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userInfo)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          const user = {
            id: response.userId,
            email: response.email,
            role: convertRoleToString(response.role),
            fullName: response.fullName
          };
          this.setUser(user);
          this.isAuthenticated.set(true);
          this.currentUser.set(user);
          this.authStateSubject.next(true);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuth();
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.authStateSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  hasRole(role: 'Aluno' | 'Professor'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}
