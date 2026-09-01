import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  phonePortraitOutline,
  cardOutline,
  checkmarkCircleOutline,
  copyOutline,
  timeOutline,
} from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonSpinner,
    CurrencyFormatPipe,
  ],
  template: `
    <ion-content>
      <div class="pay-page">
        <!-- Header -->
        <div class="pay-header">
          <button class="pay-back" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </button>
          <h1 class="pay-title">Paiement</h1>
        </div>

        <!-- Timer -->
        <div class="pay-timer">
          <ion-icon name="time-outline"></ion-icon>
          Réservation expirée dans <strong>{{ timeLeft }}</strong>
        </div>

        <!-- Total -->
        <div class="pay-total">
          <span>Montant à payer</span>
          <strong>{{ total | currencyFormat: 'XAF' }}</strong>
        </div>

        <!-- Méthodes de paiement -->
        <div class="pay-methods">
          <h2 class="pay-methods__title">Choisir le mode de paiement</h2>

          <!-- Orange Money -->
          <div
            class="pay-method"
            [class.pay-method--active]="selectedMethod === 'ORANGE_MONEY'"
            (click)="selectMethod('ORANGE_MONEY')"
          >
            <div class="pay-method__icon pay-method__icon--orange">OM</div>
            <div class="pay-method__info">
              <div class="pay-method__name">Orange Money</div>
              <div class="pay-method__desc">Paiement mobile instantané</div>
            </div>
            <div
              class="pay-method__check"
              [class.pay-method__check--active]="
                selectedMethod === 'ORANGE_MONEY'
              "
            >
              @if (selectedMethod === 'ORANGE_MONEY') {
                <ion-icon name="checkmark-circle-outline"></ion-icon>
              }
            </div>
          </div>

          <!-- MTN MoMo -->
          <div
            class="pay-method"
            [class.pay-method--active]="selectedMethod === 'MTN_MOMO'"
            (click)="selectMethod('MTN_MOMO')"
          >
            <div class="pay-method__icon pay-method__icon--mtn">MTN</div>
            <div class="pay-method__info">
              <div class="pay-method__name">MTN Mobile Money</div>
              <div class="pay-method__desc">Paiement mobile instantané</div>
            </div>
            <div
              class="pay-method__check"
              [class.pay-method__check--active]="selectedMethod === 'MTN_MOMO'"
            >
              @if (selectedMethod === 'MTN_MOMO') {
                <ion-icon name="checkmark-circle-outline"></ion-icon>
              }
            </div>
          </div>

          <!-- Stripe -->
          <div
            class="pay-method"
            [class.pay-method--active]="selectedMethod === 'STRIPE'"
            (click)="selectMethod('STRIPE')"
          >
            <div class="pay-method__icon pay-method__icon--stripe">💳</div>
            <div class="pay-method__info">
              <div class="pay-method__name">Carte bancaire</div>
              <div class="pay-method__desc">Visa, Mastercard</div>
            </div>
            <div
              class="pay-method__check"
              [class.pay-method__check--active]="selectedMethod === 'STRIPE'"
            >
              @if (selectedMethod === 'STRIPE') {
                <ion-icon name="checkmark-circle-outline"></ion-icon>
              }
            </div>
          </div>

          <!-- Cash -->
          <div
            class="pay-method"
            [class.pay-method--active]="selectedMethod === 'CASH'"
            (click)="selectMethod('CASH')"
          >
            <div class="pay-method__icon pay-method__icon--cash">💵</div>
            <div class="pay-method__info">
              <div class="pay-method__name">Paiement en espèces</div>
              <div class="pay-method__desc">
                À l'arrivée chez le propriétaire
              </div>
            </div>
            <div
              class="pay-method__check"
              [class.pay-method__check--active]="selectedMethod === 'CASH'"
            >
              @if (selectedMethod === 'CASH') {
                <ion-icon name="checkmark-circle-outline"></ion-icon>
              }
            </div>
          </div>
        </div>

        <!-- Instructions selon méthode -->
        @if (selectedMethod === 'ORANGE_MONEY') {
          <div class="pay-instructions">
            <h3 class="pay-instructions__title">Instructions Orange Money</h3>
            <div class="pay-step">
              <div class="pay-step__num">1</div>
              <div>
                Composez <strong>#150#</strong> sur votre téléphone Orange
              </div>
            </div>
            <div class="pay-step">
              <div class="pay-step__num">2</div>
              <div>Sélectionnez <strong>Paiement marchand</strong></div>
            </div>
            <div class="pay-step">
              <div class="pay-step__num">3</div>
              <div>
                Entrez le code marchand :
                <div class="pay-code">
                  <strong>STAYRIDE237</strong>
                  <button class="pay-copy" (click)="copyCode('STAYRIDE237')">
                    <ion-icon name="copy-outline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>
            <div class="pay-step">
              <div class="pay-step__num">4</div>
              <div>
                Montant : <strong>{{ total | currencyFormat: 'XAF' }}</strong>
              </div>
            </div>
            <div class="pay-step">
              <div class="pay-step__num">5</div>
              <div>
                Référence :
                <div class="pay-code">
                  <strong>{{ getBookingRef() }}</strong>
                  <button
                    class="pay-copy"
                    (click)="copyCode(getBookingRef() || '')"
                  >
                    <ion-icon name="copy-outline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>

            <div class="pay-phone">
              <label
                >Votre numéro
                {{
                  selectedMethod === 'ORANGE_MONEY'
                    ? 'Orange Money'
                    : 'MTN MoMo'
                }}</label
              >
              <input
                type="tel"
                [(ngModel)]="phoneNumber"
                placeholder="{{
                  selectedMethod === 'ORANGE_MONEY'
                    ? '69X XXX XXX'
                    : '67X XXX XXX'
                }}"
                class="pay-input"
                [class.pay-input--error]="getPhoneError()"
                maxlength="9"
              />
              @if (getPhoneError()) {
                <div class="pay-phone-error">{{ getPhoneError() }}</div>
              }
            </div>
          </div>
        }

        @if (selectedMethod === 'MTN_MOMO') {
          <div class="pay-instructions">
            <h3 class="pay-instructions__title">Instructions MTN MoMo</h3>
            <div class="pay-step">
              <div class="pay-step__num">1</div>
              <div>Composez <strong>*126#</strong> sur votre téléphone MTN</div>
            </div>
            <div class="pay-step">
              <div class="pay-step__num">2</div>
              <div>Sélectionnez <strong>Payer un service</strong></div>
            </div>
            <div class="pay-step">
              <div class="pay-step__num">3</div>
              <div>
                Code service :
                <div class="pay-code">
                  <strong>STAYRIDE</strong>
                  <button class="pay-copy" (click)="copyCode('STAYRIDE')">
                    <ion-icon name="copy-outline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>
            <div class="pay-step">
              <div class="pay-step__num">4</div>
              <div>
                Montant : <strong>{{ total | currencyFormat: 'XAF' }}</strong>
              </div>
            </div>
            <div class="pay-step">
              <div class="pay-step__num">5</div>
              <div>
                Référence :
                <div class="pay-code">
                  <strong>{{ getBookingRef() }}</strong>
                  <button class="pay-copy" (click)="copyCode(getBookingRef())">
                    <ion-icon name="copy-outline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>

            <div class="pay-phone">
              <label>Votre numéro MTN MoMo</label>
              <input
                type="tel"
                [(ngModel)]="phoneNumber"
                placeholder="6XX XXX XXX"
                class="pay-input"
              />
            </div>
          </div>
        }

        @if (selectedMethod === 'CASH') {
          <div class="pay-instructions pay-instructions--info">
            <ion-icon
              name="time-outline"
              style="font-size:24px;color:#E85D24;"
            ></ion-icon>
            <p>
              Le paiement en espèces se fait directement auprès du propriétaire
              lors de votre arrivée. Votre réservation sera confirmée après
              validation du propriétaire.
            </p>
          </div>
        }

        <!-- Bouton confirmer -->
        <div class="pay-footer">
          <button
            class="pay-confirm-btn"
            [class.pay-confirm-btn--disabled]="!selectedMethod"
            (click)="confirmPayment()"
            [disabled]="isProcessing() || !selectedMethod"
          >
            @if (isProcessing()) {
              <ion-spinner
                name="crescent"
                style="width:18px;height:18px;margin-right:8px;"
              ></ion-spinner>
              Traitement en cours...
            } @else {
              @if (
                selectedMethod === 'ORANGE_MONEY' ||
                selectedMethod === 'MTN_MOMO'
              ) {
                J'ai effectué le paiement
              } @else if (selectedMethod === 'CASH') {
                Confirmer — Payer à l'arrivée
              } @else if (selectedMethod === 'STRIPE') {
                Payer par carte
              } @else {
                Choisir un mode de paiement
              }
            }
          </button>
        </div>

        <!-- Succès -->
        @if (paymentSuccess()) {
          <div class="pay-success-overlay">
            <div class="pay-success-card">
              <div class="pay-success-icon">✓</div>
              <h2>Réservation confirmée !</h2>
              <p>Votre réservation a été enregistrée avec succès.</p>
              <div class="pay-success-ref">
                Référence : {{ getBookingRef() }}
              </div>
              <button class="pay-success-btn" (click)="goHome()">
                Voir mes réservations
              </button>
            </div>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: #f5f5f5;
      }
      .pay-page {
        padding-bottom: 100px;
      }

      .pay-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 52px 16px 16px;
        background: #fff;
        border-bottom: 1px solid #eee;
      }
      .pay-back {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #f5f5f5;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }
      .pay-title {
        font-size: 17px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0;
      }

      .pay-timer {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #fff3ed;
        color: #e85d24;
        padding: 10px 16px;
        font-size: 13px;
      }
      .pay-timer strong {
        font-weight: 600;
      }

      .pay-total {
        background: #1a1a2e;
        color: #fff;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .pay-total span {
        font-size: 13px;
        opacity: 0.7;
      }
      .pay-total strong {
        font-size: 22px;
        font-weight: 700;
      }

      .pay-methods {
        background: #fff;
        margin: 0 16px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
        margin-bottom: 16px;
      }
      .pay-methods__title {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a2e;
        padding: 16px 16px 8px;
        margin: 0;
      }

      .pay-method {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid #f5f5f5;
        cursor: pointer;
        transition: background 0.15s;
      }
      .pay-method:last-child {
        border-bottom: none;
      }
      .pay-method--active {
        background: rgba(232, 93, 36, 0.04);
      }
      .pay-method:hover {
        background: #fafafa;
      }

      .pay-method__icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .pay-method__icon--orange {
        background: #ff6600;
        color: #fff;
      }
      .pay-method__icon--mtn {
        background: #ffcc00;
        color: #1a1a2e;
      }
      .pay-method__icon--stripe {
        background: #f0f0f0;
        font-size: 20px;
      }
      .pay-method__icon--cash {
        background: #e8f5e9;
        font-size: 20px;
      }

      .pay-method__info {
        flex: 1;
      }
      .pay-method__name {
        font-size: 14px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .pay-method__desc {
        font-size: 12px;
        color: #888;
        margin-top: 2px;
      }

      .pay-method__check {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #e85d24;
      }

      .pay-instructions {
        background: #fff;
        margin: 0 16px 16px;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
      }
      .pay-instructions--info {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .pay-instructions--info p {
        font-size: 13px;
        color: #555;
        line-height: 1.6;
        margin: 0;
      }
      .pay-instructions__title {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0 0 14px;
      }

      .pay-step {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
        font-size: 13px;
        color: #444;
      }
      .pay-step__num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #e85d24;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .pay-code {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f5f5f5;
        border-radius: 8px;
        padding: 6px 10px;
        margin-top: 4px;
        font-family: monospace;
      }
      .pay-copy {
        background: none;
        border: none;
        cursor: pointer;
        color: #e85d24;
        font-size: 16px;
        display: flex;
        align-items: center;
      }

      .pay-phone {
        margin-top: 16px;
      }
      .pay-phone label {
        font-size: 12px;
        color: #888;
        display: block;
        margin-bottom: 6px;
      }
      .pay-input {
        width: 100%;
        border: 1.5px solid #eee;
        border-radius: 10px;
        padding: 12px;
        font-size: 15px;
        outline: none;
      }
      .pay-input:focus {
        border-color: #e85d24;
      }

      .pay-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 12px 16px env(safe-area-inset-bottom, 12px);
        background: #fff;
        border-top: 1px solid #eee;
        z-index: 100;
      }
      .pay-confirm-btn {
        width: 100%;
        padding: 16px;
        border-radius: 12px;
        background: #e85d24;
        color: #fff;
        border: none;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .pay-confirm-btn--disabled {
        background: #ccc;
        cursor: default;
      }

      .pay-success-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .pay-success-card {
        background: #fff;
        border-radius: 20px;
        padding: 32px 24px;
        text-align: center;
        max-width: 320px;
        width: 100%;
      }
      .pay-success-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #4caf50;
        color: #fff;
        font-size: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
      }
      .pay-success-card h2 {
        font-size: 20px;
        font-weight: 700;
        color: #1a1a2e;
        margin: 0 0 8px;
      }
      .pay-success-card p {
        font-size: 14px;
        color: #666;
        margin: 0 0 16px;
      }
      .pay-success-ref {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 8px 16px;
        font-family: monospace;
        font-size: 14px;
        color: #1a1a2e;
        margin-bottom: 20px;
      }
      .pay-success-btn {
        width: 100%;
        padding: 14px;
        border-radius: 12px;
        background: #e85d24;
        color: #fff;
        border: none;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
      }

      @media (min-width: 769px) {
        .pay-header {
          padding: 16px 48px;
        }
        .pay-methods {
          max-width: 600px;
          margin: 0 auto 16px;
        }
        .pay-instructions {
          max-width: 600px;
          margin: 0 auto 16px;
        }
        .pay-footer {
          max-width: 600px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 12px 12px 0 0;
        }
      }
      .pay-input--error {
        border-color: #ef4444;
      }
      .pay-phone-error {
        font-size: 11px;
        color: #ef4444;
        margin-top: 4px;
      }
    `,
  ],
})
export class PaymentPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  isProcessing = signal(false);
  paymentSuccess = signal(false);

  bookingId = '';
  total = 0;
  selectedMethod = '';
  phoneNumber = '';
  timeLeft = '29:59';
  private timerInterval: any;

  constructor() {
    addIcons({
      arrowBackOutline,
      phonePortraitOutline,
      cardOutline,
      checkmarkCircleOutline,
      copyOutline,
      timeOutline,
    });
  }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.bookingId = params['booking_id'];
    this.total = parseInt(params['total']) || 0;
    this.startTimer();

    // Annuler si l'utilisateur utilise le bouton back du navigateur
    window.addEventListener('popstate', this.handlePopState.bind(this));
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    window.removeEventListener('popstate', this.handlePopState.bind(this));
  }
  handlePopState = async () => {
    await this.cancelBooking();
  };
  async cancelBooking() {
    if (this.bookingId && !this.paymentSuccess()) {
      try {
        await this.api.patch(`bookings/${this.bookingId}/cancel`, {
          reason: 'Paiement abandonné',
        });
      } catch {}
    }
  }
  startTimer() {
    let seconds = 14 * 60 + 59; // 15 minutes
    this.timerInterval = setInterval(() => {
      seconds--;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      this.timeLeft = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      if (seconds <= 0) {
        clearInterval(this.timerInterval);
        this.timeLeft = '00:00';
        // Rediriger vers l'accueil si timer expiré
        alert('Votre réservation a expiré. Veuillez recommencer.');
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  selectMethod(method: string) {
    this.selectedMethod = method;
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
  }

  async confirmPayment() {
    if (!this.selectedMethod) return;

    if (
      (this.selectedMethod === 'ORANGE_MONEY' ||
        this.selectedMethod === 'MTN_MOMO') &&
      !this.validatePhone()
    ) {
      alert('Veuillez entrer un numéro de téléphone valide');
      return;
    }
    this.isProcessing.set(true);
    try {
      await this.api.post(`payments/initiate`, {
        bookingId: this.bookingId,
        method: this.selectedMethod,
        phone: this.phoneNumber || undefined,
      });
      this.paymentSuccess.set(true);
      if (this.timerInterval) clearInterval(this.timerInterval);
    } catch (err: any) {
      const msg = err?.error?.error?.message || 'Erreur lors du paiement';
      alert(msg);
    } finally {
      this.isProcessing.set(false);
    }
  }

  async goBack() {
    await this.cancelBooking();
    window.history.back();
  }
  goHome() {
    this.router.navigate(['/app/trips']);
  }
  getBookingRef(): string {
    return this.bookingId ? this.bookingId.substring(0, 8).toUpperCase() : '';
  }

  validatePhone(): boolean {
    if (!this.phoneNumber) return false;
    const phone = this.phoneNumber.replace(/\s/g, '');

    if (this.selectedMethod === 'ORANGE_MONEY') {
      return /^(69|655|656|657|658|659)\d+$/.test(phone) && phone.length === 9;
    }
    if (this.selectedMethod === 'MTN_MOMO') {
      return /^(67|68|62|63)\d+$/.test(phone) && phone.length === 9;
    }
    return true;
  }

  getPhoneError(): string {
    if (!this.phoneNumber) return '';
    if (!this.validatePhone()) {
      if (this.selectedMethod === 'ORANGE_MONEY') {
        return 'Numéro Orange invalide (doit commencer par 69, 655-659)';
      }
      if (this.selectedMethod === 'MTN_MOMO') {
        return 'Numéro MTN invalide (doit commencer par 67, 68, 62, 63)';
      }
    }
    return '';
  }
}
