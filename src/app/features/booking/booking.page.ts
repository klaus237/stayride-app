import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  homeOutline,
  calendarOutline,
  peopleOutline,
  cardOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { AuthState } from '../../core/auth/auth.state';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonSpinner,
    CurrencyFormatPipe,
    FormsModule,
  ],
  template: `
    <ion-content>
      <div class="booking-page">
        <!-- Header -->
        <div class="bk-header">
          <button class="bk-back" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </button>
          <h1 class="bk-title">Confirmer la réservation</h1>
        </div>

        @if (isLoading()) {
          <div class="bk-loading">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
        } @else if (property()) {
          <div class="bk-content">
            <!-- Récapitulatif du bien -->
            <div class="bk-card">
              <div class="bk-property">
                <img
                  [src]="
                    property().coverImageUrl ||
                    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
                  "
                  [alt]="property().title || property().brand"
                  class="bk-property__img"
                />
                <div class="bk-property__info">
                  @if (resourceType === 'PROPERTY') {
                    <div class="bk-property__type">
                      {{ getTypeLabel(property().type) }}
                    </div>
                    <div class="bk-property__title">{{ property().title }}</div>
                    <div class="bk-property__location">
                      {{ property().city }}
                    </div>
                  } @else {
                    <div class="bk-property__type">
                      {{ property().category }}
                    </div>
                    <div class="bk-property__title">
                      {{ property().brand }} {{ property().model }}
                      {{ property().year }}
                    </div>
                    <div class="bk-property__location">
                      {{ property().city }}
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Détails séjour -->
            <div class="bk-card">
              <h2 class="bk-card__title">Détails du séjour</h2>
              <div class="bk-detail-row">
                <div class="bk-detail-item">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <div>
                    <div class="bk-detail-label">Arrivée</div>
                    <div class="bk-detail-val">{{ formatDate(checkin) }}</div>
                  </div>
                </div>
                <div class="bk-detail-item">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <div>
                    <div class="bk-detail-label">Départ</div>
                    <div class="bk-detail-val">{{ formatDate(checkout) }}</div>
                  </div>
                </div>
                <div class="bk-detail-item">
                  <ion-icon name="people-outline"></ion-icon>
                  <div>
                    <div class="bk-detail-label">Voyageurs</div>
                    <div class="bk-detail-val">
                      {{ guests }} personne{{ guests > 1 ? 's' : '' }}
                    </div>
                  </div>
                </div>
                <div class="bk-detail-item">
                  <ion-icon name="home-outline"></ion-icon>
                  <div>
                    <div class="bk-detail-label">Durée</div>
                    <div class="bk-detail-val">
                      {{ getDuration() }}
                      {{ resourceType === 'CAR' ? 'jour' : 'nuit'
                      }}{{ getDuration() > 1 ? 's' : '' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Récapitulatif prix -->
            <div class="bk-card">
              <h2 class="bk-card__title">Récapitulatif du prix</h2>
              <div class="bk-price-row">
                @if (resourceType === 'PROPERTY') {
                  <span
                    >{{ property().pricePerNight | currencyFormat: 'XAF' }} ×
                    {{ getDuration() }} nuit{{
                      getDuration() > 1 ? 's' : ''
                    }}</span
                  >
                } @else {
                  <span
                    >{{ property().pricePerDay | currencyFormat: 'XAF' }} ×
                    {{ getDuration() }} jour{{
                      getDuration() > 1 ? 's' : ''
                    }}</span
                  >
                }
                <span>{{ getBasePrice() | currencyFormat: 'XAF' }}</span>
              </div>
              @if (property().cleaningFee > 0) {
                <div class="bk-price-row">
                  <span>Frais de nettoyage</span>
                  <span>{{
                    property().cleaningFee | currencyFormat: 'XAF'
                  }}</span>
                </div>
              }
              @if (property().depositAmount > 0 && resourceType === 'CAR') {
                <div class="bk-price-row">
                  <span>Caution (remboursable)</span>
                  <span>{{
                    property().depositAmount | currencyFormat: 'XAF'
                  }}</span>
                </div>
              }
              <div class="bk-price-row">
                <span>Frais de service (10%)</span>
                <span>{{ getPlatformFee() | currencyFormat: 'XAF' }}</span>
              </div>
              <div class="bk-price-divider"></div>
              <div class="bk-price-total">
                <span>Total</span>
                <strong>{{ getTotal() | currencyFormat: 'XAF' }}</strong>
              </div>
            </div>

            <!-- Demandes spéciales -->
            <div class="bk-card">
              <h2 class="bk-card__title">Demandes spéciales (optionnel)</h2>
              <textarea
                class="bk-textarea"
                [placeholder]="
                  resourceType === 'CAR'
                    ? 'Siège bébé, livraison hotel...'
                    : 'Arrivée tardive, berceau...'
                "
                [(ngModel)]="specialRequests"
                rows="3"
              ></textarea>
            </div>

            <div class="bk-card bk-card--light">
              <h2 class="bk-card__title">Politique d'annulation</h2>
              <p class="bk-policy">
                @if (resourceType === 'CAR') {
                  Annulation gratuite jusqu'à 24h avant la prise en charge.
                  Après cette date, 50% du montant est retenu.
                } @else {
                  Annulation gratuite jusqu'à 48h avant l'arrivée. Après cette
                  date, le premier soir est non remboursable.
                }
              </p>
            </div>

            <!-- Politique d'annulation -->
            <div class="bk-card bk-card--light">
              <h2 class="bk-card__title">Politique d'annulation</h2>
              <p class="bk-policy">
                Annulation gratuite jusqu'à 48h avant l'arrivée. Après cette
                date, le premier soir est non remboursable.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="bk-footer">
            <div class="bk-footer__total">
              <div class="bk-footer__label">Total</div>
              <strong>{{ getTotal() | currencyFormat: 'XAF' }}</strong>
            </div>
            <button
              class="bk-footer__btn"
              (click)="confirmBooking()"
              [disabled]="isConfirming()"
            >
              @if (isConfirming()) {
                <ion-spinner
                  name="crescent"
                  style="width:18px;height:18px;"
                ></ion-spinner>
              } @else {
                Confirmer et payer
              }
            </button>
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

      .booking-page {
        padding-bottom: 80px;
      }

      .bk-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 52px 16px 16px;
        background: #fff;
        border-bottom: 1px solid #eee;
      }
      .bk-back {
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
        flex-shrink: 0;
      }
      .bk-title {
        font-size: 17px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0;
      }

      .bk-loading {
        display: flex;
        justify-content: center;
        padding: 48px;
      }

      .bk-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .bk-card {
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
      }
      .bk-card--light {
        background: #fafafa;
        border: 1px solid #eee;
        box-shadow: none;
      }
      .bk-card__title {
        font-size: 15px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0 0 12px;
      }

      .bk-property {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .bk-property__img {
        width: 80px;
        height: 64px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .bk-property__type {
        font-size: 10px;
        color: #e85d24;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 3px;
      }
      .bk-property__title {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a2e;
        margin-bottom: 3px;
      }
      .bk-property__location {
        font-size: 12px;
        color: #888;
      }

      .bk-detail-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .bk-detail-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .bk-detail-item ion-icon {
        font-size: 18px;
        color: #e85d24;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .bk-detail-label {
        font-size: 11px;
        color: #888;
        margin-bottom: 2px;
      }
      .bk-detail-val {
        font-size: 13px;
        font-weight: 500;
        color: #1a1a2e;
      }

      .bk-price-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #555;
        margin-bottom: 8px;
      }
      .bk-price-divider {
        height: 1px;
        background: #eee;
        margin: 8px 0;
      }
      .bk-price-total {
        display: flex;
        justify-content: space-between;
        font-size: 15px;
        color: #1a1a2e;
      }
      .bk-price-total strong {
        font-weight: 700;
      }

      .bk-textarea {
        width: 100%;
        border: 1.5px solid #eee;
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        color: #1a1a2e;
        outline: none;
        resize: none;
        font-family: inherit;
      }
      .bk-textarea:focus {
        border-color: #e85d24;
      }

      .bk-policy {
        font-size: 13px;
        color: #666;
        line-height: 1.6;
        margin: 0;
      }

      .bk-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
        border-top: 1px solid #eee;
        padding: 12px 20px env(safe-area-inset-bottom, 12px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 100;
      }
      .bk-footer__label {
        font-size: 12px;
        color: #888;
      }
      .bk-footer__total strong {
        font-size: 18px;
        font-weight: 700;
        color: #1a1a2e;
      }
      .bk-footer__btn {
        background: #e85d24;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 14px 24px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .bk-footer__btn:disabled {
        opacity: 0.6;
      }

      @media (min-width: 769px) {
        .bk-header {
          padding: 16px 48px;
        }
        .bk-content {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px 48px;
        }
        .bk-footer {
          max-width: 600px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 12px 12px 0 0;
        }
        .bk-detail-row {
          grid-template-columns: repeat(4, 1fr);
        }
      }
    `,
  ],
})
export class BookingPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  readonly authState = inject(AuthState);

  property = signal<any>(null);
  isLoading = signal(true);
  isConfirming = signal(false);

  checkin = '';
  checkout = '';
  guests = 1;
  total = 0;
  resourceId = '';
  resourceType = '';
  specialRequests = '';

  constructor() {
    addIcons({
      arrowBackOutline,
      homeOutline,
      calendarOutline,
      peopleOutline,
      cardOutline,
      checkmarkCircleOutline,
    });
  }

  async ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.resourceId = params['resource_id'];
    this.resourceType = params['resource_type'];
    this.checkin = params['checkin'];
    this.checkout = params['checkout'];
    this.guests = parseInt(params['guests']) || 1;
    this.total = parseInt(params['total']) || 0;

    try {
      if (this.resourceType === 'PROPERTY') {
        const data = await this.api.get<any>(
          `properties/by-id/${this.resourceId}`,
        );
        this.property.set(data);
      } else if (this.resourceType === 'CAR') {
        const data = await this.api.get<any>(`cars/by-id/${this.resourceId}`);
        this.property.set(data);
      }
    } catch (err) {
      console.error('erreur:', err);
      this.property.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  async confirmBooking() {
    this.isConfirming.set(true);
    try {
      const booking = await this.api.post<any>('bookings', {
        resource_type: this.resourceType,
        resource_id: this.resourceId,
        start_date: this.checkin,
        end_date: this.checkout,
        guests_count: this.guests,
        special_requests: this.specialRequests || undefined,
      });
      console.log('booking response:', booking);
      console.log('booking.id:', booking?.id);

      this.router.navigate(['/app/payment'], {
        queryParams: { booking_id: booking.id, total: this.getTotal() },
      });
    } catch (err: any) {
      console.error('erreur:', err);
      const msg = err?.error?.error?.message || 'Erreur lors de la réservation';
      alert(msg);
    } finally {
      this.isConfirming.set(false);
    }
  }

  getDuration(): number {
    if (!this.checkin || !this.checkout) return 0;
    const diff = Math.ceil(
      (new Date(this.checkout).getTime() - new Date(this.checkin).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    // Pour les voitures : minimum 1 jour même si même date
    if (this.resourceType === 'CAR') return Math.max(diff, 1);
    return diff;
  }

  getBasePrice(): number {
    if (this.resourceType === 'PROPERTY') {
      return Math.round(
        Number(this.property()?.pricePerNight || 0) * this.getDuration(),
      );
    } else {
      return Math.round(
        Number(this.property()?.pricePerDay || 0) * this.getDuration(),
      );
    }
  }

  getPlatformFee(): number {
    return Math.round(
      (this.getBasePrice() + Number(this.property()?.cleaningFee || 0)) * 0.1,
    );
  }

  getTotal(): number {
    return (
      this.getBasePrice() +
      Number(this.property()?.cleaningFee || 0) +
      this.getPlatformFee()
    );
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      APARTMENT: 'Appartement',
      STUDIO: 'Studio',
      VILLA: 'Villa',
      HOUSE: 'Maison',
    };
    return labels[type] || type;
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
