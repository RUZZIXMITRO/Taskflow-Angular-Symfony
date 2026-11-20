import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AdminStats {
  total: number;
  completed: number;
  overdue: number;
  byPriority: { low: number; medium: number; high: number };
}

/**
 * Page protégée par authGuard côté Angular.
 * L'endpoint /api/admin/stats est AUSSI protégé côté Symfony (401 sans jeton, 403 sans ROLE_ADMIN).
 */
@Component({
  selector: 'app-admin',
  template: `
    <h2>Administration</h2>
    @if (loading()) {
      <p class="state" role="status"><span class="spinner"></span> Chargement…</p>
    } @else if (error()) {
      <div class="alert alert--error" role="alert">
        <span>{{ error() }}</span>
        <button type="button" class="btn btn--sm" (click)="load()">Réessayer</button>
      </div>
    } @else if (stats(); as s) {
      <div class="stats">
        <div class="stat"><span>{{ s.total }}</span>tâches</div>
        <div class="stat"><span>{{ s.completed }}</span>terminées</div>
        <div class="stat"><span>{{ s.overdue }}</span>en retard</div>
        <div class="stat"><span>{{ s.byPriority.high }}</span>priorité haute</div>
      </div>
    }
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
    .stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
            padding: 1.25rem; color: var(--text-muted); }
    .stat span { display: block; font-size: 2rem; font-weight: 700; color: var(--primary); }
  `,
})
export class Admin implements OnInit {
  private http = inject(HttpClient);
  stats = signal<AdminStats | null>(null);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.http
      .get<AdminStats>(`${environment.apiUrl}/admin/stats`)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (s) => this.stats.set(s),
        error: (err: HttpErrorResponse) =>
          this.error.set(
            err.status === 401 ? 'Session expirée : reconnectez-vous.'
            : err.status === 403 ? 'Accès refusé par le serveur.'
            : 'Échec du chargement des statistiques.',
          ),
      });
  }
}
