import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  template: `
    <a class="skip-link" href="#main">Aller au contenu</a>
    <app-header />
    <main id="main" class="container">
      <router-outlet />
    </main>
  `,
})
export class App {}
