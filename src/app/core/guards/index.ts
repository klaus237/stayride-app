import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../auth/auth.state';
import { PlatformSettingsService } from '../services/platform-settings.service';
import { UserRole } from '../models';

// ─── Auth Guard — utilisateur connecté ? ─────────────────────────────────────

export const authGuard: CanActivateFn = async () => {
  const state = inject(AuthState);
  const router = inject(Router);

  if (!state.isAuthenticated()) {
    await router.navigate(['/auth/login']);
    return false;
  }
  return true;
};

// ─── Guest Guard — rediriger si déjà connecté ────────────────────────────────

export const guestGuard: CanActivateFn = async () => {
  const state = inject(AuthState);
  const router = inject(Router);

  if (state.isAuthenticated()) {
    const role = state.currentUser()?.role;
    // Seulement rediriger les rôles spéciaux
    switch (role) {
      case UserRole.ADMIN:
        await router.navigate(['/admin/dashboard']);
        return false;
      case UserRole.OWNER:
        await router.navigate(['/owner/dashboard']);
        return false;
      case UserRole.CONCIERGE:
        await router.navigate(['/concierge/today']);
        return false;
      default:
        // Customer peut accéder à la page login/register
        return true;
    }
  }
  return true;
};

// ─── Role Guard Factory ───────────────────────────────────────────────────────

export const roleGuard =
  (...roles: UserRole[]): CanActivateFn =>
  async () => {
    const state = inject(AuthState);
    const router = inject(Router);

    if (!state.isAuthenticated()) {
      await router.navigate(['/auth/login']);
      return false;
    }

    // Admin accède partout
    if (state.isAdmin()) return true;

    const hasRole = state.hasAnyRole(...roles);
    if (!hasRole) {
      await router.navigate(['/app/home']);
      return false;
    }
    return true;
  };

// ─── KYC Guard — vérification identité si requise ────────────────────────────

export const kycGuard: CanActivateFn = async () => {
  const state = inject(AuthState);
  const settingsService = inject(PlatformSettingsService);
  const router = inject(Router);

  const settings = await settingsService.getSettings();

  if (settings.kyc_required) {
    // TODO: vérifier statut KYC de l'utilisateur
    // Pour l'instant, rediriger vers le profil si non vérifié
    const user = state.currentUser();
    if (!user?.isEmailVerified) {
      await router.navigate(['/app/profile/kyc']);
      return false;
    }
  }

  return true;
};

// ─── License Guard — permis requis pour louer une voiture ────────────────────

export const licenseGuard: CanActivateFn = async () => {
  const settingsService = inject(PlatformSettingsService);
  const router = inject(Router);

  const settings = await settingsService.getSettings();

  if (settings.license_required) {
    // TODO: vérifier statut permis
    // Rediriger si permis non uploadé/validé
  }

  return true;
};
