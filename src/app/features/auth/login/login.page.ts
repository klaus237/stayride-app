import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonText,
  IonIcon,
  IonNote,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSpinner,
    IonText,
    IonIcon,
    IonNote,
  ],
  template: `
    <ion-content class="ion-padding">
      <div class="login-wrap">
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo">StayRide</div>
          <p class="logo-sub">Appartements & Voitures au Cameroun</p>
        </div>

        <!-- Formulaire -->
        <div class="form-card">
          <h2 class="form-title">Connexion</h2>

          <!-- Email -->
          <div class="field-group">
            <label class="field-label">Email</label>
            <div class="input-wrap" [class.error]="emailError()">
              <ion-icon name="mail-outline" class="input-icon"></ion-icon>
              <input
                type="email"
                class="field-input"
                placeholder="votre@email.cm"
                [(ngModel)]="email"
                (input)="emailError.set('')"
                autocomplete="email"
              />
            </div>
            @if (emailError()) {
              <span class="error-text">{{ emailError() }}</span>
            }
          </div>

          <!-- Mot de passe -->
          <div class="field-group">
            <div class="label-row">
              <label class="field-label">Mot de passe</label>
              <a routerLink="/auth/forgot-password" class="forgot-link">
                Oublié ?
              </a>
            </div>
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
                (input)="passwordError.set('')"
                autocomplete="current-password"
              />
              <button class="toggle-password" (click)="togglePassword()">
                <ion-icon
                  [name]="showPassword() ? 'eye-off-outline' : 'eye-outline'"
                ></ion-icon>
              </button>
            </div>
            @if (passwordError()) {
              <span class="error-text">{{ passwordError() }}</span>
            }
          </div>

          <!-- Erreur globale -->
          @if (globalError()) {
            <div class="global-error">{{ globalError() }}</div>
          }

          <!-- Bouton connexion -->
          <button
            class="btn-primary"
            [disabled]="isLoading()"
            (click)="onLogin()"
          >
            @if (isLoading()) {
              <ion-spinner
                name="crescent"
                style="width:18px;height:18px;"
              ></ion-spinner>
            } @else {
              Se connecter
            }
          </button>

          <!-- Séparateur -->
          <div class="divider">
            <span>ou</span>
          </div>

          <!-- Lien inscription -->
          <p class="register-link">
            Pas encore de compte ?
            <a routerLink="/auth/register">Créer un compte</a>
          </p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .login-wrap {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1rem 0;
      }
      .logo-section {
        text-align: center;
        margin-bottom: 2rem;
      }
      .logo {
        font-size: 28px;
        font-weight: 600;
        color: var(--ion-text-color);
        letter-spacing: -0.5px;
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
      .form-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 20px;
        color: var(--ion-text-color);
      }
      .field-group {
        margin-bottom: 16px;
      }
      .field-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--ion-color-medium-shade);
        display: block;
        margin-bottom: 6px;
      }
      .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .forgot-link {
        font-size: 12px;
        color: #e85d24;
        text-decoration: none;
      }
      .input-wrap {
        display: flex;
        align-items: center;
        background: var(--ion-color-light);
        border: 1.5px solid transparent;
        border-radius: 10px;
        padding: 0 12px;
        transition: border-color 0.15s;
      }
      .input-wrap:focus-within {
        border-color: #e85d24;
        background: var(--ion-background-color);
      }
      .input-wrap.error {
        border-color: var(--ion-color-danger);
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
      .error-text {
        font-size: 12px;
        color: var(--ion-color-danger);
        margin-top: 4px;
        display: block;
      }
      .global-error {
        background: #ffebee;
        color: #b71c1c;
        border: 1.5px solid #ef9a9a;
        border-radius: 8px;
        padding: 12px 14px;
        font-size: 13px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
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
        transition: opacity 0.15s;
      }
      .btn-primary:disabled {
        opacity: 0.6;
      }
      .divider {
        text-align: center;
        color: var(--ion-color-medium);
        font-size: 13px;
        margin: 16px 0;
        position: relative;
      }
      .divider::before,
      .divider::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 40%;
        height: 1px;
        background: var(--ion-color-light-shade);
      }
      .divider::before {
        left: 0;
      }
      .divider::after {
        right: 0;
      }
      .register-link {
        text-align: center;
        font-size: 14px;
        color: var(--ion-color-medium);
        margin: 0;
      }
      .register-link a {
        color: #e85d24;
        font-weight: 500;
        text-decoration: none;
      }
    `,
  ],
})
export class LoginPage {
  private readonly authService = inject(AuthService);

  // État du formulaire
  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  emailError = signal('');
  passwordError = signal('');
  globalError = signal('');

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline });
  }

  async onLogin(): Promise<void> {
    // Validation
    if (!this.validate()) return;

    this.isLoading.set(true);
    this.globalError.set('');

    try {
      await this.authService.login({
        email: this.email.trim(),
        password: this.password,
      });
    } catch (err: any) {
      const message =
        err?.error?.error?.message || 'Email ou mot de passe incorrect';
      this.globalError.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  private validate(): boolean {
    let valid = true;

    if (!this.email.trim()) {
      this.emailError.set("L'email est requis");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError.set('Email invalide');
      valid = false;
    }

    if (!this.password) {
      this.passwordError.set('Le mot de passe est requis');
      valid = false;
    }

    return valid;
  }
  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
