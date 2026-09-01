import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class ShareService {

  // ─── Partager une annonce ─────────────────────────────────────────────────

  async shareProperty(property: {
    title: string;
    slug: string;
    pricePerNight: number;
    city: string;
  }): Promise<void> {
    const url = `${window.location.origin}/properties/${property.slug}`;
    const text = `🏠 ${property.title} — ${property.city}\n💰 ${this.formatPrice(property.pricePerNight)} XAF/nuit\n\nRéservez sur StayRide :\n${url}`;

    await this.share(text, url, property.title);
  }

  async shareCar(car: {
    brand: string;
    model: string;
    slug: string;
    pricePerDay: number;
    city: string;
  }): Promise<void> {
    const url = `${window.location.origin}/cars/${car.slug}`;
    const text = `🚗 ${car.brand} ${car.model} — ${car.city}\n💰 ${this.formatPrice(car.pricePerDay)} XAF/jour\n\nLouez sur StayRide :\n${url}`;

    await this.share(text, url, `${car.brand} ${car.model}`);
  }

  // ─── Partager confirmation de réservation ─────────────────────────────────

  async shareBookingConfirmation(booking: {
    id: string;
    reference: string;
    totalAmount: number;
  }): Promise<void> {
    const text = `✅ Réservation confirmée sur StayRide !\nRéférence : ${booking.reference}\nMontant : ${this.formatPrice(booking.totalAmount)} XAF`;

    await this.share(text);
  }

  // ─── Partager code de parrainage ──────────────────────────────────────────

  async shareReferralCode(code: string, reward: number): Promise<void> {
    const text = `🎁 Rejoins StayRide avec mon code de parrainage et obtiens ${this.formatPrice(reward)} XAF offerts !\n\nCode : ${code}\n\nTélécharge l'app : ${window.location.origin}`;

    await this.share(text);
  }

  // ─── Méthode principale ───────────────────────────────────────────────────

  private async share(text: string, url?: string, title?: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      // Partage natif iOS/Android
      await Share.share({ title, text, url });
    } else {
      // Web — ouvrir WhatsApp
      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/?text=${encodedText}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-CM').format(price);
  }
}
