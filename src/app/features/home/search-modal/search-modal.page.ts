import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  searchOutline,
  locationOutline,
  calendarOutline,
  peopleOutline,
  removeOutline,
  addOutline,
  arrowForwardOutline,
  navigateOutline,
} from 'ionicons/icons';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule, IonContent, IonIcon],
  template: `
    <ion-content>
      <div class="sm-page">
        <!-- Header -->
        <div class="sm-header">
          <button class="sm-close" (click)="close()">
            <ion-icon name="close-outline"></ion-icon>
          </button>
          <div class="sm-tabs">
            <button
              class="sm-tab"
              [class.sm-tab--active]="type === 'stays'"
              (click)="type = 'stays'"
            >
              Séjours
            </button>
            <button
              class="sm-tab"
              [class.sm-tab--active]="type === 'cars'"
              (click)="type = 'cars'"
            >
              Voitures
            </button>
          </div>
        </div>

        <!-- Étapes -->
        <div class="sm-steps">
          <!-- Étape 1 — Destination -->
          <div
            class="sm-step"
            [class.sm-step--active]="step === 1"
            (click)="onStep1Click($event)"
          >
            <div class="sm-step__header">
              <span class="sm-step__label">Destination</span>
              @if (step !== 1 && city) {
                <span class="sm-step__value">{{ city }}</span>
              }
            </div>
            @if (step === 1) {
              <div class="sm-step__content">
                <div class="sm-input-wrap">
                  <ion-icon name="search-outline"></ion-icon>
                  <input
                    type="text"
                    class="sm-input"
                    placeholder="Rechercher une ville..."
                    [(ngModel)]="citySearch"
                    (input)="onCitySearch()"
                  />
                  @if (citySearch) {
                    <button
                      class="sm-clear"
                      (click)="citySearch = ''; city = ''"
                    >
                      <ion-icon name="close-outline"></ion-icon>
                    </button>
                  }
                </div>
                <div class="sm-suggestions">
                  @if (!citySearch) {
                    <p class="sm-suggestions__title">Destinations populaires</p>
                    <button class="sm-nearby-btn" (click)="searchNearby()">
                      <ion-icon name="navigate-outline"></ion-icon>
                      Rechercher près de moi
                    </button>
                    @for (dest of popularDestinations; track dest.city) {
                      <div
                        class="sm-suggestion"
                        (click)="selectCity(dest.city)"
                      >
                        <div class="sm-suggestion__icon">{{ dest.flag }}</div>
                        <div class="sm-suggestion__info">
                          <div class="sm-suggestion__city">{{ dest.city }}</div>
                          <div class="sm-suggestion__count">
                            @if (dest.isNeighborhood) {
                              {{ dest.parentCity }} · {{ dest.count }} bien{{
                                dest.count > 1 ? 's' : ''
                              }}
                            } @else {
                              {{ dest.count }} bien{{
                                dest.count > 1 ? 's' : ''
                              }}
                              disponible{{ dest.count > 1 ? 's' : '' }}
                            }
                          </div>
                        </div>
                        <ion-icon
                          name="arrow-forward-outline"
                          class="sm-suggestion__arrow"
                        ></ion-icon>
                      </div>
                    }
                  } @else {
                    @for (dest of filteredDestinations(); track dest.city) {
                      <div
                        class="sm-suggestion"
                        (click)="selectCity(dest.city)"
                      >
                        <div class="sm-suggestion__icon">
                          <ion-icon name="location-outline"></ion-icon>
                        </div>
                        <div class="sm-suggestion__info">
                          <div class="sm-suggestion__city">{{ dest.city }}</div>
                          <div class="sm-suggestion__count">Cameroun</div>
                        </div>
                      </div>
                    }
                    @if (filteredDestinations().length === 0) {
                      <div
                        class="sm-suggestion"
                        (click)="selectCity(citySearch)"
                      >
                        <div class="sm-suggestion__icon">
                          <ion-icon name="location-outline"></ion-icon>
                        </div>
                        <div class="sm-suggestion__info">
                          <div class="sm-suggestion__city">
                            {{ citySearch }}
                          </div>
                          <div class="sm-suggestion__count">
                            Rechercher dans cette ville
                          </div>
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            }
          </div>

          <!-- Étape 2 — Dates -->
          <div
            class="sm-step"
            [class.sm-step--active]="step === 2"
            (click)="onStepClick(2, $event)"
          >
            <div class="sm-step__header">
              <span class="sm-step__label">{{
                type === 'stays' ? 'Dates du séjour' : 'Dates de location'
              }}</span>
              @if (step !== 2 && (checkin || checkout)) {
                <span class="sm-step__value"
                  >{{ checkin || '?' }} → {{ checkout || '?' }}</span
                >
              }
            </div>
            @if (step === 2) {
              <div class="sm-step__content">
                <!-- Navigation mois -->
                <div class="cal-header">
                  <button class="cal-nav" (click)="prevMonth()">‹</button>
                  <span class="cal-month">{{ getMonthLabel() }}</span>
                  <button class="cal-nav" (click)="nextMonth()">›</button>
                </div>
                <!-- Jours semaine -->
                <div class="cal-weekdays">
                  @for (d of weekdays; track d) {
                    <div class="cal-wd">{{ d }}</div>
                  }
                </div>
                <!-- Grille jours -->
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
                      (click)="onDayClick(day)"
                    >
                      {{ day.label }}
                    </div>
                  }
                </div>
                <!-- Sélection affichée -->
                <div class="cal-selection">
                  <div
                    class="cal-sel-item"
                    [class.cal-sel-item--active]="
                      !checkin || (checkin && checkout)
                    "
                  >
                    <div class="cal-sel-label">
                      {{ type === 'stays' ? 'Arrivée' : 'Prise en charge' }}
                    </div>
                    <div class="cal-sel-val">
                      {{ checkin ? formatDate(checkin) : 'Sélectionner' }}
                    </div>
                  </div>
                  <div class="cal-sel-sep">→</div>
                  <div
                    class="cal-sel-item"
                    [class.cal-sel-item--active]="checkin && !checkout"
                  >
                    <div class="cal-sel-label">
                      {{ type === 'stays' ? 'Départ' : 'Retour' }}
                    </div>
                    <div class="cal-sel-val">
                      {{ checkout ? formatDate(checkout) : 'Sélectionner' }}
                    </div>
                  </div>
                </div>
                @if (checkin && checkout) {
                  <div class="sm-duration">
                    <ion-icon name="calendar-outline"></ion-icon>
                    {{ getDuration() }} {{ type === 'stays' ? 'nuit' : 'jour'
                    }}{{ getDuration() > 1 ? 's' : '' }}
                  </div>
                }
                @if (checkinDate && !checkoutDate) {
                  @if (type === 'cars') {
                    <div
                      style="font-size:11px;color:#888;text-align:center;margin-bottom:8px;"
                    >
                      💡 Même date = 1 jour · Date suivante = 2 jours
                    </div>
                  } @else {
                    <div
                      style="font-size:11px;color:#888;text-align:center;margin-bottom:8px;"
                    >
                      Sélectionnez la date de départ
                    </div>
                  }
                }
                <!-- Raccourcis -->
                <div class="sm-date-shortcuts">
                  @for (s of dateShortcuts; track s.label) {
                    <button class="sm-shortcut" (click)="applyShortcut(s)">
                      {{ s.label }}
                    </button>
                  }
                </div>
                <!-- Bouton suivant -->
                <button
                  class="sm-next-btn"
                  [class.sm-next-btn--empty]="!checkinDate"
                  [class.sm-next-btn--partial]="checkinDate && !checkoutDate"
                  [class.sm-next-btn--ready]="checkinDate && checkoutDate"
                  (click)="goToStep3()"
                >
                  <span *ngIf="!checkinDate">Choisir une date d'arrivée</span>
                  <span *ngIf="checkinDate && !checkoutDate"
                    >Choisir une date de départ</span
                  >
                  <span *ngIf="checkinDate && checkoutDate"
                    >Suivant — {{ getDuration() }}
                    {{ type === 'stays' ? 'nuit' : 'jour'
                    }}{{ getDuration() > 1 ? 's' : '' }}</span
                  >
                </button>
              </div>
            }
          </div>

          <!-- Étape 3 — Voyageurs / Options -->
          <div
            class="sm-step"
            [class.sm-step--active]="step === 3"
            (click)="onStepClick(3, $event)"
          >
            <div class="sm-step__header">
              <span class="sm-step__label">{{
                type === 'stays' ? 'Voyageurs' : 'Options'
              }}</span>
              @if (step !== 3) {
                <span class="sm-step__value"
                  >{{ guests }} voyageur{{ guests > 1 ? 's' : '' }}</span
                >
              }
            </div>
            @if (step === 3) {
              <div class="sm-step__content">
                @if (type === 'stays') {
                  <div class="sm-counter-row">
                    <div class="sm-counter-info">
                      <div class="sm-counter-label">Voyageurs</div>
                      <div class="sm-counter-sub">Adultes et enfants</div>
                    </div>
                    <div class="sm-counter">
                      <button
                        class="sm-counter__btn"
                        (click)="decrementGuests()"
                        [disabled]="guests <= 1"
                      >
                        <ion-icon name="remove-outline"></ion-icon>
                      </button>
                      <span class="sm-counter__val">{{ guests }}</span>
                      <button
                        class="sm-counter__btn"
                        (click)="incrementGuests()"
                        [disabled]="guests >= 20"
                      >
                        <ion-icon name="add-outline"></ion-icon>
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="sm-options">
                    <div
                      class="sm-option"
                      [class.sm-option--active]="carTransmission === ''"
                      (click)="carTransmission = ''"
                    >
                      Toutes boîtes
                    </div>
                    <div
                      class="sm-option"
                      [class.sm-option--active]="
                        carTransmission === 'AUTOMATIC'
                      "
                      (click)="carTransmission = 'AUTOMATIC'"
                    >
                      Automatique
                    </div>
                    <div
                      class="sm-option"
                      [class.sm-option--active]="carTransmission === 'MANUAL'"
                      (click)="carTransmission = 'MANUAL'"
                    >
                      Manuelle
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Footer -->
        <div class="sm-footer">
          <button class="sm-reset" (click)="reset()">Réinitialiser</button>
          <button class="sm-search-btn" (click)="search()">
            <ion-icon name="search-outline"></ion-icon>
            Rechercher
          </button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: #fff;
      }
      .sm-page {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .sm-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 52px 16px 16px;
        border-bottom: 1px solid #f0f0f0;
      }
      .sm-close {
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
        flex-shrink: 0;
      }
      .sm-tabs {
        display: flex;
        gap: 4px;
        background: #f5f5f5;
        border-radius: 20px;
        padding: 4px;
      }
      .sm-tab {
        padding: 6px 16px;
        border-radius: 16px;
        border: none;
        background: transparent;
        font-size: 13px;
        font-weight: 500;
        color: #888;
        cursor: pointer;
      }
      .sm-tab--active {
        background: #fff;
        color: #1a1a2e;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }

      .sm-steps {
        flex: 1;
        padding: 8px 16px;
      }
      .sm-step {
        border: 1.5px solid #eee;
        border-radius: 16px;
        margin-bottom: 12px;
        overflow: hidden;
        transition: border-color 0.2s;
      }
      .sm-step--active {
        border-color: #1a1a2e;
      }
      .sm-step__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        cursor: pointer;
      }
      .sm-step__label {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a2e;
      }
      .sm-step__value {
        font-size: 13px;
        color: #888;
      }
      .sm-step__content {
        padding: 0 16px 16px;
      }

      .sm-input-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f5f5f5;
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 16px;
      }
      .sm-input-wrap ion-icon {
        font-size: 18px;
        color: #888;
        flex-shrink: 0;
      }
      .sm-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 15px;
        color: #1a1a2e;
        outline: none;
      }
      .sm-clear {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #888;
        display: flex;
        align-items: center;
      }

      .sm-suggestions__title {
        font-size: 12px;
        font-weight: 600;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 8px;
      }
      .sm-suggestion {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f5f5f5;
        cursor: pointer;
      }
      .sm-suggestion:last-child {
        border-bottom: none;
      }
      .sm-suggestion__icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }
      .sm-suggestion__icon ion-icon {
        font-size: 20px;
        color: #888;
      }
      .sm-suggestion__info {
        flex: 1;
      }
      .sm-suggestion__city {
        font-size: 14px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .sm-suggestion__count {
        font-size: 12px;
        color: #888;
        margin-top: 2px;
      }
      .sm-suggestion__arrow {
        font-size: 16px;
        color: #ccc;
      }

      /* Calendrier */
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
        color: #333;
      }
      .cal-month {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a2e;
      }
      .cal-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        margin-bottom: 2px;
      }
      .cal-wd {
        text-align: center;
        font-size: 10px;
        color: #aaa;
        font-weight: 500;
        padding: 2px 0;
      }
      .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        margin-bottom: 12px;
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
        transition: background 0.15s;
        margin: 0 auto;
      }
      .cal-day:hover:not(.cal-day--past):not(.cal-day--empty) {
        background: #f5f5f5;
      }
      .cal-day--empty {
        cursor: default;
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
        border-radius: 50%;
      }
      .cal-day--in-range {
        background: rgba(232, 93, 36, 0.1);
        border-radius: 0;
        color: #e85d24;
      }

      .cal-selection {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f9f9f9;
        border-radius: 10px;
        padding: 10px 12px;
        margin-bottom: 10px;
      }
      .cal-sel-item {
        flex: 1;
      }
      .cal-sel-item--active .cal-sel-label {
        color: #e85d24;
      }
      .cal-sel-label {
        font-size: 10px;
        color: #888;
        margin-bottom: 1px;
      }
      .cal-sel-val {
        font-size: 13px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .cal-sel-sep {
        color: #ccc;
        font-size: 16px;
      }

      .sm-duration {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #e85d24;
        font-weight: 500;
        margin-bottom: 12px;
      }
      .sm-date-shortcuts {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }
      .sm-shortcut {
        padding: 6px 14px;
        border-radius: 20px;
        border: 1.5px solid #eee;
        background: #fff;
        font-size: 12px;
        color: #555;
        cursor: pointer;
      }
      .sm-shortcut:hover {
        border-color: #e85d24;
        color: #e85d24;
      }

      .sm-next-btn {
        width: 100%;
        padding: 14px;
        border-radius: 12px;
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .sm-next-btn--empty {
        background: #f0f0f0;
        color: #aaa;
        cursor: not-allowed;
      }
      .sm-next-btn--partial {
        background: #f5d5c8;
        color: #e85d24;
        cursor: pointer;
      }
      .sm-next-btn--ready {
        background: #e85d24;
        color: #fff;
        cursor: pointer;
      }

      .sm-counter-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
      }
      .sm-counter-label {
        font-size: 14px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .sm-counter-sub {
        font-size: 12px;
        color: #888;
        margin-top: 2px;
      }
      .sm-counter {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .sm-counter__btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1.5px solid #ddd;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
        color: #1a1a2e;
      }
      .sm-counter__btn:disabled {
        opacity: 0.3;
        cursor: default;
      }
      .sm-counter__val {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a2e;
        min-width: 20px;
        text-align: center;
      }

      .sm-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .sm-option {
        padding: 8px 16px;
        border-radius: 20px;
        border: 1.5px solid #eee;
        font-size: 13px;
        color: #555;
        cursor: pointer;
        transition: all 0.15s;
      }
      .sm-option--active {
        border-color: #e85d24;
        color: #e85d24;
        background: rgba(232, 93, 36, 0.05);
      }

      .sm-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px env(safe-area-inset-bottom, 16px);
        border-top: 1px solid #f0f0f0;
        background: #fff;
      }
      .sm-reset {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: #888;
        text-decoration: underline;
      }
      .sm-search-btn {
        background: #e85d24;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 14px 28px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      @media (min-width: 769px) {
        .sm-page {
          max-width: 600px;
          margin: 0 auto;
        }
        .sm-header {
          padding: 24px 24px 16px;
        }
        .sm-steps {
          padding: 16px 24px;
        }
        .sm-footer {
          padding: 16px 24px;
        }
      }
      .sm-nearby-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 12px 14px;
        background: rgba(232, 93, 36, 0.05);
        border: 1.5px dashed #e85d24;
        border-radius: 12px;
        color: #e85d24;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class SearchModalPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly api = inject(ApiService);

  // État simple sans signals
  step = 1;
  city = '';
  //   checkin = '';
  //   checkout = '';
  guests = 1;
  type = 'stays';
  citySearch = '';
  dateField = 'checkin';
  carTransmission = '';
  today = new Date().toLocaleDateString('fr-CA', { timeZone: 'Africa/Douala' });
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  checkinDate = '';
  checkoutDate = '';

  get checkin() {
    return this.checkinDate;
  }
  get checkout() {
    return this.checkoutDate;
  }
  weekdays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  popularDestinations: {
    city: string;
    flag: string;
    count: number;
    isNeighborhood?: boolean;
    parentCity?: string;
  }[] = [];

  dateShortcuts = [
    { label: 'Ce week-end', days: 2 },
    { label: '1 semaine', days: 7 },
    { label: '2 semaines', days: 14 },
    { label: '1 mois', days: 30 },
  ];

  constructor() {
    addIcons({
      closeOutline,
      searchOutline,
      locationOutline,
      calendarOutline,
      peopleOutline,
      removeOutline,
      addOutline,
      arrowForwardOutline,
      navigateOutline,
    });
  }
  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.type = params['type'] || 'stays';
    if (params['city']) {
      this.city = params['city'];
      this.citySearch = params['city'];
    }
    if (params['checkin']) this.checkinDate = params['checkin'];
    if (params['checkout']) this.checkoutDate = params['checkout'];
    if (params['guests']) this.guests = parseInt(params['guests']);
    if (params['step']) this.step = parseInt(params['step']);

    // Forcer la détection toutes les 100ms
    let checkCount = 0;
    const timer = setInterval(() => {
      this.cdr.detectChanges();
      checkCount++;
      if (checkCount > 300) clearInterval(timer); // 30 secondes max
    }, 100);
    this.loadCitiesStats();
  }
  getNextBtnText(): string {
    if (!this.checkinDate) return "Choisir une date d'arrivée";
    if (!this.checkoutDate) return 'Choisir une date de départ';
    const duration = this.getDuration();
    const unit = this.type === 'cars' ? 'jour' : 'nuit';
    return `Suivant — ${duration} ${unit}${duration > 1 ? 's' : ''}`;
  }

  getNextBtnClass(): string {
    if (!this.checkinDate) return 'sm-next-btn sm-next-btn--empty';
    if (!this.checkoutDate) return 'sm-next-btn sm-next-btn--partial';
    return 'sm-next-btn sm-next-btn--ready';
  }

  filteredDestinations() {
    if (!this.citySearch) return this.popularDestinations;
    return this.popularDestinations.filter((d) =>
      d.city.toLowerCase().includes(this.citySearch.toLowerCase()),
    );
  }

  selectCity(city: string) {
    this.city = city;
    this.citySearch = city; // ← ici on met le nom propre de la ville
    this.step = 2;
    this.cdr.detectChanges();
  }
  onCitySearch() {
    if (!this.citySearch) this.city = '';
  }

  onDayClick(day: any) {
    if (!day.isPast && day.date) this.selectDate(day.date);
  }

  selectDate(date: string) {
    if (!this.checkinDate || (this.checkinDate && this.checkoutDate)) {
      this.checkinDate = date;
      this.checkoutDate = '';
    } else if (
      this.type === 'cars' ? date >= this.checkinDate : date > this.checkinDate
    ) {
      this.checkoutDate = date;
    } else {
      this.checkinDate = date;
      this.checkoutDate = '';
    }
    this.cdr.detectChanges();
  }

  getDuration(): number {
    if (!this.checkinDate || !this.checkoutDate) return 0;
    const diff = Math.ceil(
      (new Date(this.checkoutDate).getTime() -
        new Date(this.checkinDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    // Pour voitures : minimum 1 jour même si même date
    if (this.type === 'cars') return Math.max(diff, 1);
    return diff;
  }
  applyShortcut(shortcut: { label: string; days: number }) {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + shortcut.days);
    this.checkinDate = start.toISOString().split('T')[0];
    this.checkoutDate = end.toISOString().split('T')[0];
  }

  goToStep3() {
    if (!this.checkinDate) return;
    if (!this.checkoutDate) {
      const start = new Date(this.checkinDate);
      start.setDate(start.getDate() + 3);
      this.checkoutDate = start.toISOString().split('T')[0];
    }
    this.step = 3;
  }

  onStepClick(stepNum: number, event: Event) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) return;
    if (this.step !== stepNum) this.step = stepNum;
  }

  incrementGuests() {
    if (this.guests < 20) this.guests++;
  }
  decrementGuests() {
    if (this.guests > 1) this.guests--;
  }

  reset() {
    this.city = '';
    this.citySearch = '';
    this.checkinDate = '';
    this.checkoutDate = '';
    this.guests = 1;
    this.step = 1;
  }

  search() {
    if (this.type === 'cars') {
      this.router.navigate(['/cars'], {
        queryParams: {
          city: this.city || undefined,
          pickup: this.checkinDate || undefined,
          returnDate: this.checkoutDate || undefined,
          transmission: this.carTransmission || undefined,
        },
      });
    } else {
      this.router.navigate(['/search'], {
        queryParams: {
          city: this.city || undefined,
          checkin: this.checkinDate || undefined,
          checkout: this.checkoutDate || undefined,
          guests: this.guests > 1 ? this.guests : undefined,
        },
      });
    }
  }

  close() {
    this.router.navigate(['/']);
  }

  getMonthLabel(): string {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
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
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }
  searchNearby() {
    if (!navigator.geolocation) {
      alert('Géolocalisation non disponible');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Naviguer vers la recherche avec les coordonnées
        this.router.navigate(['/search'], {
          queryParams: {
            lat: latitude.toFixed(4),
            lng: longitude.toFixed(4),
            nearby: true,
          },
        });
      },
      () => alert("Impossible d'obtenir votre position"),
    );
  }
  async loadCitiesStats() {
    try {
      const [cities, neighborhoods] = await Promise.all([
        this.api.get<{ city: string; count: number }[]>(
          'properties/cities/stats',
        ),
        this.api.get<{ city: string; parentCity: string; count: number }[]>(
          'properties/neighborhoods/stats',
        ),
      ]);

      const flags: Record<string, string> = {
        Douala: '🏙️',
        Yaoundé: '🌆',
        Bafoussam: '🌄',
        Kribi: '🏖️',
        Limbe: '🌊',
        Buea: '⛰️',
        Garoua: '🌅',
        Ngaoundéré: '🏞️',
      };

      const cityList = cities
        .filter((s) => s.count > 0)
        .map((s) => ({
          city: s.city,
          flag: flags[s.city] || '🏙️',
          count: s.count,
          isNeighborhood: false,
          parentCity: '',
        }));

      const neighborhoodList = neighborhoods
        .filter((s) => s.count > 0)
        .map((s) => ({
          city: s.city,
          flag: '📍',
          count: s.count,
          isNeighborhood: true,
          parentCity: s.parentCity,
        }));

      this.popularDestinations = [...cityList, ...neighborhoodList];
      this.cdr.detectChanges();
    } catch (err) {
      console.error('erreur:', err);
    }
  }
  onStep1Click(event: Event) {
    const target = event.target as HTMLElement;
    // Ne pas changer de step si on clique sur input, button ou suggestion
    if (target.closest('.sm-step__content')) return;
    this.step = 1;
  }
}
