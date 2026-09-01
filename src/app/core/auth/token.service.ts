import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const ACCESS_TOKEN_KEY = 'sr_access_token';
const REFRESH_TOKEN_KEY = 'sr_refresh_token';
const EXPIRES_AT_KEY = 'sr_expires_at';

@Injectable({ providedIn: 'root' })
export class TokenService {

  // ─── Sauvegarder les tokens ───────────────────────────────────────────────

  async saveTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): Promise<void> {
    const expiresAt = Date.now() + expiresIn * 1000;
    await Promise.all([
      Preferences.set({ key: ACCESS_TOKEN_KEY, value: accessToken }),
      Preferences.set({ key: REFRESH_TOKEN_KEY, value: refreshToken }),
      Preferences.set({ key: EXPIRES_AT_KEY, value: expiresAt.toString() }),
    ]);
  }

  // ─── Lire les tokens ──────────────────────────────────────────────────────

  async getAccessToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: ACCESS_TOKEN_KEY });
    return value;
  }

  async getRefreshToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: REFRESH_TOKEN_KEY });
    return value;
  }

  // ─── Vérifier l'expiration ────────────────────────────────────────────────

  async isAccessTokenExpired(): Promise<boolean> {
    const { value } = await Preferences.get({ key: EXPIRES_AT_KEY });
    if (!value) return true;

    const expiresAt = parseInt(value, 10);
    // Considérer expiré 60s avant pour éviter les races
    return Date.now() >= expiresAt - 60_000;
  }

  async hasValidTokens(): Promise<boolean> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ]);
    return !!(accessToken && refreshToken);
  }

  // ─── Supprimer les tokens ─────────────────────────────────────────────────

  async clearTokens(): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: ACCESS_TOKEN_KEY }),
      Preferences.remove({ key: REFRESH_TOKEN_KEY }),
      Preferences.remove({ key: EXPIRES_AT_KEY }),
    ]);
  }

  // ─── Mettre à jour uniquement l'access token ──────────────────────────────

  async updateAccessToken(accessToken: string, expiresIn: number): Promise<void> {
    const expiresAt = Date.now() + expiresIn * 1000;
    await Promise.all([
      Preferences.set({ key: ACCESS_TOKEN_KEY, value: accessToken }),
      Preferences.set({ key: EXPIRES_AT_KEY, value: expiresAt.toString() }),
    ]);
  }
}
