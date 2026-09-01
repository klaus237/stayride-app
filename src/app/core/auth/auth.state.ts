import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthState {
  // ─── State principal (Signals) ────────────────────────────────────────────

  readonly currentUser = signal<User | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isInitialized = signal<boolean>(false);

  // ─── Computed (dérivés automatiquement) ──────────────────────────────────

  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  readonly isCustomer = computed(
    () => this.currentUser()?.role === UserRole.CUSTOMER,
  );
  readonly isOwner = computed(
    () => this.currentUser()?.role === UserRole.OWNER,
  );
  readonly isConcierge = computed(
    () => this.currentUser()?.role === UserRole.CONCIERGE,
  );
  readonly isAdmin = computed(
    () => this.currentUser()?.role === UserRole.ADMIN,
  );

  readonly userFullName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  });

  readonly loyaltyPoints = computed(() => this.currentUser()?.loyaltyPoints ?? 0);
  readonly walletBalance = computed(() => this.currentUser()?.walletBalance ?? 0);

  // ─── Méthodes de mutation ──────────────────────────────────────────────────

  setUser(user: User | null): void {
    this.currentUser.set(user);
  }

  updateUser(partial: Partial<User>): void {
    const current = this.currentUser();
    if (current) {
      this.currentUser.set({ ...current, ...partial });
    }
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  setInitialized(): void {
    this.isInitialized.set(true);
  }

  clear(): void {
    this.currentUser.set(null);
  }

  // ─── Vérification de rôle ─────────────────────────────────────────────────

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  hasAnyRole(...roles: UserRole[]): boolean {
    const userRole = this.currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }
}
