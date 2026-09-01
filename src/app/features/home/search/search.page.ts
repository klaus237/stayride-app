import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  locationOutline,
  starOutline,
  heartOutline,
} from 'ionicons/icons';
import { PropertiesService } from '../../../core/services/properties.service';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-search',
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
      <div class="page-wrap">
        <!-- Header -->
        <div class="search-header">
          <button class="back-btn" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </button>
          <div>
            <h1 class="page-title">{{ city() || 'Tous les appartements' }}</h1>
            @if (checkin && checkout) {
              <div class="search-dates">
                {{ formatDate(checkin) }} → {{ formatDate(checkout) }} ·
                {{ guests }} voyageur{{ guests > 1 ? 's' : '' }}
              </div>
            }
          </div>
        </div>

        <!-- Résultats -->
        @if (isLoading()) {
          <div class="loading-center">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
        } @else {
          <div class="results-count">
            {{ total() }} résultat{{ total() > 1 ? 's' : '' }}
          </div>
          <div class="results-grid">
            @for (property of properties(); track property.id) {
              <div
                class="property-card"
                [class.property-card--unavailable]="isUnavailable(property.id)"
                [routerLink]="['/properties', property.slug]"
                [queryParams]="{
                  checkin: checkin,
                  checkout: checkout,
                  guests: guests,
                }"
              >
                <div class="card-img">
                  <img
                    [src]="
                      property.coverImageUrl ||
                      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'
                    "
                    [alt]="property.title"
                    loading="lazy"
                  />
                  @if (isUnavailable(property.id)) {
                    <div class="unavailable-badge">Complet</div>
                  }
                  <button
                    class="wishlist-btn"
                    (click)="$event.stopPropagation()"
                  >
                    <ion-icon name="heart-outline"></ion-icon>
                  </button>
                </div>
                <div class="card-body">
                  <div class="card-location">
                    <ion-icon name="location-outline"></ion-icon>
                    {{ property.neighborhood || property.city }}
                  </div>
                  <h3 class="card-title">{{ property.title }}</h3>
                  <div class="card-meta">
                    <span class="rating">
                      <ion-icon name="star-outline"></ion-icon>
                      {{ property.avgRating || '0.0' }}
                    </span>
                    <span
                      >{{ property.bedrooms }} ch ·
                      {{ property.maxGuests }} pers.</span
                    >
                  </div>
                  <div class="card-price">
                    <span class="price">{{
                      property.pricePerNight | currencyFormat: 'XAF'
                    }}</span>
                    <span class="price-unit">/nuit</span>
                  </div>
                </div>
              </div>
            }
            @if (properties().length === 0) {
              <div class="empty"><p>Aucun résultat trouvé</p></div>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [
    `
      .page-wrap {
        padding-bottom: 24px;
      }

      .search-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 52px 16px 16px;
        background: #fff;
        border-bottom: 1px solid #eee;
      }
      .back-btn {
        background: none;
        border: none;
        font-size: 22px;
        cursor: pointer;
        color: #1a1a2e;
        display: flex;
        padding: 4px;
        flex-shrink: 0;
      }
      .page-title {
        font-size: 17px;
        font-weight: 600;
        margin: 0;
        color: #1a1a2e;
      }
      .search-dates {
        font-size: 11px;
        color: #888;
        margin-top: 2px;
      }

      .loading-center {
        display: flex;
        justify-content: center;
        padding: 48px;
      }
      .results-count {
        padding: 12px 16px;
        font-size: 13px;
        color: #888;
      }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        padding: 0 16px;
      }

      .property-card {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        cursor: pointer;
        transition: transform 0.15s;
      }
      .property-card:hover {
        transform: translateY(-2px);
      }
      .property-card--unavailable {
        opacity: 0.6;
      }

      .card-img {
        height: 120px;
        position: relative;
        overflow: hidden;
        background: #eee;
      }
      .card-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .unavailable-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(0, 0, 0, 0.75);
        color: #fff;
        border-radius: 6px;
        padding: 3px 8px;
        font-size: 11px;
        font-weight: 600;
      }

      .wishlist-btn {
        position: absolute;
        top: 6px;
        right: 6px;
        background: rgba(0, 0, 0, 0.3);
        border: none;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;
        font-size: 14px;
      }

      .card-body {
        padding: 8px 10px;
      }
      .card-location {
        font-size: 10px;
        color: #888;
        display: flex;
        align-items: center;
        gap: 2px;
        margin-bottom: 2px;
      }
      .card-title {
        font-size: 12px;
        font-weight: 500;
        margin: 0 0 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #1a1a2e;
      }
      .card-meta {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        color: #888;
        margin-bottom: 4px;
      }
      .rating {
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .card-price {
        display: flex;
        align-items: baseline;
        gap: 2px;
      }
      .price {
        font-size: 13px;
        font-weight: 600;
        color: #e85d24;
      }
      .price-unit {
        font-size: 10px;
        color: #888;
      }

      .empty {
        grid-column: 1/-1;
        text-align: center;
        padding: 48px;
        color: #888;
      }

      @media (min-width: 769px) {
        .results-grid {
          grid-template-columns: repeat(3, 1fr);
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 24px;
        }
        .card-img {
          height: 160px;
        }
      }
      @media (min-width: 1100px) {
        .results-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }
    `,
  ],
})
export class SearchPage implements OnInit {
  private readonly propertiesService = inject(PropertiesService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  properties = signal<any[]>([]);
  isLoading = signal(true);
  total = signal(0);
  city = signal('');
  checkin = '';
  checkout = '';
  guests = 1;
  unavailableIds = new Set<string>();

  constructor() {
    addIcons({ arrowBackOutline, locationOutline, starOutline, heartOutline });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.city.set(params['city'] || '');
      this.checkin = params['checkin'] || '';
      this.checkout = params['checkout'] || '';
      this.guests = parseInt(params['guests']) || 1;
      await this.loadProperties(params);
    });
  }

  async loadProperties(params: any) {
    this.isLoading.set(true);
    try {
      const result = await this.propertiesService.search({
        city: params['city'],
        page: 1,
      });
      this.properties.set(result.data || []);
      this.total.set(result.meta?.total || 0);

      if (this.checkin && this.checkout && this.properties().length > 0) {
        await this.checkAvailability();
      }
    } catch {
      this.properties.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async checkAvailability() {
    try {
      const ids = this.properties().map((p) => p.id);
      const result = await this.api.post<string[]>(
        'properties/check-availability',
        {
          property_ids: ids,
          checkin: this.checkin,
          checkout: this.checkout,
        },
      );
      this.unavailableIds = new Set(result);
    } catch {
      this.unavailableIds = new Set();
    }
  }

  isUnavailable(id: string): boolean {
    return this.unavailableIds.has(id);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  goBack() {
    window.history.back();
  }
}
