import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { FormsModule } from '@angular/forms';
import {
  homeOutline,
  peopleOutline,
  cardOutline,
  calendarOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  statsChartOutline,
  cashOutline,
  carOutline,
  alertCircleOutline,
  refreshOutline,
  eyeOutline,
  createOutline,
  trashOutline,
  chevronDownOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonIcon,
    IonSpinner,
    CurrencyFormatPipe,
  ],
  template: `
    <ion-content>
      <div class="admin-page">
        <!-- Header -->
        <div class="admin-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <button class="admin-back" (click)="goHome()">
              <ion-icon name="arrow-back-outline"></ion-icon>
            </button>
            <div>
              <h1 class="admin-title">Dashboard Admin</h1>
              <p class="admin-sub">StayRide Cameroun</p>
            </div>
          </div>
          <button class="admin-refresh" (click)="load()">
            <ion-icon name="refresh-outline"></ion-icon>
          </button>
        </div>

        <!-- Tabs -->
        <div class="admin-tabs">
          @for (tab of tabs; track tab.value) {
            <button
              class="admin-tab"
              [class.admin-tab--active]="activeTab === tab.value"
              (click)="activeTab = tab.value; onTabChange(tab.value)"
            >
              <ion-icon [name]="tab.icon"></ion-icon>
              {{ tab.label }}
              @if (tab.value === 'payments' && pendingPayments().length > 0) {
                <span class="tab-badge">{{ pendingPayments().length }}</span>
              }
            </button>
          }
        </div>

        @if (isLoading()) {
          <div class="admin-loading">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
        } @else {
          <!-- VUE D'ENSEMBLE -->
          @if (activeTab === 'stats') {
            <div class="admin-section">
              <div class="stats-grid">
                <div class="stat-card">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <div class="stat-card__val">{{ stats().totalBookings }}</div>
                  <div class="stat-card__label">Réservations</div>
                </div>
                <div class="stat-card stat-card--orange">
                  <ion-icon name="cash-outline"></ion-icon>
                  <div class="stat-card__val">
                    {{ stats().totalRevenue | currencyFormat: 'XAF' }}
                  </div>
                  <div class="stat-card__label">Revenus totaux</div>
                </div>
                <div class="stat-card">
                  <ion-icon name="people-outline"></ion-icon>
                  <div class="stat-card__val">{{ stats().totalUsers }}</div>
                  <div class="stat-card__label">Utilisateurs</div>
                </div>
                <div class="stat-card stat-card--green">
                  <ion-icon name="home-outline"></ion-icon>
                  <div class="stat-card__val">
                    {{ stats().totalProperties }}
                  </div>
                  <div class="stat-card__label">Propriétés</div>
                </div>
                <div class="stat-card stat-card--blue">
                  <ion-icon name="car-outline"></ion-icon>
                  <div class="stat-card__val">{{ stats().totalCars }}</div>
                  <div class="stat-card__label">Voitures</div>
                </div>
                <div class="stat-card stat-card--yellow">
                  <ion-icon name="card-outline"></ion-icon>
                  <div class="stat-card__val">
                    {{ pendingPayments().length }}
                  </div>
                  <div class="stat-card__label">Paiements en attente</div>
                </div>
              </div>

              @if (pendingPayments().length > 0) {
                <div class="alert-banner" (click)="activeTab = 'payments'">
                  <ion-icon name="alert-circle-outline"></ion-icon>
                  {{ pendingPayments().length }} paiement(s) en attente de
                  validation — Cliquez pour valider
                </div>
              }

              <!-- Dernières réservations -->
              <h2 class="section-title">Dernières réservations</h2>
              @for (booking of recentBookings(); track booking.id) {
                <div class="booking-row">
                  <div class="booking-row__info">
                    <div class="booking-row__title">
                      @if (booking.property) {
                        {{ booking.property.title }}
                      } @else if (booking.car) {
                        {{ booking.car.brand }} {{ booking.car.model }}
                      } @else {
                        {{
                          booking.resourceType === 'CAR'
                            ? 'Location voiture'
                            : 'Séjour'
                        }}
                      }
                    </div>
                    <div class="booking-row__sub">
                      {{ formatDate(booking.startDate) }} →
                      {{ formatDate(booking.endDate) }}
                    </div>
                  </div>
                  <div class="booking-row__right">
                    <div class="booking-row__amount">
                      {{ booking.totalAmount | currencyFormat: 'XAF' }}
                    </div>
                    <div
                      class="booking-status"
                      [class]="'status-' + booking.status.toLowerCase()"
                    >
                      {{ getStatusLabel(booking.status) }}
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- PAIEMENTS -->
          @if (activeTab === 'payments') {
            <div class="admin-section">
              <h2 class="section-title">
                Paiements en attente
                @if (pendingPayments().length > 0) {
                  <span class="count-badge">{{
                    pendingPayments().length
                  }}</span>
                }
              </h2>
              @if (pendingPayments().length === 0) {
                <div class="admin-empty">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <p>Aucun paiement en attente</p>
                </div>
              } @else {
                @for (payment of pendingPayments(); track payment.id) {
                  <div class="payment-card">
                    <div class="payment-card__header">
                      <span
                        class="method-badge method-badge--{{
                          payment.method.toLowerCase()
                        }}"
                      >
                        {{ getMethodLabel(payment.method) }}
                      </span>
                      <div class="payment-card__amount">
                        {{ payment.amountExpected | currencyFormat: 'XAF' }}
                      </div>
                    </div>
                    <div class="payment-card__details">
                      <div class="payment-detail">
                        <span class="detail-label">Référence</span>
                        <span class="detail-val">{{ payment.reference }}</span>
                      </div>
                      @if (payment.phoneNumber) {
                        <div class="payment-detail">
                          <span class="detail-label">N° Mobile Money</span>
                          <span
                            class="detail-val"
                            style="font-weight:700;color:#E85D24;"
                            >{{ payment.phoneNumber }}</span
                          >
                        </div>
                      }
                      <div class="payment-detail">
                        <span class="detail-label">Date</span>
                        <span class="detail-val">{{
                          formatDate(payment.createdAt)
                        }}</span>
                      </div>
                      @if (payment.payer) {
                        <div class="payment-detail">
                          <span class="detail-label">Client</span>
                          <span class="detail-val"
                            >{{ payment.payer.firstName }}
                            {{ payment.payer.lastName }}</span
                          >
                        </div>
                        @if (payment.payer.phone) {
                          <div class="payment-detail">
                            <span class="detail-label">Téléphone</span>
                            <span class="detail-val">{{
                              payment.payer.phone
                            }}</span>
                          </div>
                        }
                      }
                      @if (payment.booking) {
                        <div class="payment-detail">
                          <span class="detail-label">Bien réservé</span>
                          <span class="detail-val">
                            @if (payment.booking.property) {
                              {{ payment.booking.property.title }}
                            } @else if (payment.booking.car) {
                              {{ payment.booking.car.brand }}
                              {{ payment.booking.car.model }}
                              {{ payment.booking.car.year }}
                            } @else {
                              {{
                                payment.booking.resourceType === 'CAR'
                                  ? 'Location voiture'
                                  : 'Sejour'
                              }}
                            }
                          </span>
                        </div>
                        <div class="payment-detail">
                          <span class="detail-label">Dates</span>
                          <span class="detail-val"
                            >{{ formatDate(payment.booking.startDate) }} →
                            {{ formatDate(payment.booking.endDate) }}</span
                          >
                        </div>
                        @if (payment.booking.specialRequests) {
                          <div class="payment-detail">
                            <span class="detail-label">Demandes speciales</span>
                            <span class="detail-val">{{
                              payment.booking.specialRequests
                            }}</span>
                          </div>
                        }
                      }
                    </div>
                    <div class="payment-card__actions">
                      <button
                        class="admin-btn admin-btn--success"
                        (click)="confirmPayment(payment)"
                      >
                        <ion-icon name="checkmark-circle-outline"></ion-icon>
                        Confirmer reçu
                      </button>
                      <button
                        class="admin-btn admin-btn--danger"
                        (click)="rejectPayment(payment)"
                      >
                        <ion-icon name="close-circle-outline"></ion-icon>
                        Rejeter
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          }

          <!-- RESERVATIONS -->
          @if (activeTab === 'bookings') {
            <div class="admin-section">
              <!-- Filtre période -->
              <div class="period-filter">
                @for (p of periods; track p.value) {
                  <button
                    class="period-btn"
                    [class.period-btn--active]="selectedPeriod === p.value"
                    (click)="setPeriod(p.value)"
                  >
                    {{ p.label }}
                  </button>
                }
              </div>
              <div class="filter-row">
                <h2 class="section-title">
                  Propriétés ({{ properties().length }})
                </h2>
                <div style="display:flex;gap:8px;">
                  <button
                    class="admin-btn-sm"
                    style="background:#E85D24;color:#fff;border-color:#E85D24;"
                    [routerLink]="['/properties/add']"
                  >
                    + Ajouter
                  </button>
                  <select
                    class="filter-select"
                    [(ngModel)]="propertyFilter"
                    (change)="loadProperties()"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="PUBLISHED">Publiées</option>
                    <option value="DRAFT">Brouillon</option>
                    <option value="SUSPENDED">Suspendues</option>
                  </select>
                </div>
              </div>
              @for (booking of allBookings(); track booking.id) {
                <div class="booking-card">
                  <div class="booking-card__header">
                    <div class="booking-card__type">
                      <ion-icon
                        [name]="
                          booking.resourceType === 'CAR'
                            ? 'car-outline'
                            : 'home-outline'
                        "
                      ></ion-icon>
                      {{
                        booking.resourceType === 'CAR' ? 'Voiture' : 'Propriete'
                      }}
                    </div>
                    <div
                      class="booking-status"
                      [class]="'status-' + booking.status.toLowerCase()"
                    >
                      {{ getStatusLabel(booking.status) }}
                    </div>
                  </div>
                  <div class="booking-card__details">
                    <div class="payment-detail">
                      <span class="detail-label">Référence</span>
                      <span class="detail-val">{{
                        booking.id.substring(0, 8).toUpperCase()
                      }}</span>
                    </div>
                    @if (booking.customer) {
                      <div class="payment-detail">
                        <span class="detail-label">Client</span>
                        <span class="detail-val"
                          >{{ booking.customer.firstName }}
                          {{ booking.customer.lastName }}</span
                        >
                      </div>
                    }
                    @if (booking.customer?.phone) {
                      <div class="payment-detail">
                        <span class="detail-label">Téléphone</span>
                        <span class="detail-val">{{
                          booking.customer.phone
                        }}</span>
                      </div>
                    }
                    @if (booking.customer?.email) {
                      <div class="payment-detail">
                        <span class="detail-label">Email</span>
                        <span class="detail-val">{{
                          booking.customer.email
                        }}</span>
                      </div>
                    }

                    <div class="payment-detail">
                      <span class="detail-label">Bien réservé</span>
                      <span class="detail-val">
                        @if (booking.property) {
                          {{ booking.property.title }}
                        } @else if (booking.car) {
                          {{ booking.car.brand }} {{ booking.car.model }}
                          {{ booking.car.year }}
                        } @else {
                          Non disponible
                        }
                      </span>
                    </div>
                    <div class="payment-detail">
                      <span class="detail-label">Dates</span>
                      <span class="detail-val"
                        >{{ formatDate(booking.startDate) }} →
                        {{ formatDate(booking.endDate) }}</span
                      >
                    </div>
                    <div class="payment-detail">
                      <span class="detail-label">Total</span>
                      <span class="detail-val">{{
                        booking.totalAmount | currencyFormat: 'XAF'
                      }}</span>
                    </div>
                    <div class="payment-detail">
                      <span class="detail-label">Créé le</span>
                      <span class="detail-val">{{
                        formatDate(booking.createdAt)
                      }}</span>
                    </div>
                  </div>
                </div>
              }
              @if (allBookings().length === 0) {
                <div class="admin-empty">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <p>Aucune réservation</p>
                </div>
              }
            </div>
          }

          <!-- PROPRIETES -->
          @if (activeTab === 'properties') {
            <div class="admin-section">
              <div class="filter-row">
                <h2 class="section-title">
                  Propriétés ({{ properties().length }})
                </h2>
                <div style="display:flex;gap:8px;">
                  <button
                    class="admin-btn-sm"
                    style="background:#E85D24;color:#fff;border-color:#E85D24;"
                    [routerLink]="['/properties/add']"
                  >
                    + Ajouter
                  </button>
                  <select
                    class="filter-select"
                    [(ngModel)]="propertyFilter"
                    (change)="loadProperties()"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="PUBLISHED">Publiées</option>
                    <option value="DRAFT">Brouillon</option>
                    <option value="SUSPENDED">Suspendues</option>
                  </select>
                </div>
              </div>
              @for (prop of properties(); track prop.id) {
                <div class="resource-card">
                  <img
                    [src]="
                      prop.coverImageUrl ||
                      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100'
                    "
                    [alt]="prop.title"
                    class="resource-card__img"
                  />
                  <div class="resource-card__info">
                    <div class="resource-card__title">{{ prop.title }}</div>
                    <div class="resource-card__sub">
                      {{ prop.city }} · {{ prop.type }}
                    </div>
                    <div class="resource-card__price">
                      {{ prop.pricePerNight | currencyFormat: 'XAF' }}/nuit
                    </div>
                    <span
                      class="status-badge status-badge--{{
                        prop.status.toLowerCase()
                      }}"
                      >{{ prop.status }}</span
                    >
                  </div>
                  <div class="resource-card__actions">
                    <button class="admin-btn-sm" (click)="toggleProperty(prop)">
                      {{
                        prop.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'
                      }}
                    </button>
                  </div>
                </div>
              }
              @if (properties().length === 0) {
                <div class="admin-empty">
                  <ion-icon name="home-outline"></ion-icon>
                  <p>Aucune propriété</p>
                </div>
              }
            </div>
          }

          <!-- VOITURES -->
          @if (activeTab === 'cars') {
            <div class="admin-section">
              <div class="filter-row">
                <h2 class="section-title">Voitures ({{ cars().length }})</h2>
                <div style="display:flex;gap:8px;">
                  <button
                    class="admin-btn-sm"
                    style="background:#E85D24;color:#fff;border-color:#E85D24;"
                    [routerLink]="['/cars/add']"
                  >
                    + Ajouter
                  </button>
                  <select
                    class="filter-select"
                    [(ngModel)]="carFilter"
                    (change)="loadCars()"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="AVAILABLE">Disponibles</option>
                    <option value="RENTED">Louées</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>
              @for (car of cars(); track car.id) {
                <div class="resource-card">
                  <img
                    [src]="
                      car.coverImageUrl ||
                      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=100'
                    "
                    [alt]="car.brand + ' ' + car.model"
                    class="resource-card__img"
                  />
                  <div class="resource-card__info">
                    <div class="resource-card__title">
                      {{ car.brand }} {{ car.model }} {{ car.year }}
                    </div>
                    <div class="resource-card__sub">
                      {{ car.city }} · {{ car.category }}
                    </div>
                    <div class="resource-card__price">
                      {{ car.pricePerDay | currencyFormat: 'XAF' }}/jour
                    </div>
                    <span
                      class="status-badge status-badge--{{
                        car.status.toLowerCase()
                      }}"
                      >{{ car.status }}</span
                    >
                  </div>
                  <div class="resource-card__actions">
                    <button class="admin-btn-sm" (click)="toggleCar(car)">
                      {{
                        car.status === 'AVAILABLE' ? 'Désactiver' : 'Activer'
                      }}
                    </button>
                  </div>
                </div>
              }
              @if (cars().length === 0) {
                <div class="admin-empty">
                  <ion-icon name="car-outline"></ion-icon>
                  <p>Aucune voiture</p>
                </div>
              }
            </div>
          }

          <!-- UTILISATEURS -->
          @if (activeTab === 'users') {
            <div class="admin-section">
              <div class="filter-row">
                <h2 class="section-title">
                  Utilisateurs ({{ users().length }})
                </h2>
                <select
                  class="filter-select"
                  [(ngModel)]="userFilter"
                  (change)="loadUsers()"
                >
                  <option value="">Tous les rôles</option>
                  <option value="CUSTOMER">Clients</option>
                  <option value="OWNER">Propriétaires</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
              @for (user of users(); track user.id) {
                <div class="user-card">
                  <div class="user-card__avatar">
                    {{ user.firstName?.charAt(0)
                    }}{{ user.lastName?.charAt(0) }}
                  </div>
                  <div class="user-card__info">
                    <div class="user-card__name">
                      {{ user.firstName }} {{ user.lastName }}
                    </div>
                    <div class="user-card__email">{{ user.email }}</div>
                    @if (user.phone) {
                      <div class="user-card__phone">{{ user.phone }}</div>
                    }
                    <div class="user-card__meta">
                      <span
                        class="role-badge role-badge--{{
                          user.role.toLowerCase()
                        }}"
                        >{{ user.role }}</span
                      >
                      <span
                        [class]="
                          user.isActive ? 'active-badge' : 'inactive-badge'
                        "
                      >
                        {{ user.isActive ? 'Actif' : 'Inactif' }}
                      </span>
                    </div>
                  </div>
                  <div class="user-card__actions">
                    <button class="admin-btn-sm" (click)="toggleUser(user)">
                      {{ user.isActive ? 'Désactiver' : 'Activer' }}
                    </button>
                    <button
                      class="admin-btn-sm admin-btn-sm--role"
                      (click)="changeRole(user)"
                    >
                      Rôle
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: #f5f5f5;
      }
      .admin-page {
        padding-bottom: 32px;
      }

      .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 52px 16px 16px;
        background: #1a1a2e;
      }
      .admin-title {
        font-size: 22px;
        font-weight: 700;
        color: #fff;
        margin: 0;
      }
      .admin-sub {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
        margin: 4px 0 0;
      }
      .admin-refresh {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .admin-tabs {
        display: flex;
        background: #fff;
        border-bottom: 1px solid #eee;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .admin-tabs::-webkit-scrollbar {
        display: none;
      }
      .admin-tab {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
        padding: 12px 14px;
        border: none;
        background: transparent;
        font-size: 12px;
        color: #888;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        position: relative;
      }
      .admin-tab ion-icon {
        font-size: 16px;
      }
      .admin-tab--active {
        color: #e85d24;
        border-bottom-color: #e85d24;
        font-weight: 600;
      }
      .tab-badge {
        position: absolute;
        top: 6px;
        right: 4px;
        background: #e85d24;
        color: #fff;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        font-size: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .admin-loading {
        display: flex;
        justify-content: center;
        padding: 48px;
      }
      .admin-section {
        padding: 16px;
      }
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .count-badge {
        background: #e85d24;
        color: #fff;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 12px;
      }

      .filter-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .filter-row .section-title {
        margin: 0;
      }
      .filter-select {
        border: 1.5px solid #eee;
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 12px;
        color: #555;
        background: #fff;
        outline: none;
      }

      /* Stats */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      }
      .stat-card {
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
        text-align: center;
      }
      .stat-card ion-icon {
        font-size: 28px;
        color: #1a1a2e;
        margin-bottom: 8px;
        display: block;
      }
      .stat-card--orange ion-icon {
        color: #e85d24;
      }
      .stat-card--green ion-icon {
        color: #4caf50;
      }
      .stat-card--blue ion-icon {
        color: #2563eb;
      }
      .stat-card--yellow ion-icon {
        color: #d97706;
      }
      .stat-card__val {
        font-size: 18px;
        font-weight: 700;
        color: #1a1a2e;
      }
      .stat-card__label {
        font-size: 11px;
        color: #888;
        margin-top: 4px;
      }

      .alert-banner {
        background: #fef3c7;
        color: #d97706;
        border-radius: 10px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 16px;
        cursor: pointer;
      }

      /* Booking row */
      .booking-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fff;
        border-radius: 10px;
        padding: 12px 14px;
        margin-bottom: 8px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      }
      .booking-row__title {
        font-size: 13px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .booking-row__sub {
        font-size: 11px;
        color: #888;
        margin-top: 2px;
      }
      .booking-row__right {
        text-align: right;
      }
      .booking-row__amount {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a2e;
      }

      /* Booking card */
      .booking-card {
        background: #fff;
        border-radius: 12px;
        padding: 14px;
        margin-bottom: 10px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
      }
      .booking-card__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .booking-card__type {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .booking-card__type ion-icon {
        font-size: 16px;
        color: #e85d24;
      }

      /* Status */
      .booking-status {
        border-radius: 20px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
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

      /* Payment card */
      .payment-card {
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
        border-left: 4px solid #e85d24;
      }
      .payment-card__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .payment-card__amount {
        font-size: 20px;
        font-weight: 700;
        color: #1a1a2e;
      }
      .payment-card__details {
        margin-bottom: 12px;
      }
      .payment-card__actions {
        display: flex;
        gap: 8px;
      }

      .payment-detail {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        padding: 4px 0;
        border-bottom: 1px solid #f5f5f5;
      }
      .detail-label {
        color: #888;
      }
      .detail-val {
        color: #1a1a2e;
        font-weight: 500;
      }

      .method-badge {
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
      }
      .method-badge--orange_money {
        background: rgba(255, 102, 0, 0.1);
        color: #ff6600;
      }
      .method-badge--mtn_momo {
        background: rgba(255, 204, 0, 0.15);
        color: #b8860b;
      }
      .method-badge--cash {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }
      .method-badge--stripe {
        background: rgba(99, 91, 255, 0.1);
        color: #635bff;
      }

      .admin-btn {
        flex: 1;
        padding: 10px;
        border-radius: 8px;
        border: none;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .admin-btn--success {
        background: #d1fae5;
        color: #059669;
      }
      .admin-btn--danger {
        background: #fee2e2;
        color: #dc2626;
      }

      .admin-btn-sm {
        padding: 6px 12px;
        border-radius: 8px;
        border: 1.5px solid #eee;
        background: #fff;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        color: #555;
        white-space: nowrap;
        display: block;
        margin-bottom: 4px;
      }
      .admin-btn-sm--role {
        border-color: #e85d24;
        color: #e85d24;
      }

      /* Resource card */
      .resource-card {
        background: #fff;
        border-radius: 12px;
        padding: 12px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
      }
      .resource-card__img {
        width: 64px;
        height: 64px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .resource-card__info {
        flex: 1;
        min-width: 0;
      }
      .resource-card__title {
        font-size: 13px;
        font-weight: 600;
        color: #1a1a2e;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .resource-card__sub {
        font-size: 11px;
        color: #888;
        margin: 2px 0;
      }
      .resource-card__price {
        font-size: 12px;
        font-weight: 600;
        color: #e85d24;
        margin-bottom: 4px;
      }
      .resource-card__actions {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .status-badge {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
      }
      .status-badge--published,
      .status-badge--available {
        background: #d1fae5;
        color: #059669;
      }
      .status-badge--draft {
        background: #f3f4f6;
        color: #6b7280;
      }
      .status-badge--suspended {
        background: #fee2e2;
        color: #dc2626;
      }
      .status-badge--rented {
        background: #dbeafe;
        color: #2563eb;
      }
      .status-badge--maintenance {
        background: #fef3c7;
        color: #d97706;
      }

      /* User card */
      .user-card {
        background: #fff;
        border-radius: 12px;
        padding: 14px;
        margin-bottom: 10px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
      }
      .user-card__avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #e85d24;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 600;
        flex-shrink: 0;
      }
      .user-card__info {
        flex: 1;
        min-width: 0;
      }
      .user-card__name {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a2e;
      }
      .user-card__email {
        font-size: 12px;
        color: #888;
        margin: 2px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-card__phone {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }
      .user-card__meta {
        display: flex;
        gap: 6px;
        margin-top: 4px;
      }
      .user-card__actions {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .role-badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
      }
      .role-badge--customer {
        background: #dbeafe;
        color: #2563eb;
      }
      .role-badge--owner {
        background: #fef3c7;
        color: #d97706;
      }
      .role-badge--admin {
        background: #fee2e2;
        color: #dc2626;
      }
      .role-badge--concierge {
        background: #f3e8ff;
        color: #7c3aed;
      }
      .active-badge {
        font-size: 10px;
        color: #059669;
        background: #d1fae5;
        padding: 2px 8px;
        border-radius: 4px;
      }
      .inactive-badge {
        font-size: 10px;
        color: #dc2626;
        background: #fee2e2;
        padding: 2px 8px;
        border-radius: 4px;
      }

      .admin-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
        gap: 12px;
        color: #888;
      }
      .admin-empty ion-icon {
        font-size: 48px;
        color: #ddd;
      }

      @media (min-width: 769px) {
        .admin-header {
          padding: 24px 48px;
        }
        .admin-section {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px 48px;
        }
        .stats-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      .admin-back {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .period-filter {
        display: flex;
        gap: 6px;
        margin-bottom: 16px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .period-filter::-webkit-scrollbar {
        display: none;
      }
      .period-btn {
        padding: 6px 14px;
        border-radius: 20px;
        border: 1.5px solid #eee;
        background: #fff;
        font-size: 12px;
        color: #555;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .period-btn--active {
        background: #1a1a2e;
        color: #fff;
        border-color: #1a1a2e;
      }
    `,
  ],
})
export class AdminDashboardPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isLoading = signal(true);
  activeTab = 'stats';

  stats = signal({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProperties: 0,
    totalCars: 0,
  });
  pendingPayments = signal<any[]>([]);
  recentBookings = signal<any[]>([]);
  allBookings = signal<any[]>([]);
  users = signal<any[]>([]);
  properties = signal<any[]>([]);
  cars = signal<any[]>([]);

  bookingFilter = '';
  propertyFilter = '';
  carFilter = '';
  userFilter = '';

  selectedPeriod = 'all';
  periods = [
    { label: 'Tout', value: 'all' },
    { label: "Aujourd'hui", value: 'today' },
    { label: 'Cette semaine', value: 'week' },
    { label: 'Ce mois', value: 'month' },
    { label: 'Cette année', value: 'year' },
  ];

  tabs = [
    { label: "Vue d'ensemble", value: 'stats', icon: 'stats-chart-outline' },
    { label: 'Paiements', value: 'payments', icon: 'card-outline' },
    { label: 'Réservations', value: 'bookings', icon: 'calendar-outline' },
    { label: 'Propriétés', value: 'properties', icon: 'home-outline' },
    { label: 'Voitures', value: 'cars', icon: 'car-outline' },
    { label: 'Utilisateurs', value: 'users', icon: 'people-outline' },
  ];

  constructor() {
    addIcons({
      homeOutline,
      peopleOutline,
      cardOutline,
      calendarOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      statsChartOutline,
      cashOutline,
      carOutline,
      alertCircleOutline,
      refreshOutline,
      eyeOutline,
      createOutline,
      trashOutline,
      chevronDownOutline,
      arrowBackOutline,
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      if (params['tab']) this.activeTab = params['tab'];
    });
    await this.load();
    if (this.activeTab === 'properties') await this.loadProperties();
  }

  async load() {
    this.isLoading.set(true);
    try {
      await Promise.all([
        this.loadStats(),
        this.loadPendingPayments(),
        this.loadRecentBookings(),
      ]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onTabChange(tab: string) {
    if (tab === 'bookings') await this.loadBookings();
    if (tab === 'users') await this.loadUsers();
    if (tab === 'properties') await this.loadProperties();
    if (tab === 'cars') await this.loadCars();
  }
  async loadStats() {
    try {
      const dateFilter = this.getDateFilter();
      const dateParams = dateFilter
        ? `&from=${dateFilter.from}&to=${dateFilter.to}`
        : '';

      const [
        allBookings,
        allUsers,
        allProperties,
        allCars,
        confirmedPayments,
        pendingList,
        periodBookings,
      ] = await Promise.all([
        this.api.get<any>('bookings?perPage=1000').catch(() => []),
        this.api.get<any>('users/admin/all?perPage=1000').catch(() => []),
        this.api.get<any>('properties?perPage=1000').catch(() => []),
        this.api.get<any>('cars?perPage=1000').catch(() => []),
        this.api
          .get<any>(`payments/admin/all?status=PAID&perPage=1000${dateParams}`)
          .catch(() => []),
        this.api
          .get<any>('payments/admin/all?status=PENDING&perPage=1000')
          .catch(() => []),
        dateParams
          ? this.api
              .get<any>(`bookings?perPage=1000${dateParams}`)
              .catch(() => [])
          : Promise.resolve([]),
      ]);

      const getList = (result: any) =>
        Array.isArray(result) ? result : result?.data || [];
      const getCount = (result: any) => getList(result).length;

      const confirmedList = getList(confirmedPayments);
      const totalRevenue = confirmedList.reduce(
        (sum: number, p: any) =>
          sum + Number(p.amountReceived || p.amountExpected || 0),
        0,
      );

      // Bookings de la période ou tous
      const bookingsForPeriod = dateParams
        ? getList(periodBookings)
        : getList(allBookings);

      this.stats.set({
        totalBookings: bookingsForPeriod.length,
        totalRevenue,
        totalUsers: getCount(allUsers),
        totalProperties: getCount(allProperties),
        totalCars: getCount(allCars),
      });

      // Mettre à jour les dernières réservations avec la période
      this.recentBookings.set(bookingsForPeriod.slice(0, 5));
      this.pendingPayments.set(getList(pendingList));
    } catch (err) {
      console.error('stats error:', err);
    }
  }

  async loadPendingPayments() {
    try {
      const result = await this.api.get<any>(
        'payments/admin/all?status=PENDING&perPage=1000',
      );
      console.log('pending payments:', JSON.stringify(result[0]));
      this.pendingPayments.set(
        Array.isArray(result) ? result : result?.data || [],
      );
    } catch {
      this.pendingPayments.set([]);
    }
  }

  async loadRecentBookings() {
    try {
      const result = await this.api.get<any>('bookings?perPage=5');
      this.recentBookings.set(
        Array.isArray(result) ? result : result?.data || [],
      );
    } catch {
      this.recentBookings.set([]);
    }
  }

  async loadUsers() {
    try {
      const url = this.userFilter
        ? `users/admin/all?role=${this.userFilter}&perPage=50`
        : 'users/admin/all?perPage=50';
      const result = await this.api.get<any>(url);
      this.users.set(Array.isArray(result) ? result : result?.data || []);
    } catch {
      this.users.set([]);
    }
  }
  async loadProperties() {
    try {
      const url = this.propertyFilter
        ? `properties/admin/all?status=${this.propertyFilter}`
        : 'properties/admin/all';
      const result = await this.api.get<any>(url);
      this.properties.set(Array.isArray(result) ? result : result?.data || []);
    } catch {
      this.properties.set([]);
    }
  }

  async loadCars() {
    try {
      const url = this.carFilter
        ? `cars/admin/all?status=${this.carFilter}`
        : 'cars/admin/all';
      const result = await this.api.get<any>(url);
      this.cars.set(Array.isArray(result) ? result : result?.data || []);
    } catch {
      this.cars.set([]);
    }
  }

  async loadBookings() {
    try {
      const dateFilter = this.getDateFilter();
      const dateParams = dateFilter
        ? `&from=${dateFilter.from}&to=${dateFilter.to}`
        : '';
      const url = this.bookingFilter
        ? `bookings?status=${this.bookingFilter}&perPage=50${dateParams}`
        : `bookings?perPage=50${dateParams}`;
      const result = await this.api.get<any>(url);
      const list = Array.isArray(result) ? result : result?.data || [];
      console.log('booking[0]:', JSON.stringify(list[0]));
      this.allBookings.set(list);
    } catch {
      this.allBookings.set([]);
    }
  }

  async confirmPayment(payment: any) {
    const reference =
      prompt('Référence de confirmation :') || payment.reference;
    if (!reference) return;
    try {
      await this.api.patch(`payments/admin/${payment.id}/confirm`, {
        amount_received: payment.amountExpected,
        reference,
        payment_date: new Date().toISOString(),
        notes: 'Confirmé par admin',
      });
      await this.loadPendingPayments();
      alert('Paiement confirmé ! La réservation est maintenant active.');
    } catch (err: any) {
      alert(err?.error?.error?.message || 'Erreur lors de la confirmation');
    }
  }

  async rejectPayment(payment: any) {
    const reason = prompt('Raison du rejet :') || 'Paiement non reçu';
    try {
      await this.api.patch(`payments/admin/${payment.id}/reject`, { reason });
      await this.loadPendingPayments();
      alert('Paiement rejeté');
    } catch (err: any) {
      alert(err?.error?.error?.message || 'Erreur');
    }
  }

  async toggleUser(user: any) {
    try {
      await this.api.patch(`users/${user.id}/toggle-active`, {});
      await this.loadUsers();
    } catch (err: any) {
      alert(err?.error?.error?.message || 'Erreur');
    }
  }

  async changeRole(user: any) {
    const roles = ['CUSTOMER', 'OWNER', 'CONCIERGE', 'ADMIN'];
    const newRole = prompt(
      `Changer le rôle de ${user.firstName} (actuel: ${user.role})\nRôles: CUSTOMER, OWNER, CONCIERGE, ADMIN`,
    );
    if (!newRole || !roles.includes(newRole.toUpperCase())) return;
    try {
      await this.api.patch(`users/${user.id}/role`, {
        role: newRole.toUpperCase(),
      });
      await this.loadUsers();
    } catch (err: any) {
      alert(err?.error?.error?.message || 'Erreur');
    }
  }

  async toggleProperty(prop: any) {
    const newStatus = prop.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await this.api.patch(`properties/${prop.id}/status`, {
        status: newStatus,
      });
      await this.loadProperties();
    } catch (err: any) {
      alert(err?.error?.error?.message || 'Erreur');
    }
  }

  async toggleCar(car: any) {
    const newStatus = car.status === 'AVAILABLE' ? 'SUSPENDED' : 'AVAILABLE';
    try {
      await this.api.patch(`cars/${car.id}/status`, { status: newStatus });
      await this.loadCars();
    } catch (err: any) {
      alert(err?.error?.error?.message || 'Erreur');
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PAYMENT_PENDING: 'Paiement en cours',
      CONFIRMED: 'Confirmée',
      ACTIVE: 'En cours',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
      REJECTED: 'Refusée',
    };
    return labels[status] || status;
  }

  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      ORANGE_MONEY: 'Orange Money',
      MTN_MOMO: 'MTN MoMo',
      CASH: 'Espèces',
      STRIPE: 'Carte',
      PAYPAL: 'PayPal',
    };
    return labels[method] || method;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  goHome() {
    this.router.navigate(['/']);
  }
  setPeriod(period: string) {
    this.selectedPeriod = period;
    this.loadStats();
    if (this.activeTab === 'bookings') this.loadBookings();
  }

  getDateFilter(): { from: string; to: string } | null {
    const todayStr = new Date().toLocaleDateString('fr-CA', {
      timeZone: 'Africa/Douala',
    });
    const now = new Date();

    if (this.selectedPeriod === 'today') {
      return { from: todayStr, to: todayStr };
    }
    if (this.selectedPeriod === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      const startStr = start.toLocaleDateString('fr-CA', {
        timeZone: 'Africa/Douala',
      });
      return { from: startStr, to: todayStr };
    }
    if (this.selectedPeriod === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const startStr = start.toLocaleDateString('fr-CA', {
        timeZone: 'Africa/Douala',
      });
      return { from: startStr, to: todayStr };
    }
    if (this.selectedPeriod === 'year') {
      return { from: `${new Date().getFullYear()}-01-01`, to: todayStr };
    }
    return null;
  }
}
