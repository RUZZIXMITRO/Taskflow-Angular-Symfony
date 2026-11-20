import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="panel narrow">
      <h2>Connexion</h2>
      <p class="muted">Comptes de démo : <code>admin / admin123</code> (admin) · <code>user / user123</code></p>

      @if (error()) {
        <p class="alert alert--error" role="alert">{{ error() }}</p>
      }

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="username">Identifiant</label>
          <input id="username" formControlName="username" autocomplete="username" />
        </div>
        <div class="field">
          <label for="password">Mot de passe</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password" />
        </div>
        <button type="submit" class="btn btn--primary" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
    </div>
  `,
  styles: `form { display: flex; flex-direction: column; gap: 1rem; } button { align-self: flex-start; }`,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  /** ?returnUrl=… (query param lié par withComponentInputBinding) */
  returnUrl = input<string>('/tasks');

  loading = signal(false);
  error = signal('');

  form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  submit(): void {
    if (this.form.invalid) return;
    const { username, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set('');
    this.auth
      .login(username, password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl() || '/tasks'),
        error: (err: HttpErrorResponse) =>
          this.error.set(err.status === 401 ? 'Identifiants invalides.' : 'Connexion impossible.'),
      });
  }
}
