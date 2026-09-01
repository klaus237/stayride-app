import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="text-align:center;padding:48px;">
      <h1>404</h1>
      <p>Page introuvable</p>
      <a routerLink="/">Retour à l'accueil</a>
    </div>
  `,
})
export class NotFoundPage {}
