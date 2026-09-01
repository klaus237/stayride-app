import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  locationOutline,
  starOutline,
  heartOutline,
  heart,
  shareOutline,
  peopleOutline,
  bedOutline,
  waterOutline,
  timeOutline,
  checkmarkCircleOutline,
  calendarOutline,
  imagesOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
} from 'ionicons/icons';
import { PropertiesService } from '../../../core/services/properties.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { AuthState } from '../../../core/auth/auth.state';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    // RouterLink,
    IonContent,
    IonIcon,
    IonSpinner,
    CurrencyFormatPipe,
  ],
  template: `
    <ion-content>
      @if (isLoading()) {
        <div class="sr-loading">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      } @else if (property()) {
        <!-- PHOTO GRID -->
        <div class="photo-grid">
          <div class="photo-main" (click)="openGallery(0)">
            <img [src]="allPhotos()[0]?.url" [alt]="property().title" />
          </div>
          <div class="photo-side">
            @for (photo of allPhotos().slice(1, 5); track $index) {
              <div class="photo-small" (click)="openGallery($index + 1)">
                <img [src]="photo.url" [alt]="photo.caption" />
                @if ($index === 3 && allPhotos().length > 5) {
                  <div class="photo-more-overlay">
                    <ion-icon name="images-outline"></ion-icon>
                    +{{ allPhotos().length - 5 }} photos
                  </div>
                }
                @if (photo.caption) {
                  <div class="photo-caption">{{ photo.caption }}</div>
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
            Voir toutes les photos ({{ allPhotos().length }})
          </button>
        </div>

        <!-- LAYOUT 2 COLONNES -->
        <div class="detail-layout">
          <!-- Colonne gauche -->
          <div class="detail-main">
            <div class="sr-section">
              <span class="type-badge">{{
                getTypeLabel(property().type)
              }}</span>
              <h1 class="prop-title">{{ property().title }}</h1>
              <div class="prop-location">
                <ion-icon name="location-outline"></ion-icon>
                {{
                  property().neighborhood ? property().neighborhood + ', ' : ''
                }}{{ property().city }}
              </div>
              <div class="prop-rating">
                <ion-icon name="star-outline" class="star-icon"></ion-icon>
                <strong>{{ property().avgRating | number: '1.1-1' }}</strong>
                <span class="muted">({{ property().reviewCount }} avis)</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="sr-section">
              <div class="specs-grid">
                <div class="spec-item">
                  <ion-icon name="people-outline"></ion-icon>
                  <span>{{ property().maxGuests }} voyageurs</span>
                </div>
                <div class="spec-item">
                  <ion-icon name="bed-outline"></ion-icon>
                  <span
                    >{{ property().bedrooms }} chambre{{
                      property().bedrooms > 1 ? 's' : ''
                    }}</span
                  >
                </div>
                <div class="spec-item">
                  <ion-icon name="bed-outline"></ion-icon>
                  <span
                    >{{ property().beds }} lit{{
                      property().beds > 1 ? 's' : ''
                    }}</span
                  >
                </div>
                <div class="spec-item">
                  <ion-icon name="water-outline"></ion-icon>
                  <span
                    >{{ property().bathrooms }} salle{{
                      property().bathrooms > 1 ? 's' : ''
                    }}
                    de bain</span
                  >
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="sr-section">
              <h2 class="sr-subtitle">A propos</h2>
              <p class="prop-desc">{{ property().description }}</p>
            </div>

            <div class="divider"></div>

            <div class="sr-section">
              <h2 class="sr-subtitle">Informations pratiques</h2>
              <div class="info-grid">
                <div class="info-item">
                  <ion-icon name="time-outline"></ion-icon>
                  <div>
                    <div class="info-label">Arrivee</div>
                    <div class="info-value">
                      A partir de {{ property().checkinTime }}
                    </div>
                  </div>
                </div>
                <div class="info-item">
                  <ion-icon name="time-outline"></ion-icon>
                  <div>
                    <div class="info-label">Depart</div>
                    <div class="info-value">
                      Avant {{ property().checkoutTime }}
                    </div>
                  </div>
                </div>
                <div class="info-item">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <div>
                    <div class="info-label">Sejour minimum</div>
                    <div class="info-value">
                      {{ property().minStayNights }} nuit{{
                        property().minStayNights > 1 ? 's' : ''
                      }}
                    </div>
                  </div>
                </div>
                <div class="info-item">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <div>
                    <div class="info-label">Reservation</div>
                    <div class="info-value">
                      {{
                        property().instantBooking
                          ? 'Instantanee'
                          : 'Sur demande'
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="sr-section">
              <h2 class="sr-subtitle">Localisation</h2>
              <p class="muted">
                {{ property().address }}, {{ property().city }}
              </p>
              <div class="map-box" (click)="openMap()">
                <ion-icon name="location-outline"></ion-icon>
                <span>Voir sur la carte</span>
              </div>
            </div>
          </div>

          <!-- Colonne droite widget reservation desktop -->
          <div class="detail-sidebar">
            <div class="booking-panel">
              <div class="bw-price">
                <strong>{{
                  property().pricePerNight | currencyFormat: 'XAF'
                }}</strong>
                <span>/nuit</span>
                @if (property().avgRating > 0) {
                  <div class="bw-rating">
                    <ion-icon
                      name="star-outline"
                      style="color:#F59E0B"
                    ></ion-icon>
                    {{ property().avgRating | number: '1.1-1' }}
                  </div>
                }
              </div>

              <div class="bw-dates">
                <div class="bw-dates-row">
                  <div
                    class="bw-date-field"
                    [class.bw-date-field--active]="dateStep === 'checkin'"
                    (click)="openDatePicker('checkin')"
                  >
                    <div class="bw-date-label">ARRIVEE</div>
                    <div class="bw-date-val">
                      {{ checkin ? formatDate(checkin) : 'Ajouter' }}
                    </div>
                  </div>
                  <div class="bw-dates-sep">to</div>
                  <div
                    class="bw-date-field"
                    [class.bw-date-field--active]="dateStep === 'checkout'"
                    (click)="openDatePicker('checkout')"
                  >
                    <div class="bw-date-label">DEPART</div>
                    <div class="bw-date-val">
                      {{ checkout ? formatDate(checkout) : 'Ajouter' }}
                    </div>
                  </div>
                </div>
                @if (dateStep) {
                  <div class="bw-calendar">
                    <div class="cal-header">
                      <button class="cal-nav" (click)="prevMonth()">
                        less
                      </button>
                      <span class="cal-month">{{ getMonthLabel() }}</span>
                      <button class="cal-nav" (click)="nextMonth()">
                        more
                      </button>
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
                          [class.cal-day--unavailable]="day.isUnavailable"
                          [class.cal-day--selected-start]="day.date === checkin"
                          [class.cal-day--selected-end]="day.date === checkout"
                          [class.cal-day--in-range]="day.isInRange"
                          [class.cal-day--today]="day.isToday"
                          (click)="
                            !day.isPast &&
                              !day.isUnavailable &&
                              day.date &&
                              onCalendarDayClick(day)
                          "
                        >
                          {{ day.label }}
                        </div>
                      }
                    </div>
                    @if (checkin && checkout) {
                      <button class="cal-confirm-btn" (click)="dateStep = ''">
                        ok {{ getDuration() }} nuit{{
                          getDuration() > 1 ? 's' : ''
                        }}
                        selectionnees
                      </button>
                    }
                  </div>
                }
              </div>

              <div class="bw-guests">
                <div class="bw-guests-label">VOYAGEURS</div>
                <div class="bw-guests-row">
                  <button
                    class="counter-btn"
                    (click)="decrementGuests()"
                    [disabled]="guests <= 1"
                  >
                    -
                  </button>
                  <span class="counter-val"
                    >{{ guests }} voyageur{{ guests > 1 ? 's' : '' }}</span
                  >
                  <button
                    class="counter-btn"
                    (click)="incrementGuests()"
                    [disabled]="guests >= property().maxGuests"
                  >
                    +
                  </button>
                </div>
                <div class="bw-guests-max">
                  Max {{ property().maxGuests }} voyageurs
                </div>
              </div>

              @if (checkin && checkout) {
                <div class="bw-summary">
                  <div class="bw-summary-row">
                    <span
                      >{{ property().pricePerNight | currencyFormat: 'XAF' }} x
                      {{ getDuration() }} nuits</span
                    >
                    <span>{{ getBasePrice() | currencyFormat: 'XAF' }}</span>
                  </div>
                  @if (property().cleaningFee > 0) {
                    <div class="bw-summary-row">
                      <span>Frais de nettoyage</span>
                      <span>{{
                        property().cleaningFee | currencyFormat: 'XAF'
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
                [class.bw-confirm-btn--disabled]="
                  !checkin || !checkout || areDatesUnavailable()
                "
                (click)="book()"
              >
                @if (areDatesUnavailable()) {
                  Ces dates ne sont plus disponibles
                } @else if (!checkin || !checkout) {
                  Choisir des dates
                } @else {
                  Réserver — {{ getTotal() | currencyFormat: 'XAF' }}
                }
              </button>

              @if (checkin && checkout) {
                <p class="bw-no-charge">Vous ne serez pas encore debite</p>
              }
            </div>
          </div>
        </div>

        <!-- Widget mobile sticky -->
        <div class="booking-widget-mobile">
          <div>
            <div class="bwm-price">
              <strong>{{
                property().pricePerNight | currencyFormat: 'XAF'
              }}</strong>
              <span>/nuit</span>
            </div>
            @if (checkin && checkout) {
              <div class="bwm-recap">
                {{ getDuration() }} nuits -
                {{ getTotal() | currencyFormat: 'XAF' }}
              </div>
            }
          </div>
          <button class="bwm-btn" (click)="showBookingWidget = true">
            {{ checkin && checkout ? 'Reserver' : 'Choisir des dates' }}
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
              <strong>{{
                property().pricePerNight | currencyFormat: 'XAF'
              }}</strong>
              <span>/nuit</span>
            </div>

            <div class="bw-dates">
              <div class="bw-dates-row">
                <div
                  class="bw-date-field"
                  [class.bw-date-field--active]="dateStep === 'checkin'"
                  (click)="openDatePicker('checkin')"
                >
                  <div class="bw-date-label">ARRIVEE</div>
                  <div class="bw-date-val">
                    {{ checkin ? formatDate(checkin) : 'Ajouter' }}
                  </div>
                </div>
                <div class="bw-dates-sep">to</div>
                <div
                  class="bw-date-field"
                  [class.bw-date-field--active]="dateStep === 'checkout'"
                  (click)="openDatePicker('checkout')"
                >
                  <div class="bw-date-label">DEPART</div>
                  <div class="bw-date-val">
                    {{ checkout ? formatDate(checkout) : 'Ajouter' }}
                  </div>
                </div>
              </div>
              @if (dateStep) {
                <div class="bw-calendar">
                  <div class="cal-header">
                    <button class="cal-nav" (click)="prevMonth()">less</button>
                    <span class="cal-month">{{ getMonthLabel() }}</span>
                    <button class="cal-nav" (click)="nextMonth()">more</button>
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
                  @if (checkin && checkout) {
                    <button class="cal-confirm-btn" (click)="dateStep = ''">
                      ok {{ getDuration() }} nuits
                    </button>
                  }
                </div>
              }
            </div>

            <div class="bw-guests">
              <div class="bw-guests-label">VOYAGEURS</div>
              <div class="bw-guests-row">
                <button
                  class="counter-btn"
                  (click)="decrementGuests()"
                  [disabled]="guests <= 1"
                >
                  -
                </button>
                <span class="counter-val">{{ guests }}</span>
                <button
                  class="counter-btn"
                  (click)="incrementGuests()"
                  [disabled]="guests >= property().maxGuests"
                >
                  +
                </button>
              </div>
            </div>

            @if (checkin && checkout) {
              <div class="bw-summary">
                <div class="bw-summary-row">
                  <span
                    >{{ property().pricePerNight | currencyFormat: 'XAF' }} x
                    {{ getDuration() }} nuits</span
                  >
                  <span>{{ getBasePrice() | currencyFormat: 'XAF' }}</span>
                </div>
                @if (property().cleaningFee > 0) {
                  <div class="bw-summary-row">
                    <span>Frais de nettoyage</span>
                    <span>{{
                      property().cleaningFee | currencyFormat: 'XAF'
                    }}</span>
                  </div>
                }
                <div class="bw-summary-row">
                  <span>Frais de service</span>
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
                Reserver - {{ getTotal() | currencyFormat: 'XAF' }}
              }
            </button>
            @if (checkin && checkout) {
              <p class="bw-no-charge">Vous ne serez pas encore debite</p>
            }
          </div>
        }

        <!-- LIGHTBOX -->
        @if (galleryOpen()) {
          <div class="lightbox" (click)="closeGallery()">
            <div class="lightbox__box" (click)="$event.stopPropagation()">
              <div class="lightbox__header">
                <div class="lightbox__title">
                  {{ currentPhoto()?.caption || property().title }}
                  <span class="lightbox__counter"
                    >{{ galleryIndex() + 1 }} / {{ allPhotos().length }}</span
                  >
                </div>
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
                  [src]="currentPhoto()?.url"
                  [alt]="currentPhoto()?.caption"
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
                    [class.lightbox__thumb--active]="galleryIndex() === $index"
                    (click)="galleryIndex.set($index)"
                  >
                    <img
                      [src]="photo.url"
                      [alt]="photo.caption"
                      loading="lazy"
                    />
                  </div>
                }
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="sr-loading">
          <p>Propriete introuvable</p>
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
        height: 300px;
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
        margin: 0 0 12px;
      }
      .type-badge {
        display: inline-block;
        background: rgba(232, 93, 36, 0.1);
        color: #e85d24;
        border-radius: 6px;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .prop-title {
        font-size: 22px;
        font-weight: 700;
        color: #1a1a2e;
        margin: 0 0 8px;
      }
      .prop-location {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #666;
        margin-bottom: 8px;
      }
      .prop-rating {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
      }
      .star-icon {
        color: #f59e0b;
      }
      .muted {
        color: #888;
        font-size: 13px;
      }
      .prop-desc {
        font-size: 14px;
        color: #555;
        line-height: 1.7;
        margin: 0;
      }
      .specs-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .spec-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #444;
      }
      .spec-item ion-icon {
        font-size: 20px;
        color: #e85d24;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .info-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .info-item ion-icon {
        font-size: 20px;
        color: #e85d24;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .info-label {
        font-size: 11px;
        color: #888;
      }
      .info-value {
        font-size: 13px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .map-box {
        height: 120px;
        background: #f0f0f0;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #888;
        font-size: 14px;
        cursor: pointer;
      }

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
      .bw-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        margin-left: auto;
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

      .bw-guests {
        border: 1.5px solid #eee;
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 12px;
      }
      .bw-guests-label {
        font-size: 10px;
        font-weight: 600;
        color: #888;
        margin-bottom: 8px;
      }
      .bw-guests-row {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .bw-guests-max {
        font-size: 11px;
        color: #aaa;
        margin-top: 6px;
      }
      .counter-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1.5px solid #ddd;
        background: #fff;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .counter-btn:disabled {
        opacity: 0.3;
      }
      .counter-val {
        font-size: 14px;
        font-weight: 500;
        color: #1a1a2e;
        flex: 1;
        text-align: center;
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
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        color: #fff;
      }
      .lightbox__title {
        font-size: 14px;
        font-weight: 500;
      }
      .lightbox__counter {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        margin-left: 8px;
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
      .lightbox__thumb--active {
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
          height: 440px;
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
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 15px;
          font-weight: 600;
        }
        .photo-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 11px;
          padding: 4px 8px;
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
          grid-template-columns: repeat(4, 1fr);
        }
        .info-grid {
          grid-template-columns: repeat(4, 1fr);
        }
        .prop-title {
          font-size: 28px;
        }
        .lightbox__img {
          max-width: 70vw;
          max-height: 75vh;
        }
      }
      .cal-day--unavailable {
        color: #ddd;
        text-decoration: line-through;
        cursor: default;
      }
      .cal-day--unavailable {
        color: #ddd;
        text-decoration: line-through;
        cursor: not-allowed;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 3px,
          #f5f5f5 3px,
          #f5f5f5 4px
        );
      }
    `,
  ],
})
export class PropertyDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propertiesService = inject(PropertiesService);
  private readonly api = inject(ApiService);
  readonly authState = inject(AuthState);

  unavailableDates: string[] = [];

  property = signal<any>(null);
  isLoading = signal(true);
  isWishlisted = signal(false);
  galleryOpen = signal(false);
  galleryIndex = signal(0);

  showBookingWidget = false;
  checkin = '';
  checkout = '';
  guests = 1;
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
      locationOutline,
      starOutline,
      heartOutline,
      heart,
      shareOutline,
      peopleOutline,
      bedOutline,
      waterOutline,
      timeOutline,
      checkmarkCircleOutline,
      calendarOutline,
      imagesOutline,
      chevronBackOutline,
      chevronForwardOutline,
      closeOutline,
    });
  }

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    const params = this.route.snapshot.queryParams;

    if (params['checkin']) this.checkin = params['checkin'];
    if (params['checkout']) this.checkout = params['checkout'];
    if (params['guests']) this.guests = parseInt(params['guests']);

    if (!slug) {
      this.goBack();
      return;
    }
    try {
      const property = await this.propertiesService.getBySlug(slug);
      this.property.set(property);
      // Charger les dates indisponibles après avoir la propriété
      await this.loadUnavailableDates();
    } catch {
      this.property.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  allPhotos(): { url: string; caption: string }[] {
    const p = this.property();
    if (!p) return [];
    if (p.photos?.length) return p.photos;
    const urls: string[] = [];
    if (p.coverImageUrl) urls.push(p.coverImageUrl);
    if (p.images?.length)
      p.images.forEach((img: string) => {
        if (img !== p.coverImageUrl) urls.push(img);
      });
    const autoLabels = [
      'Vue principale',
      'Salon',
      'Cuisine',
      'Chambre principale',
      'Chambre 2',
      'Salle de bain',
      'Terrasse',
      'Entree',
    ];
    return urls.map((url, i) => ({
      url,
      caption: autoLabels[i] || 'Photo ' + (i + 1),
    }));
  }

  currentPhoto(): { url: string; caption: string } | null {
    return this.allPhotos()[this.galleryIndex()] || null;
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

  openDatePicker(field: 'checkin' | 'checkout') {
    this.dateStep = field;
  }

  onCalendarDayClick(day: any) {
    if (day.isPast || !day.date) return;
    if (!this.checkin || (this.checkin && this.checkout)) {
      this.checkin = day.date;
      this.checkout = '';
      this.dateStep = 'checkout';
    } else if (day.date > this.checkin) {
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
    return Math.ceil(
      (new Date(this.checkout).getTime() - new Date(this.checkin).getTime()) /
        (1000 * 60 * 60 * 24),
    );
  }

  getBasePrice(): number {
    return Math.round(
      Number(this.property().pricePerNight) * this.getDuration(),
    );
  }
  getPlatformFee(): number {
    return Math.round(
      (this.getBasePrice() + Number(this.property().cleaningFee || 0)) * 0.1,
    );
  }
  getTotal(): number {
    return (
      this.getBasePrice() +
      Number(this.property().cleaningFee || 0) +
      this.getPlatformFee()
    );
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  incrementGuests() {
    if (this.guests < this.property().maxGuests) this.guests++;
  }
  decrementGuests() {
    if (this.guests > 1) this.guests--;
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
    // Forcer le fuseau Cameroun (WAT = UTC+1)
    const todayStr = new Date().toLocaleDateString('fr-CA', {
      timeZone: 'Africa/Douala',
    });
    // fr-CA retourne le format YYYY-MM-DD

    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: '',
        label: '',
        isPast: false,
        isToday: false,
        isInRange: false,
        isUnavailable: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr =
        this.currentYear +
        '-' +
        String(this.currentMonth + 1).padStart(2, '0') +
        '-' +
        String(d).padStart(2, '0');
      const isUnavailable = this.unavailableDates.includes(dateStr);
      days.push({
        date: dateStr,
        label: String(d),
        isPast: dateStr < todayStr,
        isUnavailable,
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
      // Sauvegarder les params de réservation dans sessionStorage
      sessionStorage.setItem(
        'pending_booking',
        JSON.stringify({
          resource_id: this.property().id,
          resource_type: 'PROPERTY',
          checkin: this.checkin,
          checkout: this.checkout,
          guests: this.guests,
          total: this.getTotal(),
          return_url: `/properties/${this.property().slug}`,
        }),
      );
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/app/book'], {
      queryParams: {
        resource_id: this.property().id,
        resource_type: 'PROPERTY',
        checkin: this.checkin,
        checkout: this.checkout,
        guests: this.guests,
        total: this.getTotal(),
      },
    });
  }

  goBack() {
    window.history.back();
  }
  toggleWishlist() {
    this.isWishlisted.update((v) => !v);
  }
  async loadUnavailableDates() {
    try {
      const result = await this.api.get<string[]>(
        `properties/${this.property().id}/unavailable-dates`,
      );
      this.unavailableDates = result;
      console.log('dates indisponibles:', this.unavailableDates);
    } catch (err) {
      console.error('erreur unavailable dates:', err);
      this.unavailableDates = [];
    }
  }

  share() {
    const p = this.property();
    const url = window.location.href;
    const text =
      '🏠 ' +
      p.title +
      ' — ' +
      p.city +
      '\n💰 ' +
      p.pricePerNight +
      ' XAF/nuit\n\n' +
      url;
    if (navigator.share) {
      navigator.share({ title: p.title, text, url });
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    }
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
  areDatesUnavailable(): boolean {
    if (!this.checkin || !this.checkout) return false;
    // Vérifier si une des dates sélectionnées est indisponible
    const start = new Date(this.checkin);
    const end = new Date(this.checkout);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr =
        d.getFullYear() +
        '-' +
        String(d.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(d.getDate()).padStart(2, '0');
      if (this.unavailableDates.includes(dateStr)) return true;
    }
    return false;
  }
  openMap() {
    const p = this.property();
    if (p.lat && p.lng) {
      const url = `https://www.google.com/maps?q=${p.lat},${p.lng}&z=15`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(p.address + ', ' + p.city + ', Cameroun')}`;
      window.open(url, '_blank');
    }
  }
}
