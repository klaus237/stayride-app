import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  locationOutline,
  starOutline,
  filterOutline,
  carOutline,
  peopleOutline,
  flashOutline,
} from 'ionicons/icons';
import { CarsService } from '../../../core/services/cars.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-cars-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    IonContent,
    IonIcon,
    //  IonSpinner,
    CurrencyFormatPipe,
  ],
  template: `
    <ion-content>
      <div class="page">
        <!-- Header -->
        <div class="sr-header">
          <button class="back-btn" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </button>
          <div class="header-center">
            <h1 class="header-title">Voitures disponibles</h1>
            <p class="header-sub">{{ city() || 'Toutes les villes' }}</p>
          </div>
          <button class="filter-btn" (click)="showFilters = !showFilters">
            <ion-icon name="filter-outline"></ion-icon>
          </button>
        </div>

        <!-- Filtres rapides -->
        <div class="quick-filters">
          @for (cat of categories; track cat.value) {
            <div
              class="filter-chip"
              [class.filter-chip--active]="selectedCategory() === cat.value"
              (click)="setCategory(cat.value)"
            >
              {{ cat.label }}
            </div>
          }
        </div>

        <!-- Résultats -->
        <div class="sr-body">
          @if (isLoading()) {
            <div class="loading-grid">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="skeleton"></div>
              }
            </div>
          } @else {
            <p class="results-count">
              {{ total() }} véhicule{{ total() > 1 ? 's' : '' }} disponible{{
                total() > 1 ? 's' : ''
              }}
            </p>
            <div class="cars-grid">
              @for (car of cars(); track car.id) {
                <div
                  class="car-card"
                  [routerLink]="['/cars', car.slug]"
                  [queryParams]="{ checkin: checkin, checkout: checkout }"
                >
                  <div class="car-card__img">
                    <img
                      [src]="
                        car.coverImageUrl ||
                        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
                      "
                      [alt]="car.brand + ' ' + car.model"
                      loading="lazy"
                    />
                    <span class="car-card__category">{{
                      getCategoryLabel(car.category)
                    }}</span>
                  </div>
                  <div class="car-card__body">
                    <h3 class="car-card__title">
                      {{ car.brand }} {{ car.model }}
                    </h3>
                    <p class="car-card__year">
                      {{ car.year }} · {{ car.color }}
                    </p>
                    <div class="car-card__specs">
                      <span>
                        <ion-icon name="people-outline"></ion-icon>
                        {{ car.seats }} places
                      </span>
                      <span>
                        <ion-icon name="flash-outline"></ion-icon>
                        {{ getTransLabel(car.transmission) }}
                      </span>
                      <span>
                        <ion-icon name="location-outline"></ion-icon>
                        {{ car.city }}
                      </span>
                    </div>
                    @if (car.features?.length) {
                      <div class="car-card__features">
                        @for (f of car.features.slice(0, 3); track f) {
                          <span class="feature-tag">{{ f }}</span>
                        }
                      </div>
                    }
                    <div class="car-card__footer">
                      <div class="car-card__price">
                        <strong>{{
                          car.pricePerDay | currencyFormat: 'XAF'
                        }}</strong>
                        <span>/jour</span>
                      </div>
                      <div class="car-card__rating">
                        <ion-icon name="star-outline"></ion-icon>
                        {{ car.avgRating | number: '1.1-1' }}
                      </div>
                    </div>
                  </div>
                </div>
              }
              @if (cars().length === 0) {
                <div class="empty">
                  <ion-icon
                    name="car-outline"
                    style="font-size:48px;color:#ddd;"
                  ></ion-icon>
                  <p>Aucun véhicule disponible</p>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-content {
        --background: #f5f5f5;
      }
      .page {
        padding-bottom: 32px;
      }

      .sr-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 52px 16px 16px;
        background: #fff;
        border-bottom: 1px solid #eee;
      }
      .back-btn,
      .filter-btn {
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
        color: #333;
        flex-shrink: 0;
      }
      .header-center {
        flex: 1;
      }
      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0;
      }
      .header-sub {
        font-size: 12px;
        color: #888;
        margin: 2px 0 0;
      }

      .quick-filters {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 12px 16px;
        background: #fff;
        border-bottom: 1px solid #eee;
        scrollbar-width: none;
      }
      .quick-filters::-webkit-scrollbar {
        display: none;
      }
      .filter-chip {
        padding: 6px 14px;
        border-radius: 20px;
        border: 1.5px solid #eee;
        font-size: 12px;
        font-weight: 500;
        color: #555;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .filter-chip--active {
        background: #e85d24;
        color: #fff;
        border-color: #e85d24;
      }

      .sr-body {
        padding: 16px;
      }
      .results-count {
        font-size: 13px;
        color: #888;
        margin: 0 0 16px;
      }

      .loading-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .skeleton {
        height: 220px;
        border-radius: 12px;
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e8e8e8 50%,
          #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .cars-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .car-card {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        cursor: pointer;
        transition:
          transform 0.15s,
          box-shadow 0.15s;
        display: block;
        text-decoration: none;
        color: inherit;
      }
      .car-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      .car-card__img {
        height: 130px;
        position: relative;
        overflow: hidden;
        background: #eee;
      }
      .car-card__img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .car-card__category {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 6px;
        padding: 2px 8px;
        font-size: 10px;
        font-weight: 500;
      }

      .car-card__body {
        padding: 10px 12px;
      }
      .car-card__title {
        font-size: 13px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0 0 2px;
      }
      .car-card__year {
        font-size: 11px;
        color: #888;
        margin: 0 0 8px;
      }

      .car-card__specs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
      }
      .car-card__specs span {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 10px;
        color: #666;
      }
      .car-card__specs ion-icon {
        font-size: 12px;
        color: #e85d24;
      }

      .car-card__features {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 8px;
      }
      .feature-tag {
        background: rgba(232, 93, 36, 0.08);
        color: #e85d24;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 10px;
      }

      .car-card__footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .car-card__price {
        display: flex;
        align-items: baseline;
        gap: 3px;
      }
      .car-card__price strong {
        font-size: 14px;
        font-weight: 700;
        color: #e85d24;
      }
      .car-card__price span {
        font-size: 10px;
        color: #888;
      }
      .car-card__rating {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        color: #888;
      }
      .car-card__rating ion-icon {
        font-size: 12px;
        color: #f59e0b;
      }

      .empty {
        grid-column: 1/-1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        gap: 12px;
        color: #888;
      }

      @media (min-width: 769px) {
        .sr-header {
          padding: 16px 48px;
        }
        .quick-filters {
          padding: 12px 48px;
        }
        .sr-body {
          padding: 24px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .cars-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .car-card__img {
          height: 180px;
        }
      }
      @media (min-width: 1100px) {
        .cars-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }
    `,
  ],
})
export class CarsListPage implements OnInit {
  private readonly carsService = inject(CarsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  cars = signal<any[]>([]);
  isLoading = signal(true);
  total = signal(0);
  city = signal('');
  selectedCategory = signal('');
  showFilters = false;

  checkin = '';
  checkout = '';

  categories = [
    { label: 'Tous', value: '' },
    { label: 'Berline', value: 'SEDAN' },
    { label: 'SUV', value: 'SUV' },
    { label: 'Luxe', value: 'LUXURY' },
    { label: 'Économique', value: 'ECONOMY' },
    { label: 'Van', value: 'VAN' },
    { label: 'Pickup', value: 'PICKUP' },
  ];

  constructor() {
    addIcons({
      arrowBackOutline,
      locationOutline,
      starOutline,
      filterOutline,
      carOutline,
      peopleOutline,
      flashOutline,
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.city.set(params['city'] || '');
      this.checkin = params['pickup'] || params['checkin'] || '';
      this.checkout = params['returnDate'] || params['checkout'] || '';
      await this.load({ city: params['city'] });
    });
  }

  async load(filters?: any) {
    this.isLoading.set(true);
    try {
      const result = await this.carsService.search({
        ...filters,
        category: this.selectedCategory() || undefined,
      });
      this.cars.set(result.data || []);
      this.total.set(result.meta?.total || 0);
    } catch {
      this.cars.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async setCategory(value: string) {
    this.selectedCategory.set(value);
    await this.load({ city: this.city() || undefined });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      SEDAN: 'Berline',
      SUV: 'SUV',
      LUXURY: 'Luxe',
      ECONOMY: 'Économique',
      VAN: 'Van',
      PICKUP: 'Pickup',
      ELECTRIC: 'Électrique',
    };
    return labels[cat] || cat;
  }

  getTransLabel(trans: string): string {
    return trans === 'AUTOMATIC' ? 'Automatique' : 'Manuelle';
  }
}
