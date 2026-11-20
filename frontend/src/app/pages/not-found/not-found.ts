import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="panel narrow">
      <h2>404 — Page introuvable</h2>
      <p class="muted">Cette adresse ne correspond à aucune page.</p>
      <a routerLink="/tasks" class="btn btn--primary">Retour aux tâches</a>
    </div>
  `,
})
export class NotFound {}
