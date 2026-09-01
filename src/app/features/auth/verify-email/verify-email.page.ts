import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="text-align:center;padding:48px;">
      <h2>Vérification email</h2>
      <a routerLink="/auth/login">Retour connexion</a>
    </div>
  `,
})
export class VerifyEmailPage {}
