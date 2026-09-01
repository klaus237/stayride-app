import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Payment, PaymentMethod } from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly api = inject(ApiService);

  async initiate(
    bookingId: string,
    method: PaymentMethod,
    phone?: string,
  ): Promise<Payment & { stripe_client_secret?: string; reference?: string }> {
    return this.api.post('payments/initiate', {
      booking_id: bookingId,
      method,
      phone,
    });
  }

  async getStatus(paymentId: string): Promise<Payment> {
    return this.api.get<Payment>(`payments/${paymentId}/status`);
  }

  async getHistory(): Promise<Payment[]> {
    return this.api.get<Payment[]>('payments/history');
  }

  // Polling statut paiement toutes les 10s
  pollStatus(
    paymentId: string,
    onUpdate: (payment: Payment) => void,
    maxAttempts = 36, // 6 minutes max
  ): () => void {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const payment = await this.getStatus(paymentId);
        onUpdate(payment);

        if (['PAID', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(payment.status)) {
          clearInterval(interval);
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      } catch { /* ignorer */ }
    }, 10_000);

    return () => clearInterval(interval);
  }

  // Valider un coupon
  async validateCoupon(
    code: string,
    bookingAmount: number,
  ): Promise<{ valid: boolean; discount: number; message?: string }> {
    return this.api.post('coupons/validate', { code, booking_amount: bookingAmount });
  }
}
