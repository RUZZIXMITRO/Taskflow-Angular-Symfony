import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected auth = inject(AuthService);
  private router = inject(Router);

  // Interpolation + event binding (exercice « Templates »)
  title = signal('TaskFlow');

  rename(): void {
    this.title.update((t) => (t === 'TaskFlow' ? 'Mes tâches' : 'TaskFlow'));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/tasks');
  }
}
