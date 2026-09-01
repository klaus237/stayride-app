import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { PlatformSettings } from '../models';

const DEFAULT_SETTINGS: PlatformSettings = {
  kyc_required: false,
  license_required: false,
  deposit_required: true,
  default_currency: 'XAF',
  platform_name: 'StayRide',
  payment_methods: {
    ORANGE_MONEY: {
      enabled: true,
      label: 'Orange Money',
      merchant_code: 'STAYRIDE',
      instructions_fr: 'Composez #150# → Paiement marchand → Code STAYRIDE',
      instructions_en: 'Dial #150# → Merchant payment → Code STAYRIDE',
    },
    MTN_MOMO: {
      enabled: true,
      label: 'MTN MoMo',
      merchant_code: 'STAYRIDE',
      instructions_fr: 'Composez *126# → Paiement → Code STAYRIDE',
      instructions_en: 'Dial *126# → Payment → Code STAYRIDE',
    },
    CASH: {
      enabled: true,
      label: 'Espèces',
    },
  },
};

@Injectable({ providedIn: 'root' })
export class PlatformSettingsService {
  private readonly api = inject(ApiService);
  private readonly settings = signal<PlatformSettings>(DEFAULT_SETTINGS);
  private loaded = false;

  readonly currentSettings = this.settings.asReadonly();

  async getSettings(): Promise<PlatformSettings> {
    if (!this.loaded) {
      await this.loadSettings();
    }
    return this.settings();
  }

  async loadSettings(): Promise<void> {
    try {
      const settings = await this.api.get<PlatformSettings>('platform/settings');
      this.settings.set(settings);
      this.loaded = true;
    } catch {
      // Utiliser les valeurs par défaut si le backend est inaccessible
      this.loaded = true;
    }
  }

  // Modes de paiement activés
  getEnabledPaymentMethods(): { key: string; config: any }[] {
    const methods = this.settings().payment_methods;
    return Object.entries(methods)
      .filter(([, config]) => config.enabled)
      .map(([key, config]) => ({ key, config }));
  }

  // Instructions pour un mode de paiement
  getPaymentInstructions(method: string, lang: 'fr' | 'en' = 'fr'): string {
    const config = this.settings().payment_methods[method];
    return lang === 'fr'
      ? config?.instructions_fr || ''
      : config?.instructions_en || '';
  }

  isKycRequired(): boolean {
    return this.settings().kyc_required;
  }

  isLicenseRequired(): boolean {
    return this.settings().license_required;
  }

  getDefaultCurrency(): string {
    return this.settings().default_currency;
  }
}
