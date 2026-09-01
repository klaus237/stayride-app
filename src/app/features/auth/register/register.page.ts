import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonIcon,
    IonSpinner,
  ],
  template: `
    <ion-content class="ion-padding">
      <div class="register-wrap">
        <div class="logo-section">
          <div class="logo">StayRide</div>
          <p class="logo-sub">Créer votre compte</p>
        </div>

        <div class="form-card">
          <div class="name-row">
            <div class="field-group">
              <label class="field-label">Prénom</label>
              <div class="input-wrap">
                <ion-icon name="person-outline" class="input-icon"></ion-icon>
                <input
                  type="text"
                  class="field-input"
                  placeholder="Jean"
                  [(ngModel)]="firstName"
                />
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Nom</label>
              <div class="input-wrap">
                <input
                  type="text"
                  class="field-input"
                  placeholder="Kamga"
                  [(ngModel)]="lastName"
                />
              </div>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Email</label>
            <div class="input-wrap">
              <ion-icon name="mail-outline" class="input-icon"></ion-icon>
              <input
                type="email"
                class="field-input"
                placeholder="votre@email.cm"
                [(ngModel)]="email"
              />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Téléphone (optionnel)</label>
            <div class="input-wrap">
              <ion-icon
                name="phone-portrait-outline"
                class="input-icon"
              ></ion-icon>
              <input
                type="tel"
                class="field-input"
                placeholder="+237 6XX XXX XXX"
                [(ngModel)]="phone"
              />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Mot de passe</label>
            <div class="input-wrap" [class.error]="passwordError()">
              <ion-icon
                name="lock-closed-outline"
                class="input-icon"
              ></ion-icon>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                class="field-input"
                placeholder="••••••••"
                [(ngModel)]="password"
                (input)="validatePassword()"
              />
              <button class="toggle-password" (click)="togglePassword()">
                <ion-icon
                  [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'"
                ></ion-icon>
              </button>
            </div>
            <div class="password-hint" [class.valid]="password.length >= 8">
              <span class="hint-dot"></span>
              Au moins 8 caractères
            </div>
            @if (passwordError()) {
              <span class="error-text">{{ passwordError() }}</span>
            }
          </div>

          <div class="field-group">
            <label class="field-label">Code de parrainage (optionnel)</label>
            <div class="input-wrap">
              <input
                type="text"
                class="field-input"
                placeholder="ex: JEA1234"
                [(ngModel)]="referralCode"
              />
            </div>
          </div>

          @if (globalError()) {
            <div class="global-error">
              <ion-icon name="alert-circle-outline"></ion-icon>
              {{ globalError() }}
            </div>
          }

          <button
            class="btn-primary"
            [disabled]="isLoading()"
            (click)="onRegister()"
          >
            @if (isLoading()) {
              <ion-spinner
                name="crescent"
                style="width:18px;height:18px;"
              ></ion-spinner>
            } @else {
              Créer mon compte
            }
          </button>

          <p class="login-link">
            Déjà un compte ?
            <a routerLink="/auth/login">Se connecter</a>
          </p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .register-wrap {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1rem 0;
      }
      .logo-section {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .logo {
        font-size: 28px;
        font-weight: 600;
        color: var(--ion-text-color);
      }
      .logo-sub {
        font-size: 12px;
        color: var(--ion-color-medium);
        margin: 4px 0 0;
      }
      .form-card {
        background: var(--ion-card-background, #fff);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
      }
      .name-row {
        display: flex;
        gap: 12px;
      }
      .name-row .field-group {
        flex: 1;
      }
      .field-group {
        margin-bottom: 14px;
      }
      .field-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--ion-color-medium-shade);
        display: block;
        margin-bottom: 6px;
      }
      .input-wrap {
        display: flex;
        align-items: center;
        background: var(--ion-color-light);
        border: 1.5px solid transparent;
        border-radius: 10px;
        padding: 0 12px;
      }
      .input-wrap:focus-within {
        border-color: #e85d24;
        background: var(--ion-background-color);
      }
      .input-icon {
        font-size: 18px;
        color: var(--ion-color-medium);
        margin-right: 10px;
        flex-shrink: 0;
      }
      .field-input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-size: 15px;
        color: var(--ion-text-color);
        padding: 12px 0;
      }
      .toggle-password {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        color: var(--ion-color-medium);
      }
      .global-error {
        background: var(--ion-color-danger-tint);
        color: var(--ion-color-danger-shade);
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 13px;
        margin-bottom: 16px;
      }
      .btn-primary {
        width: 100%;
        background: #e85d24;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 14px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 16px;
      }
      .btn-primary:disabled {
        opacity: 0.6;
      }
      .login-link {
        text-align: center;
        font-size: 14px;
        color: var(--ion-color-medium);
        margin: 0;
      }
      .login-link a {
        color: #e85d24;
        font-weight: 500;
        text-decoration: none;
      }
      .input-wrap.error {
        border-color: var(--ion-color-danger) !important;
      }
      .error-text {
        font-size: 12px;
        color: var(--ion-color-danger);
        margin-top: 4px;
        display: block;
      }
      .password-hint {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--ion-color-medium);
        margin-top: 5px;
      }
      .password-hint .hint-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--ion-color-medium);
        flex-shrink: 0;
        transition: background 0.2s;
      }
      .password-hint.valid {
        color: #4caf50;
      }
      .password-hint.valid .hint-dot {
        background: #4caf50;
      }
      .global-error {
        background: #ffebee;
        color: #c62828;
        border: 1px solid #ef9a9a;
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 13px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
    `,
  ],
})
export class RegisterPage {
  private readonly authService = inject(AuthService);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  referralCode = '';
  showPassword = signal(false);
  isLoading = signal(false);
  globalError = signal('');
  passwordError = signal('');

  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      phonePortraitOutline,
    });
  }

  validatePassword(): void {
    if (this.password.length > 0 && this.password.length < 8) {
      this.passwordError.set('Minimum 8 caractères requis');
    } else {
      this.passwordError.set('');
    }
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
  async onRegister(): Promise<void> {
    if (!this.firstName || !this.email || !this.password) {
      this.globalError.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.password.length < 8) {
      this.passwordError.set('Minimum 8 caractères requis');
      return;
    }

    this.isLoading.set(true);
    this.globalError.set('');

    try {
      await this.authService.register({
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        phone: this.phone || undefined,
        password: this.password,
        referral_code: this.referralCode || undefined,
        language: 'fr',
      });
    } catch (err: any) {
      const message =
        err?.error?.error?.message ||
        err?.error?.message ||
        "Erreur lors de l'inscription";
      this.globalError.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
