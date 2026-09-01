import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthState } from './auth.state';
import { TokenService } from './token.service';
import { ApiService } from '../services/api.service';
import { User, UserRole, AuthTokens } from '../models';

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  language?: 'fr' | 'en';
  referral_code?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly state = inject(AuthState);
  private readonly tokenService = inject(TokenService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  // ─── Bootstrap — appelé au démarrage de l'app ─────────────────────────────
  async bootstrap(): Promise<void> {
    try {
      const hasTokens = await this.tokenService.hasValidTokens();
      if (!hasTokens) {
        this.state.setInitialized();
        return;
      }

      try {
        const user = await this.getProfile();
        this.state.setUser(user);
        // NE PAS rediriger ici — laisser l'utilisateur où il est
      } catch {
        await this.tokenService.clearTokens();
        this.state.clear();
      }
    } catch {
      this.state.clear();
    } finally {
      this.state.setInitialized();
    }
  }

  // ─── Inscription ──────────────────────────────────────────────────────────

  async register(payload: RegisterPayload): Promise<void> {
    this.state.setLoading(true);
    try {
      const response = await this.api.post<AuthTokens>(
        'auth/register',
        payload,
      );
      await this.handleAuthResponse(response);
      await this.navigateByRole();
    } finally {
      this.state.setLoading(false);
    }
  }

  // ─── Connexion ────────────────────────────────────────────────────────────

  async login(payload: LoginPayload): Promise<void> {
    this.state.setLoading(true);
    try {
      const response = await this.api.post<AuthTokens>('auth/login', payload);
      await this.handleAuthResponse(response);
      await this.navigateByRole();
    } finally {
      this.state.setLoading(false);
    }
  }

  // ─── Déconnexion ──────────────────────────────────────────────────────────

  async logout(): Promise<void> {
    try {
      const refreshToken = await this.tokenService.getRefreshToken();
      await this.api.post('auth/logout', { refresh_token: refreshToken });
    } catch {
      /* ignorer les erreurs réseau */
    } finally {
      await this.tokenService.clearTokens();
      this.state.clear();
      await this.router.navigate(['/auth/login']);
    }
  }

  // ─── Refresh token ────────────────────────────────────────────────────────

  async refreshTokens(): Promise<string> {
    const refreshToken = await this.tokenService.getRefreshToken();
    if (!refreshToken) throw new Error('Pas de refresh token');

    const response = await this.api.post<AuthTokens>('auth/refresh', {
      refresh_token: refreshToken,
    });

    await this.tokenService.updateAccessToken(
      response.access_token,
      response.expires_in,
    );

    return response.access_token;
  }

  // ─── Profil utilisateur ───────────────────────────────────────────────────

  async getProfile(): Promise<User> {
    return this.api.get<User>('users/me');
  }

  // ─── Vérification email ───────────────────────────────────────────────────

  async verifyEmail(token: string): Promise<void> {
    await this.api.post('auth/verify-email', { token });
  }

  async resendVerification(): Promise<void> {
    await this.api.post('auth/resend-verification', {});
  }

  // ─── Mot de passe oublié ──────────────────────────────────────────────────

  async forgotPassword(email: string): Promise<void> {
    await this.api.post('auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await this.api.post('auth/reset-password', { token, password });
  }

  // ─── Gestion de la réponse auth ───────────────────────────────────────────

  private async handleAuthResponse(response: AuthTokens): Promise<void> {
    await this.tokenService.saveTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in,
    );
    // Récupérer le profil complet
    const user = await this.getProfile();
    this.state.setUser(user);
  }

  // ─── Navigation par rôle ──────────────────────────────────────────────────

  async navigateByRole(): Promise<void> {
    const user = this.state.currentUser();
    if (!user) return;

    // Vérifier s'il y a une réservation en attente
    const pendingBooking = sessionStorage.getItem('pending_booking');
    if (pendingBooking) {
      sessionStorage.removeItem('pending_booking');
      const booking = JSON.parse(pendingBooking);
      await this.router.navigate(['/app/book'], {
        queryParams: {
          resource_id: booking.resource_id,
          resource_type: booking.resource_type,
          checkin: booking.checkin,
          checkout: booking.checkout,
          guests: booking.guests,
          total: booking.total,
        },
      });
      return;
    }

    switch (user.role) {
      case UserRole.ADMIN:
        await this.router.navigate(['/admin/dashboard']);
        break;
      case UserRole.OWNER:
        await this.router.navigate(['/owner/dashboard']);
        break;
      case UserRole.CONCIERGE:
        await this.router.navigate(['/concierge/today']);
        break;
      default:
        await this.router.navigate(['/']);
    }
  }
}
