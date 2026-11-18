import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });
  });

  it('redirige vers /login si non connecté', () => {
    const result = run() as UrlTree;
    expect(result.toString()).toBe('/login?returnUrl=%2Fadmin');
  });

  it('laisse passer un admin', () => {
    const auth = TestBed.inject(AuthService);
    (auth as unknown as { save: (v: unknown) => void }).save({
      token: 'x',
      user: { username: 'admin', roles: ['ROLE_ADMIN'] },
    });
    expect(run()).toBe(true);
  });
});
