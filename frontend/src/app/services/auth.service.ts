import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  username: string;
  roles: string[];
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

const STORAGE_KEY = 'taskflow.auth';

/**
 * Gère la connexion et le jeton.
 * ⚠️ Côté client, ces informations ne servent qu'à l'expérience de navigation :
 * c'est Symfony qui vérifie le jeton et les rôles à chaque requête.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private session = signal<LoginResponse | null>(this.restore());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.user()?.roles.includes('ROLE_ADMIN') ?? false);

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/login`, { username, password })
      .pipe(tap((res) => this.save(res)));
  }

  logout(): void {
    this.save(null);
  }

  private save(value: LoginResponse | null): void {
    this.session.set(value);
    try {
      if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* stockage indisponible : la session reste en mémoire */
    }
  }

  private restore(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LoginResponse) : null;
    } catch {
      return null;
    }
  }
}
