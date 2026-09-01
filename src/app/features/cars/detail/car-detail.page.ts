import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  shareOutline,
  heartOutline,
  heart,
  locationOutline,
  starOutline,
  peopleOutline,
  flashOutline,
  shieldCheckmarkOutline,
  keyOutline,
  informationCircleOutline,
  imagesOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
  carOutline,
  speedometerOutline,
  colorPaletteOutline,
  calendarOutline,
} from 'ionicons/icons';
import { CarsService } from '../../../core/services/cars.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { AuthState } from '../../../core/auth/auth.state';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSpinner, CurrencyFormatPipe],
  template: `
    <ion-content>
      @if (isLoading()) {
        <div class="sr-loading">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      } @else if (car()) {
        <!-- Photo grid -->
        <div class="photo-grid">
          <div class="photo-main" (click)="openGallery(0)">
            <img
              [src]="allPhotos()[0]"
              [alt]="car().brand + ' ' + car().model"
            />
          </div>
          <div class="photo-side">
            @for (photo of allPhotos().slice(1, 5); track $index) {
              <div class="photo-small" (click)="openGallery($index + 1)">
                <img [src]="photo" [alt]="car().brand" />
                @if ($index === 3 && allPhotos().length > 5) {
                  <div class="photo-more-overlay">
                    +{{ allPhotos().length - 5 }}
                  </div>
                }
              </div>
            }
          </div>
          <div class="photo-overlay-top">
            <button class="action-btn" (click)="goBack()">
              <ion-icon name="arrow-back-outline"></ion-icon>
            </button>
            <div class="action-group">
              <button class="action-btn" (click)="share()">
                <ion-icon name="share-outline"></ion-icon>
              </button>
              <button
                class="action-btn"
                [class.wishlisted]="isWishlisted()"
                (click)="toggleWishlist()"
              >
                <ion-icon
                  [name]="isWishlisted() ? 'heart' : 'heart-outline'"
                ></ion-icon>
              </button>
            </div>
          </div>
          <button class="show-all-photos" (click)="openGallery(0)">
            <ion-icon name="images-outline"></ion-icon>
            {{ allPhotos().length }} photos
          </button>
        </div>

        <!-- Layout 2 colonnes -->
        <div class="detail-layout">
          <!-- Colonne gauche -->
          <div class="detail-main">
            <div class="sr-section">
              <span class="cat-badge">{{
                getCategoryLabel(car().category)
              }}</span>
              <h1 class="car-title">
                {{ car().brand }} {{ car().model }} {{ car().year }}
              </h1>
              <p class="car-color">{{ car().color }}</p>
              <div class="car-rating">
                <ion-icon name="star-outline" class="star"></ion-icon>
                <strong>{{ car().avgRating | number: '1.1-1' }}</strong>
                <span class="muted">({{ car().reviewCount }} avis)</span>
                <span class="sep">·</span>
                <ion-icon name="location-outline"></ion-icon>
                <span class="muted">{{ car().city }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="sr-section">
              <h2 class="sr-subtitle">Caractéristiques</h2>
              <div class="specs-grid">
                <div class="spec-item">
                  <ion-icon name="people-outline"></ion-icon>
                  <div>
                    <div class="spec-label">Places</div>
                    <div class="spec-value">{{ car().seats }} personnes</div>
                  </div>
                </div>
                <div class="spec-item">
                  <ion-icon name="flash-outline"></ion-icon>
                  <div>
                    <div class="spec-label">Boîte</div>
                    <div class="spec-value">
                      {{ getTransLabel(car().transmission) }}
                    </div>
                  </div>
                </div>
                <div class="spec-item">
                  <ion-icon name="speedometer-outline"></ion-icon>
                  <div>
                    <div class="spec-label">Kilométrage</div>
                    <div class="spec-value">
                      {{ car().mileageKm | number }} km
                    </div>
                  </div>
                </div>
                <div class="spec-item">
                  <ion-icon name="car-outline"></ion-icon>
                  <div>
                    <div class="spec-label">Carburant</div>
                    <div class="spec-value">
                      {{ getFuelLabel(car().fuelType) }}
                    </div>
                  </div>
                </div>
                <div class="spec-item">
                  <ion-icon name="color-palette-outline"></ion-icon>
                  <div>
                    <div class="spec-label">Portes</div>
                    <div class="spec-value">{{ car().doors }} portes</div>
                  </div>
                </div>
                <div class="spec-item">
                  <ion-icon name="information-circle-outline"></ion-icon>
                  <div>
                    <div class="spec-label">Âge minimum</div>
                    <div class="spec-value">{{ car().minDriverAge }} ans</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            @if (car().description) {
              <div class="sr-section">
                <h2 class="sr-subtitle">À propos</h2>
                <p class="car-desc">{{ car().description }}</p>
              </div>
              <div class="divider"></div>
            }

            @if (car().features?.length) {
              <div class="sr-section">
                <h2 class="sr-subtitle">Équipements inclus</h2>
                <div class="features-grid">
                  @for (f of car().features; track f) {
                    <div class="feature-item">
                      <ion-icon
                        name="checkmark-circle-outline"
                        style="color:#4CAF50"
                      ></ion-icon>
                      <span>{{ f }}</span>
                    </div>
                  }
                </div>
              </div>
              <div class="divider"></div>
            }

            <div class="sr-section">
              <h2 class="sr-subtitle">Conditions de location</h2>
              <div class="conditions">
                <div
                  class="condition-item"
                  [class.condition-required]="car().licenseRequired"
                >
                  <ion-icon name="key-outline"></ion-icon>
                  <div>
                    <div class="condition-label">Permis de conduire</div>
                    <div class="condition-value">
                      {{ car().licenseRequired ? 'Obligatoire' : 'Non requis' }}
                    </div>
                  </div>
                </div>
                <div
                  class="condition-item"
                  [class.condition-required]="car().depositRequired"
                >
                  <ion-icon name="shield-checkmark-outline"></ion-icon>
                  <div>
                    <div class="condition-label">Caution</div>
                    <div class="condition-value">
                      {{
                        car().depositRequired
                          ? (car().depositAmount | currencyFormat: 'XAF') +
                            ' (remboursable)'
                          : 'Aucune caution'
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne droite — Widget réservation (desktop) -->
          <div class="detail-sidebar">
            <div class="booking-panel">
              <div class="bw-price">
                <strong>{{ car().pricePerDay | currencyFormat: 'XAF' }}</strong>
                <span>/jour</span>
              </div>

              <!-- Dates -->
              <div class="bw-dates">
                <div class="bw-dates-row">
                  <div
                    class="bw-date-field"
                    [class.bw-date-field--active]="dateStep === 'checkin'"
                    (click)="openDatePicker('checkin')"
                  >
                    <div class="bw-date-label">PRISE EN CHARGE</div>
                    <div class="bw-date-val">
                      {{ checkin ? formatDate(checkin) : 'Ajouter' }}
                    </div>
                  </div>
                  <div class="bw-dates-sep">→</div>
                  <div
                    class="bw-date-field"
                    [class.bw-date-field--active]="dateStep === 'checkout'"
                    (click)="openDatePicker('checkout')"
                  >
                    <div class="bw-date-label">RETOUR</div>
                    <div class="bw-date-val">
                      {{ checkout ? formatDate(checkout) : 'Ajouter' }}
                    </div>
                  </div>
                </div>

                @if (dateStep) {
                  <div class="bw-calendar">
                    <div class="cal-header">
                      <button class="cal-nav" (click)="prevMonth()">‹</button>
                      <span class="cal-month">{{ getMonthLabel() }}</span>
                      <button class="cal-nav" (click)="nextMonth()">›</button>
                    </div>
                    <div class="cal-weekdays">
                      @for (d of weekdays; track d) {
                        <div class="cal-wd">{{ d }}</div>
                      }
                    </div>
                    <div class="cal-grid">
                      @for (day of calendarDays(); track $index) {
                        <div
                          class="cal-day"
                          [class.cal-day--empty]="!day.date"
                          [class.cal-day--past]="day.isPast"
                          [class.cal-day--selected-start]="day.date === checkin"
                          [class.cal-day--selected-end]="day.date === checkout"
                          [class.cal-day--in-range]="day.isInRange"
                          [class.cal-day--today]="day.isToday"
                          (click)="onCalendarDayClick(day)"
                        >
                          {{ day.label }}
                        </div>
                      }
                    </div>
                    @if (checkin && !checkout) {
                      <div class="cal-hint">
                        💡 Même date = 1 jour · Date suivante = 2 jours
                      </div>
                    }
                    @if (checkin && checkout) {
                      <button class="cal-confirm-btn" (click)="dateStep = ''">
                        ✓ {{ getDuration() }} jour{{
                          getDuration() > 1 ? 's' : ''
                        }}
                        sélectionné{{ getDuration() > 1 ? 's' : '' }}
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Récapitulatif -->
              @if (checkin && checkout) {
                <div class="bw-summary">
                  <div class="bw-summary-row">
                    <span
                      >{{ car().pricePerDay | currencyFormat: 'XAF' }} ×
                      {{ getDuration() }} jour{{
                        getDuration() > 1 ? 's' : ''
                      }}</span
                    >
                    <span>{{ getBasePrice() | currencyFormat: 'XAF' }}</span>
                  </div>
                  @if (car().depositRequired) {
                    <div class="bw-summary-row">
                      <span>Caution (remboursable)</span>
                      <span>{{
                        car().depositAmount | currencyFormat: 'XAF'
                      }}</span>
                    </div>
                  }
                  <div class="bw-summary-row">
                    <span>Frais de service (10%)</span>
                    <span>{{ getPlatformFee() | currencyFormat: 'XAF' }}</span>
                  </div>
                  <div class="bw-summary-divider"></div>
                  <div class="bw-summary-total">
                    <span>Total</span>
                    <strong>{{ getTotal() | currencyFormat: 'XAF' }}</strong>
                  </div>
                </div>
              }

              <button
                class="bw-confirm-btn"
                [class.bw-confirm-btn--disabled]="!checkin || !checkout"
                (click)="book()"
              >
                @if (!checkin || !checkout) {
                  Choisir des dates
                } @else {
                  Louer — {{ getTotal() | currencyFormat: 'XAF' }}
                }
              </button>

              @if (checkin && checkout) {
                <p class="bw-no-charge">Vous ne serez pas encore débité</p>
              }
            </div>
          </div>
        </div>

        <!-- Widget mobile sticky -->
        <div class="booking-widget-mobile">
          <div>
            <div class="bwm-price">
              <strong>{{ car().pricePerDay | currencyFormat: 'XAF' }}</strong>
              <span>/jour</span>
            </div>
            @if (checkin && checkout) {
              <div class="bwm-recap">
                {{ getDuration() }} jour{{ getDuration() > 1 ? 's' : '' }} ·
                {{ getTotal() | currencyFormat: 'XAF' }}
              </div>
            }
          </div>
          <button class="bwm-btn" (click)="showBookingWidget = true">
            {{ checkin && checkout ? 'Louer' : 'Choisir des dates' }}
          </button>
        </div>

        <!-- Panel mobile slide-up -->
        @if (showBookingWidget) {
          <div
            class="booking-overlay"
            (click)="showBookingWidget = false"
          ></div>
          <div class="booking-panel-mobile">
            <div class="bpm-handle"></div>
            <button class="bpm-close" (click)="showBookingWidget = false">
              <ion-icon name="close-outline"></ion-icon>
            </button>

            <div class="bw-price">
              <strong>{{ car().pricePerDay | currencyFormat: 'XAF' }}</strong>
              <span>/jour</span>
            </div>

            <div class="bw-dates">
              <div class="bw-dates-row">
                <div
                  class="bw-date-field"
                  [class.bw-date-field--active]="dateStep === 'checkin'"
                  (click)="openDatePicker('checkin')"
                >
                  <div class="bw-date-label">PRISE EN CHARGE</div>
                  <div class="bw-date-val">
                    {{ checkin ? formatDate(checkin) : 'Ajouter' }}
                  </div>
                </div>
                <div class="bw-dates-sep">→</div>
                <div
                  class="bw-date-field"
                  [class.bw-date-field--active]="dateStep === 'checkout'"
                  (click)="openDatePicker('checkout')"
                >
                  <div class="bw-date-label">RETOUR</div>
                  <div class="bw-date-val">
                    {{ checkout ? formatDate(checkout) : 'Ajouter' }}
                  </div>
                </div>
              </div>
              @if (dateStep) {
                <div class="bw-calendar">
                  <div class="cal-header">
                    <button class="cal-nav" (click)="prevMonth()">‹</button>
                    <span class="cal-month">{{ getMonthLabel() }}</span>
                    <button class="cal-nav" (click)="nextMonth()">›</button>
                  </div>
                  <div class="cal-weekdays">
                    @for (d of weekdays; track d) {
                      <div class="cal-wd">{{ d }}</div>
                    }
                  </div>
                  <div class="cal-grid">
                    @for (day of calendarDays(); track $index) {
                      <div
                        class="cal-day"
                        [class.cal-day--empty]="!day.date"
                        [class.cal-day--past]="day.isPast"
                        [class.cal-day--selected-start]="day.date === checkin"
                        [class.cal-day--selected-end]="day.date === checkout"
                        [class.cal-day--in-range]="day.isInRange"
                        [class.cal-day--today]="day.isToday"
                        (click)="onCalendarDayClick(day)"
                      >
                        {{ day.label }}
                      </div>
                    }
                  </div>
                  @if (checkin && !checkout) {
                    <div class="cal-hint">💡 Même date = 1 jour</div>
                  }
                  @if (checkin && checkout) {
                    <button class="cal-confirm-btn" (click)="dateStep = ''">
                      ✓ {{ getDuration() }} jour{{
                        getDuration() > 1 ? 's' : ''
                      }}
                    </button>
                  }
                </div>
              }
            </div>

            @if (checkin && checkout) {
              <div class="bw-summary">
                <div class="bw-summary-row">
                  <span
                    >{{ car().pricePerDay | currencyFormat: 'XAF' }} ×
                    {{ getDuration() }} jour{{
                      getDuration() > 1 ? 's' : ''
                    }}</span
                  >
                  <span>{{ getBasePrice() | currencyFormat: 'XAF' }}</span>
                </div>
                @if (car().depositRequired) {
                  <div class="bw-summary-row">
                    <span>Caution (remboursable)</span>
                    <span>{{
                      car().depositAmount | currencyFormat: 'XAF'
                    }}</span>
                  </div>
                }
                <div class="bw-summary-row">
                  <span>Frais de service (10%)</span>
                  <span>{{ getPlatformFee() | currencyFormat: 'XAF' }}</span>
                </div>
                <div class="bw-summary-divider"></div>
                <div class="bw-summary-total">
                  <span>Total</span>
                  <strong>{{ getTotal() | currencyFormat: 'XAF' }}</strong>
                </div>
              </div>
            }

            <button
              class="bw-confirm-btn"
              [class.bw-confirm-btn--disabled]="!checkin || !checkout"
              (click)="book()"
            >
              @if (!checkin || !checkout) {
                Choisir des dates
              } @else {
                Louer — {{ getTotal() | currencyFormat: 'XAF' }}
              }
            </button>
            @if (checkin && checkout) {
              <p class="bw-no-charge">Vous ne serez pas encore débité</p>
            }
          </div>
        }

        <!-- Lightbox -->
        @if (galleryOpen()) {
          <div class="lightbox" (click)="closeGallery()">
            <div class="lightbox__box" (click)="$event.stopPropagation()">
              <div class="lightbox__header">
                <span class="lightbox__counter"
                  >{{ galleryIndex() + 1 }} / {{ allPhotos().length }}</span
                >
                <button class="lightbox__close" (click)="closeGallery()">
                  <ion-icon name="close-outline"></ion-icon>
                </button>
              </div>
              <div class="lightbox__img-wrap">
                <button
                  class="lightbox__nav"
                  (click)="prevPhoto()"
                  [disabled]="galleryIndex() === 0"
                >
                  <ion-icon name="chevron-back-outline"></ion-icon>
                </button>
                <img
                  [src]="allPhotos()[galleryIndex()]"
                  class="lightbox__img"
                />
                <button
                  class="lightbox__nav"
                  (click)="nextPhoto()"
                  [disabled]="galleryIndex() === allPhotos().length - 1"
                >
                  <ion-icon name="chevron-forward-outline"></ion-icon>
                </button>
              </div>
              <div class="lightbox__thumbs">
                @for (photo of allPhotos(); track $index) {
                  <div
                    class="lightbox__thumb"
                    [class.active]="galleryIndex() === $index"
                    (click)="galleryIndex.set($index)"
                  >
                    <img [src]="photo" loading="lazy" />
                  </div>
                }
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="sr-loading">
          <p>Véhicule introuvable</p>
          <button (click)="goBack()">Retour</button>
        </div>
      }
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: #f5f5f5;
      }
      .sr-loading {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        gap: 16px;
      }

      .photo-grid {
        position: relative;
        height: 280px;
        overflow: hidden;
        background: #eee;
      }
      .photo-main {
        width: 100%;
        height: 100%;
        cursor: pointer;
      }
      .photo-main img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .photo-side {
        display: none;
      }
      .photo-overlay-top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 48px 16px 16px;
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.45),
          transparent
        );
      }
      .action-group {
        display: flex;
        gap: 8px;
      }
      .action-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.92);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: #333;
      }
      .action-btn.wishlisted {
        background: #e85d24;
        color: #fff;
      }
      .show-all-photos {
        position: absolute;
        bottom: 12px;
        right: 12px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 7px 14px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        color: #1a1a2e;
      }

      .detail-layout {
        background: #fff;
        border-radius: 20px 20px 0 0;
        margin-top: -16px;
        padding-bottom: 100px;
      }
      .detail-main {
        padding: 0;
      }
      .detail-sidebar {
        display: none;
      }

      .sr-section {
        padding: 20px 16px 8px;
      }
      .divider {
        height: 1px;
        background: #f0f0f0;
        margin: 8px 16px;
      }
      .sr-subtitle {
        font-size: 17px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0 0 14px;
      }
      .cat-badge {
        display: inline-block;
        background: rgba(232, 93, 36, 0.1);
        color: #e85d24;
        border-radius: 6px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .car-title {
        font-size: 22px;
        font-weight: 700;
        color: #1a1a2e;
        margin: 0 0 4px;
      }
      .car-color {
        font-size: 13px;
        color: #888;
        margin: 0 0 8px;
      }
      .car-rating {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
      }
      .star {
        color: #f59e0b;
      }
      .muted {
        color: #888;
      }
      .sep {
        color: #ddd;
      }
      .car-desc {
        font-size: 14px;
        color: #555;
        line-height: 1.7;
        margin: 0;
      }
      .specs-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .spec-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .spec-item ion-icon {
        font-size: 22px;
        color: #e85d24;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .spec-label {
        font-size: 11px;
        color: #888;
      }
      .spec-value {
        font-size: 13px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .features-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .feature-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #444;
      }
      .conditions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .condition-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px;
        background: #f9f9f9;
        border-radius: 10px;
      }
      .condition-item ion-icon {
        font-size: 22px;
        color: #888;
        flex-shrink: 0;
      }
      .condition-required ion-icon {
        color: #e85d24;
      }
      .condition-label {
        font-size: 11px;
        color: #888;
      }
      .condition-value {
        font-size: 13px;
        font-weight: 500;
        color: #1a1a2e;
      }

      /* Booking widget mobile sticky */
      .booking-widget-mobile {
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
      .bwm-price {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }
      .bwm-price strong {
        font-size: 18px;
        font-weight: 700;
        color: #e85d24;
      }
      .bwm-price span {
        font-size: 12px;
        color: #888;
      }
      .bwm-recap {
        font-size: 11px;
        color: #888;
        margin-top: 2px;
      }
      .bwm-btn {
        background: #e85d24;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 14px 28px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
      }

      .booking-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 199;
      }
      .booking-panel-mobile {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
        border-radius: 20px 20px 0 0;
        padding: 16px 20px env(safe-area-inset-bottom, 20px);
        z-index: 200;
        max-height: 90vh;
        overflow-y: auto;
      }
      .bpm-handle {
        width: 36px;
        height: 4px;
        border-radius: 2px;
        background: #ddd;
        margin: 0 auto 12px;
      }
      .bpm-close {
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

      .bw-price {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }
      .bw-price strong {
        font-size: 22px;
        font-weight: 700;
        color: #1a1a2e;
      }
      .bw-price span {
        font-size: 14px;
        color: #888;
      }
      .bw-dates {
        margin-bottom: 12px;
      }
      .bw-dates-row {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .bw-date-field {
        flex: 1;
        border: 1.5px solid #eee;
        border-radius: 10px;
        padding: 10px 12px;
        cursor: pointer;
        transition: border-color 0.15s;
      }
      .bw-date-field--active {
        border-color: #e85d24;
      }
      .bw-date-label {
        font-size: 10px;
        font-weight: 600;
        color: #888;
        margin-bottom: 3px;
      }
      .bw-date-val {
        font-size: 13px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .bw-dates-sep {
        color: #ccc;
        font-size: 16px;
        flex-shrink: 0;
        padding: 0 4px;
      }

      .bw-calendar {
        margin-top: 12px;
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 12px;
      }
      .cal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .cal-nav {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1px solid #eee;
        background: #fff;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cal-month {
        font-size: 13px;
        font-weight: 600;
        color: #1a1a2e;
      }
      .cal-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        margin-bottom: 4px;
      }
      .cal-wd {
        text-align: center;
        font-size: 10px;
        color: #aaa;
      }
      .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        margin-bottom: 8px;
      }
      .cal-day {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
        color: #1a1a2e;
        margin: 0 auto;
      }
      .cal-day--past {
        color: #ddd;
        cursor: default;
      }
      .cal-day--today {
        font-weight: 700;
        color: #e85d24;
      }
      .cal-day--selected-start,
      .cal-day--selected-end {
        background: #e85d24 !important;
        color: #fff !important;
        font-weight: 600;
      }
      .cal-day--in-range {
        background: rgba(232, 93, 36, 0.1);
        border-radius: 0;
        color: #e85d24;
      }
      .cal-hint {
        font-size: 11px;
        color: #888;
        text-align: center;
        margin-bottom: 8px;
      }
      .cal-confirm-btn {
        width: 100%;
        padding: 10px;
        border-radius: 8px;
        background: #1a1a2e;
        color: #fff;
        border: none;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }

      .bw-summary {
        border: 1px solid #eee;
        border-radius: 10px;
        padding: 14px;
        margin-bottom: 14px;
      }
      .bw-summary-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #555;
        margin-bottom: 8px;
      }
      .bw-summary-divider {
        height: 1px;
        background: #eee;
        margin: 8px 0;
      }
      .bw-summary-total {
        display: flex;
        justify-content: space-between;
        font-size: 15px;
        color: #1a1a2e;
      }
      .bw-summary-total strong {
        font-weight: 700;
      }
      .bw-confirm-btn {
        width: 100%;
        padding: 16px;
        border-radius: 12px;
        background: #e85d24;
        color: #fff;
        border: none;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 8px;
      }
      .bw-confirm-btn--disabled {
        background: #ccc;
        cursor: default;
      }
      .bw-no-charge {
        text-align: center;
        font-size: 12px;
        color: #888;
        margin: 0;
      }

      .lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.96);
        z-index: 500;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lightbox__box {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .lightbox__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        color: #fff;
      }
      .lightbox__counter {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }
      .lightbox__close {
        background: rgba(255, 255, 255, 0.15);
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
      .lightbox__img-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 0 8px;
      }
      .lightbox__img {
        max-width: calc(100% - 100px);
        max-height: 70vh;
        object-fit: contain;
        border-radius: 8px;
      }
      .lightbox__nav {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .lightbox__nav:disabled {
        opacity: 0.3;
      }
      .lightbox__thumbs {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 12px 16px;
        scrollbar-width: none;
      }
      .lightbox__thumbs::-webkit-scrollbar {
        display: none;
      }
      .lightbox__thumb {
        width: 60px;
        height: 60px;
        flex-shrink: 0;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;
        opacity: 0.6;
      }
      .lightbox__thumb.active {
        border-color: #e85d24;
        opacity: 1;
      }
      .lightbox__thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      @media (min-width: 769px) {
        .photo-grid {
          height: 420px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          margin: 16px 24px;
          border-radius: 16px;
          overflow: hidden;
        }
        .photo-side {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 4px;
        }
        .photo-small {
          position: relative;
          cursor: pointer;
          overflow: hidden;
        }
        .photo-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s;
        }
        .photo-small:hover img {
          transform: scale(1.04);
        }
        .photo-more-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
        }
        .detail-layout {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 48px;
          align-items: start;
          padding: 32px 24px 80px;
          background: transparent;
          border-radius: 0;
        }
        .detail-sidebar {
          display: block;
        }
        .booking-widget-mobile {
          display: none;
        }
        .booking-panel-mobile {
          display: none;
        }
        .booking-panel {
          border: 1px solid #eee;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 84px;
        }
        .sr-section {
          padding: 20px 0 8px;
        }
        .divider {
          margin: 8px 0;
        }
        .specs-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        .features-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        .conditions {
          flex-direction: row;
        }
      }
    `,
  ],
})
export class CarDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly carsService = inject(CarsService);
  readonly authState = inject(AuthState);

  car = signal<any>(null);
  isLoading = signal(true);
  isWishlisted = signal(false);
  galleryOpen = signal(false);
  galleryIndex = signal(0);

  showBookingWidget = false;
  checkin = '';
  checkout = '';
  dateStep = '';
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  weekdays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  monthNames = [
    'Janvier',
    'Fevrier',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Aout',
    'Septembre',
    'Octobre',
    'Novembre',
    'Decembre',
  ];

  constructor() {
    addIcons({
      arrowBackOutline,
      shareOutline,
      heartOutline,
      heart,
      locationOutline,
      starOutline,
      peopleOutline,
      flashOutline,
      shieldCheckmarkOutline,
      keyOutline,
      informationCircleOutline,
      imagesOutline,
      chevronBackOutline,
      chevronForwardOutline,
      closeOutline,
      carOutline,
      speedometerOutline,
      colorPaletteOutline,
      calendarOutline,
    });
  }

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    const params = this.route.snapshot.queryParams;

    // Récupérer les dates pré-sélectionnées
    if (params['checkin']) this.checkin = params['checkin'];
    if (params['checkout']) this.checkout = params['checkout'];

    if (!slug) {
      this.goBack();
      return;
    }
    try {
      const car = await this.carsService.getBySlug(slug);
      this.car.set(car);
    } catch {
      this.car.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  allPhotos(): string[] {
    const c = this.car();
    if (!c) return [];
    const imgs: string[] = [];
    if (c.coverImageUrl) imgs.push(c.coverImageUrl);
    if (c.images?.length)
      c.images.forEach((img: string) => {
        if (img !== c.coverImageUrl) imgs.push(img);
      });
    return imgs;
  }

  openGallery(i: number) {
    this.galleryIndex.set(i);
    this.galleryOpen.set(true);
  }
  closeGallery() {
    this.galleryOpen.set(false);
  }
  nextPhoto() {
    this.galleryIndex.update((i) =>
      Math.min(i + 1, this.allPhotos().length - 1),
    );
  }
  prevPhoto() {
    this.galleryIndex.update((i) => Math.max(i - 1, 0));
  }
  toggleWishlist() {
    this.isWishlisted.update((v) => !v);
  }
  goBack() {
    this.router.navigate(['/cars']);
  }

  openDatePicker(field: 'checkin' | 'checkout') {
    this.dateStep = field;
  }

  onCalendarDayClick(day: any) {
    if (day.isPast || !day.date) return;
    if (!this.checkin || (this.checkin && this.checkout)) {
      this.checkin = day.date;
      this.checkout = '';
      this.dateStep = 'checkout';
    } else if (day.date >= this.checkin) {
      // >= permet la meme date (1 jour minimum)
      this.checkout = day.date;
      this.dateStep = '';
    } else {
      this.checkin = day.date;
      this.checkout = '';
      this.dateStep = 'checkout';
    }
  }

  getDuration(): number {
    if (!this.checkin || !this.checkout) return 0;
    const diff = Math.ceil(
      (new Date(this.checkout).getTime() - new Date(this.checkin).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return Math.max(diff, 1); // minimum 1 jour
  }

  getBasePrice(): number {
    return Math.round(
      Number(this.car()?.pricePerDay || 0) * this.getDuration(),
    );
  }

  getPlatformFee(): number {
    return Math.round(this.getBasePrice() * 0.1);
  }

  getTotal(): number {
    return this.getBasePrice() + this.getPlatformFee();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else this.currentMonth--;
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else this.currentMonth++;
  }

  getMonthLabel(): string {
    return this.monthNames[this.currentMonth] + ' ' + this.currentYear;
  }

  calendarDays() {
    const days = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0,
    ).getDate();
    const todayStr = new Date().toLocaleDateString('fr-CA', {
      timeZone: 'Africa/Douala',
    });

    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: '',
        label: '',
        isPast: false,
        isToday: false,
        isInRange: false,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr =
        this.currentYear +
        '-' +
        String(this.currentMonth + 1).padStart(2, '0') +
        '-' +
        String(d).padStart(2, '0');
      days.push({
        date: dateStr,
        label: String(d),
        isPast: dateStr < todayStr,
        isToday: dateStr === todayStr,
        isInRange: !!(
          this.checkin &&
          this.checkout &&
          dateStr > this.checkin &&
          dateStr < this.checkout
        ),
      });
    }
    return days;
  }

  book() {
    if (!this.authState.isAuthenticated()) {
      sessionStorage.setItem(
        'pending_booking',
        JSON.stringify({
          resource_id: this.car().id,
          resource_type: 'CAR',
          checkin: this.checkin,
          checkout: this.checkout,
          return_url: '/cars/' + this.car().slug,
        }),
      );
      this.router.navigate(['/auth/login']);
      return;
    }
    if (!this.checkin || !this.checkout) {
      this.showBookingWidget = true;
      this.dateStep = 'checkin';
      return;
    }
    this.router.navigate(['/app/book'], {
      queryParams: {
        resource_id: this.car().id,
        resource_type: 'CAR',
        checkin: this.checkin,
        checkout: this.checkout,
        total: this.getTotal(),
      },
    });
  }

  share() {
    const c = this.car();
    const url = window.location.href;
    const text =
      '🚗 ' +
      c.brand +
      ' ' +
      c.model +
      ' ' +
      c.year +
      ' — ' +
      c.city +
      '\n💰 ' +
      c.pricePerDay +
      ' XAF/jour\n\n' +
      url;
    if (navigator.share) {
      navigator.share({ title: c.brand + ' ' + c.model, text, url });
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    }
  }

  getCategoryLabel(cat: string): string {
    const l: Record<string, string> = {
      SEDAN: 'Berline',
      SUV: 'SUV',
      LUXURY: 'Luxe',
      ECONOMY: 'Economique',
      VAN: 'Van',
      PICKUP: 'Pickup',
    };
    return l[cat] || cat;
  }
  getTransLabel(t: string): string {
    return t === 'AUTOMATIC' ? 'Automatique' : 'Manuelle';
  }
  getFuelLabel(f: string): string {
    const l: Record<string, string> = {
      PETROL: 'Essence',
      DIESEL: 'Diesel',
      ELECTRIC: 'Electrique',
      HYBRID: 'Hybride',
    };
    return l[f] || f;
  }
}
