import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  carOutline,
  calendarOutline,
  locationOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  hourglassOutline,
  cardOutline,
  arrowForwardOutline,
  closeOutline,
  searchOutline,
  chatbubbleOutline,
  personOutline,
  addOutline,
  eyeOutline,
} from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonIcon,
    IonSpinner,
    CurrencyFormatPipe,
  ],
  template: `
    <ion-content>
      <div class="trips-page">
        <div class="trips-header">
          <h1 class="trips-title">Mes reservations</h1>
          <button class="trips-new-btn" [routerLink]="['/']">
            <ion-icon name="add-outline"></ion-icon> Nouvelle
          </button>
        </div>
        <div class="trips-filters">
          @for (f of filters; track f.value) {
            <button
              class="filter-chip"
              [class.filter-chip--active]="activeFilter === f.value"
              (click)="setFilter(f.value)"
            >
              {{ f.label }}
            </button>
          }
        </div>
        @if (isLoading()) {
          <div class="trips-loading">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
        } @else if (filteredTrips().length === 0) {
          <div class="trips-empty">
            <ion-icon name="calendar-outline"></ion-icon>
            <p>
              Aucune reservation
              {{ activeFilter !== 'all' ? 'dans cette categorie' : '' }}
            </p>
            <button class="trips-explore-btn" [routerLink]="['/']">
              Explorer les biens
            </button>
          </div>
        } @else {
          <div class="trips-list">
            @for (trip of filteredTrips(); track trip.id) {
              <div class="trip-card" (click)="viewTrip(trip)">
                <div class="trip-card__img">
                  <img
                    [src]="getTripImage(trip)"
                    [alt]="getTripTitle(trip)"
                    loading="lazy"
                  />
                  <div class="trip-card__type">
                    <ion-icon
                      [name]="
                        trip.resourceType === 'CAR'
                          ? 'car-outline'
                          : 'home-outline'
                      "
                    ></ion-icon>
                  </div>
                </div>
                <div class="trip-card__body">
                  <div class="trip-card__header">
                    <h3 class="trip-card__title">{{ getTripTitle(trip) }}</h3>
                    <div
                      class="trip-card__status"
                      [class]="'status-' + trip.status.toLowerCase()"
                    >
                      <ion-icon [name]="getStatusIcon(trip.status)"></ion-icon>
                      {{ getStatusLabel(trip.status) }}
                    </div>
                  </div>
                  <div class="trip-card__dates">
                    <ion-icon name="calendar-outline"></ion-icon>
                    {{ formatDate(trip.startDate) }} ->
                    {{ formatDate(trip.endDate) }}
                    <span class="trip-card__duration"
                      >. {{ getDuration(trip) }}
                      {{ trip.resourceType === 'CAR' ? 'jour' : 'nuit'
                      }}{{ getDuration(trip) > 1 ? 's' : '' }}</span
                    >
                  </div>
                  <div class="trip-card__footer">
                    <strong>{{
                      trip.totalAmount | currencyFormat: 'XAF'
                    }}</strong>
                    <div class="trip-card__ref">
                      Ref: {{ trip.id.substring(0, 8).toUpperCase() }}
                    </div>
                  </div>
                  @if (trip.status === 'PENDING') {
                    <button
                      class="trip-card__pay-btn"
                      (click)="payNow($event, trip)"
                    >
                      <ion-icon name="card-outline"></ion-icon> Payer maintenant
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      @if (selectedTrip()) {
        <div class="trip-overlay" (click)="selectedTrip.set(null)"></div>
        <div class="trip-modal">
          <div class="trip-modal__handle"></div>
          <button class="trip-modal__close" (click)="selectedTrip.set(null)">
            <ion-icon name="close-outline"></ion-icon>
          </button>
          <div class="trip-modal__img">
            <img
              [src]="getTripImage(selectedTrip())"
              [alt]="getTripTitle(selectedTrip())"
            />
            <div
              class="trip-modal__status"
              [class]="'status-' + selectedTrip().status.toLowerCase()"
            >
              <ion-icon
                [name]="getStatusIcon(selectedTrip().status)"
              ></ion-icon>
              {{ getStatusLabel(selectedTrip().status) }}
            </div>
          </div>
          <div class="trip-modal__body">
            <h2 class="trip-modal__title">
              {{ getTripTitle(selectedTrip()) }}
            </h2>
            <div class="trip-modal__ref">
              Ref: {{ selectedTrip().id.substring(0, 8).toUpperCase() }}
            </div>
            <div class="trip-modal__divider"></div>

            <div class="trip-modal__row">
              <ion-icon name="calendar-outline"></ion-icon>
              <div>
                <div class="trip-modal__label">
                  {{
                    selectedTrip().resourceType === 'CAR'
                      ? 'Prise en charge'
                      : 'Arrivee'
                  }}
                </div>
                <div class="trip-modal__val">
                  {{ formatDateLong(selectedTrip().startDate) }}
                </div>
              </div>
            </div>
            <div class="trip-modal__row">
              <ion-icon name="calendar-outline"></ion-icon>
              <div>
                <div class="trip-modal__label">
                  {{
                    selectedTrip().resourceType === 'CAR' ? 'Retour' : 'Depart'
                  }}
                </div>
                <div class="trip-modal__val">
                  {{ formatDateLong(selectedTrip().endDate) }}
                </div>
              </div>
            </div>
            <div class="trip-modal__row">
              <ion-icon name="time-outline"></ion-icon>
              <div>
                <div class="trip-modal__label">Duree</div>
                <div class="trip-modal__val">
                  {{ getDuration(selectedTrip()) }}
                  {{ selectedTrip().resourceType === 'CAR' ? 'jour' : 'nuit'
                  }}{{ getDuration(selectedTrip()) > 1 ? 's' : '' }}
                </div>
              </div>
            </div>

            @if (
              selectedTrip().resourceType === 'PROPERTY' &&
              selectedTrip().property
            ) {
              <div class="trip-modal__row">
                <ion-icon name="time-outline"></ion-icon>
                <div>
                  <div class="trip-modal__label">Horaires</div>
                  <div class="trip-modal__val">
                    Arrivee a partir de
                    {{ selectedTrip().property.checkinTime || '14:00' }} .
                    Depart avant
                    {{ selectedTrip().property.checkoutTime || '11:00' }}
                  </div>
                </div>
              </div>
            }

            @if (selectedTrip().property?.city || selectedTrip().car?.city) {
              <div class="trip-modal__row">
                <ion-icon name="location-outline"></ion-icon>
                <div>
                  <div class="trip-modal__label">Localisation</div>
                  <div class="trip-modal__val">
                    {{
                      selectedTrip().property?.neighborhood
                        ? selectedTrip().property.neighborhood + ', '
                        : ''
                    }}{{
                      selectedTrip().property?.city || selectedTrip().car?.city
                    }}
                  </div>
                </div>
              </div>
            }

            <div class="trip-modal__divider"></div>
            <div class="trip-modal__price-row">
              <span>Prix de base</span
              ><span>{{
                selectedTrip().basePrice | currencyFormat: 'XAF'
              }}</span>
            </div>
            @if (selectedTrip().cleaningFee > 0) {
              <div class="trip-modal__price-row">
                <span>Frais de nettoyage</span
                ><span>{{
                  selectedTrip().cleaningFee | currencyFormat: 'XAF'
                }}</span>
              </div>
            }
            <div class="trip-modal__price-row">
              <span>Frais de service</span
              ><span>{{
                selectedTrip().platformFee | currencyFormat: 'XAF'
              }}</span>
            </div>
            <div class="trip-modal__divider"></div>
            <div class="trip-modal__price-row trip-modal__price-row--total">
              <span>Total</span
              ><strong>{{
                selectedTrip().totalAmount | currencyFormat: 'XAF'
              }}</strong>
            </div>

            <div class="trip-modal__actions">
              @if (selectedTrip().status === 'PENDING') {
                <button
                  class="trip-modal__btn trip-modal__btn--primary"
                  (click)="payNow($event, selectedTrip())"
                >
                  <ion-icon name="card-outline"></ion-icon> Payer maintenant
                </button>
              }
              @if (selectedTrip().property?.slug) {
                <button
                  class="trip-modal__btn trip-modal__btn--secondary"
                  [routerLink]="['/properties', selectedTrip().property.slug]"
                  (click)="selectedTrip.set(null)"
                >
                  <ion-icon name="eye-outline"></ion-icon> Voir la propriete
                </button>
              }
              @if (selectedTrip().car?.slug) {
                <button
                  class="trip-modal__btn trip-modal__btn--secondary"
                  [routerLink]="['/cars', selectedTrip().car.slug]"
                  (click)="selectedTrip.set(null)"
                >
                  <ion-icon name="eye-outline"></ion-icon> Voir le vehicule
                </button>
              }
              @if (canCancel(selectedTrip())) {
                <button
                  class="trip-modal__btn trip-modal__btn--danger"
                  (click)="cancelTrip(selectedTrip())"
                >
                  <ion-icon name="close-circle-outline"></ion-icon> Annuler la
                  reservation
                </button>
              }
              <button
                class="trip-modal__btn trip-modal__btn--whatsapp"
                (click)="contactWhatsApp(selectedTrip())"
              >
                Contacter via WhatsApp
              </button>
            </div>
          </div>
        </div>
      }

      <div class="sr-tabbar">
        <div class="sr-tabbar__item" [routerLink]="['/']">
          <ion-icon name="home-outline"></ion-icon><span>Accueil</span>
        </div>
        <div class="sr-tabbar__item" [routerLink]="['/search']">
          <ion-icon name="search-outline"></ion-icon><span>Explorer</span>
        </div>
        <div class="sr-tabbar__item sr-tabbar__item--active">
          <ion-icon name="calendar-outline"></ion-icon><span>Voyages</span>
        </div>
        <div class="sr-tabbar__item" [routerLink]="['/app/messages']">
          <ion-icon name="chatbubble-outline"></ion-icon><span>Messages</span>
        </div>
        <div class="sr-tabbar__item" [routerLink]="['/auth/login']">
          <ion-icon name="person-outline"></ion-icon><span>Profil</span>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: #f5f5f5;
      }
      .trips-page {
        padding-bottom: 80px;
      }
      .trips-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 52px 16px 16px;
        background: #fff;
        border-bottom: 1px solid #eee;
      }
      .trips-title {
        font-size: 22px;
        font-weight: 700;
        color: #1a1a2e;
        margin: 0;
      }
      .trips-new-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        background: #e85d24;
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .trips-filters {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 12px 16px;
        background: #fff;
        border-bottom: 1px solid #eee;
        scrollbar-width: none;
      }
      .trips-filters::-webkit-scrollbar {
        display: none;
      }
      .filter-chip {
        padding: 6px 16px;
        border-radius: 20px;
        border: 1.5px solid #eee;
        background: #fff;
        font-size: 12px;
        font-weight: 500;
        color: #555;
        white-space: nowrap;
        cursor: pointer;
        flex-shrink: 0;
      }
      .filter-chip--active {
        background: #1a1a2e;
        color: #fff;
        border-color: #1a1a2e;
      }
      .trips-loading {
        display: flex;
        justify-content: center;
        padding: 48px;
      }
      .trips-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 64px 24px;
        gap: 12px;
        color: #888;
      }
      .trips-empty ion-icon {
        font-size: 48px;
        color: #ddd;
      }
      .trips-empty p {
        font-size: 15px;
        margin: 0;
      }
      .trips-explore-btn {
        background: #e85d24;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 8px;
      }
      .trips-list {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .trip-card {
        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        cursor: pointer;
        display: flex;
        flex-direction: column;
      }
      .trip-card__img {
        height: 160px;
        position: relative;
        overflow: hidden;
        background: #eee;
      }
      .trip-card__img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .trip-card__type {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 8px;
        padding: 4px 8px;
        font-size: 14px;
        display: flex;
        align-items: center;
      }
      .trip-card__body {
        padding: 14px 16px;
      }
      .trip-card__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
        gap: 8px;
      }
      .trip-card__title {
        font-size: 15px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0;
        flex: 1;
      }
      .trip-card__status {
        display: flex;
        align-items: center;
        gap: 4px;
        border-radius: 20px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }
      .status-pending {
        background: #fef3c7;
        color: #d97706;
      }
      .status-payment_pending {
        background: #dbeafe;
        color: #2563eb;
      }
      .status-confirmed {
        background: #d1fae5;
        color: #059669;
      }
      .status-active {
        background: #d1fae5;
        color: #059669;
      }
      .status-completed {
        background: #f3f4f6;
        color: #6b7280;
      }
      .status-cancelled {
        background: #fee2e2;
        color: #dc2626;
      }
      .trip-card__dates {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #666;
        margin-bottom: 10px;
      }
      .trip-card__dates ion-icon {
        font-size: 14px;
        color: #e85d24;
      }
      .trip-card__duration {
        color: #888;
      }
      .trip-card__footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .trip-card__footer strong {
        font-size: 16px;
        font-weight: 700;
        color: #1a1a2e;
      }
      .trip-card__ref {
        font-size: 11px;
        color: #aaa;
      }
      .trip-card__pay-btn {
        width: 100%;
        margin-top: 12px;
        background: #e85d24;
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 12px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .trip-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 199;
      }
      .trip-modal {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
        border-radius: 20px 20px 0 0;
        z-index: 200;
        max-height: 90vh;
        overflow-y: auto;
        padding-bottom: env(safe-area-inset-bottom, 20px);
      }
      .trip-modal__handle {
        width: 36px;
        height: 4px;
        border-radius: 2px;
        background: #ddd;
        margin: 12px auto 0;
      }
      .trip-modal__close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #f5f5f5;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }
      .trip-modal__img {
        height: 180px;
        position: relative;
        overflow: hidden;
      }
      .trip-modal__img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .trip-modal__status {
        position: absolute;
        bottom: 12px;
        left: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 600;
      }
      .trip-modal__body {
        padding: 16px 20px;
      }
      .trip-modal__title {
        font-size: 18px;
        font-weight: 700;
        color: #1a1a2e;
        margin: 0 0 4px;
      }
      .trip-modal__ref {
        font-size: 12px;
        color: #aaa;
        margin-bottom: 12px;
      }
      .trip-modal__divider {
        height: 1px;
        background: #f0f0f0;
        margin: 12px 0;
      }
      .trip-modal__row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 12px;
      }
      .trip-modal__row ion-icon {
        font-size: 18px;
        color: #e85d24;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .trip-modal__label {
        font-size: 11px;
        color: #888;
      }
      .trip-modal__val {
        font-size: 14px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .trip-modal__price-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #555;
        margin-bottom: 8px;
      }
      .trip-modal__price-row--total {
        font-size: 16px;
        color: #1a1a2e;
      }
      .trip-modal__price-row--total strong {
        font-weight: 700;
      }
      .trip-modal__actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 16px;
      }
      .trip-modal__btn {
        width: 100%;
        padding: 14px;
        border-radius: 12px;
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .trip-modal__btn--primary {
        background: #e85d24;
        color: #fff;
      }
      .trip-modal__btn--secondary {
        background: #f5f5f5;
        color: #1a1a2e;
      }
      .trip-modal__btn--danger {
        background: #fee2e2;
        color: #dc2626;
      }
      .trip-modal__btn--whatsapp {
        background: #25d366;
        color: #fff;
      }
      .sr-tabbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        background: #fff;
        border-top: 1px solid #eee;
        padding: 8px 0 env(safe-area-inset-bottom, 8px);
        z-index: 100;
      }
      .sr-tabbar__item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        font-size: 10px;
        color: #888;
        cursor: pointer;
        padding: 4px 0;
      }
      .sr-tabbar__item ion-icon {
        font-size: 22px;
      }
      .sr-tabbar__item--active {
        color: #e85d24;
      }
      @media (min-width: 769px) {
        .trips-header {
          padding: 24px 48px;
        }
        .trips-filters {
          padding: 12px 48px;
        }
        .trips-list {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 48px;
        }
        .trip-card {
          flex-direction: row;
        }
        .trip-card__img {
          width: 200px;
          height: auto;
          flex-shrink: 0;
        }
        .trip-card__body {
          flex: 1;
        }
        .trip-modal {
          max-width: 500px;
          left: 50%;
          transform: translate(-50%, 50%);
          border-radius: 16px;
          bottom: 50%;
        }
        .sr-tabbar {
          display: none;
        }
      }
    `,
  ],
})
export class TripsPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  selectedTrip = signal<any>(null);
  trips = signal<any[]>([]);
  isLoading = signal(true);
  activeFilter = 'all';

  filters = [
    { label: 'Toutes', value: 'all' },
    { label: 'En attente', value: 'pending' },
    { label: 'Confirmees', value: 'confirmed' },
    { label: 'En cours', value: 'active' },
    { label: 'Terminees', value: 'completed' },
    { label: 'Annulees', value: 'cancelled' },
  ];

  constructor() {
    addIcons({
      homeOutline,
      carOutline,
      calendarOutline,
      locationOutline,
      timeOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      hourglassOutline,
      cardOutline,
      arrowForwardOutline,
      closeOutline,
      searchOutline,
      chatbubbleOutline,
      personOutline,
      addOutline,
      eyeOutline,
    });
  }

  async ngOnInit() {
    await this.load();
  }
  ionViewWillEnter() {
    this.load();
  }

  async load() {
    this.isLoading.set(true);
    try {
      const result = await this.api.get<any>('bookings');
      this.trips.set(result.data || result || []);
    } catch {
      this.trips.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  filteredTrips() {
    if (this.activeFilter === 'all') return this.trips();
    return this.trips().filter(
      (t) =>
        t.status.toLowerCase() === this.activeFilter ||
        (this.activeFilter === 'pending' && t.status === 'PAYMENT_PENDING'),
    );
  }

  setFilter(value: string) {
    this.activeFilter = value;
  }

  getTripTitle(trip: any): string {
    if (trip.resourceType === 'CAR') {
      return trip.car
        ? `${trip.car.brand} ${trip.car.model} ${trip.car.year}`
        : 'Location de voiture';
    }
    return trip.property?.title || 'Sejour';
  }

  getTripImage(trip: any): string {
    if (trip.resourceType === 'CAR') {
      return (
        trip.car?.coverImageUrl ||
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
      );
    }
    return (
      trip.property?.coverImageUrl ||
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'
    );
  }

  getDuration(trip: any): number {
    const diff = Math.ceil(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return trip.resourceType === 'CAR' ? Math.max(diff, 1) : diff;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PAYMENT_PENDING: 'Paiement en cours',
      CONFIRMED: 'Confirmee',
      ACTIVE: 'En cours',
      COMPLETED: 'Terminee',
      CANCELLED: 'Annulee',
      REJECTED: 'Refusee',
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      PENDING: 'hourglass-outline',
      PAYMENT_PENDING: 'card-outline',
      CONFIRMED: 'checkmark-circle-outline',
      ACTIVE: 'checkmark-circle-outline',
      COMPLETED: 'checkmark-circle-outline',
      CANCELLED: 'close-circle-outline',
      REJECTED: 'close-circle-outline',
    };
    return icons[status] || 'hourglass-outline';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  formatDateLong(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  viewTrip(trip: any) {
    this.selectedTrip.set(trip);
  }

  payNow(event: Event, trip: any) {
    event.stopPropagation();
    this.router.navigate(['/app/payment'], {
      queryParams: { booking_id: trip.id, total: trip.totalAmount },
    });
  }

  canCancel(trip: any): boolean {
    return ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED'].includes(trip.status);
  }

  async cancelTrip(trip: any) {
    if (!confirm('Voulez-vous annuler cette reservation ?')) return;
    try {
      await this.api.patch(`bookings/${trip.id}/cancel`, {
        reason: 'Annule par le client',
      });
      await this.load();
      this.selectedTrip.set(null);
    } catch (err: any) {
      alert(err?.error?.error?.message || "Erreur lors de l'annulation");
    }
  }

  contactWhatsApp(trip: any) {
    const title = this.getTripTitle(trip);
    const ref = trip.id.substring(0, 8).toUpperCase();
    const msg =
      'Bonjour, je vous contacte concernant ma reservation StayRide.\nReference: ' +
      ref +
      '\nBien: ' +
      title;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  }
}
