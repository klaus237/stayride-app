import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  searchOutline,
  calendarOutline,
  chatbubbleOutline,
  carOutline,
  locationOutline,
  heartOutline,
  starOutline,
  logOutOutline,
  settingsOutline,
  businessOutline,
} from 'ionicons/icons';
import { PropertiesService } from '../../../core/services/properties.service';
import { Property } from '../../../core/models';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { AuthState } from '../../../core/auth/auth.state';
import { AuthService } from '../../../core/auth/auth.service';
import { CarsService } from '../../../core/services/cars.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    // IonSegment,
    // IonSegmentButton,
    // IonLabel,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    CurrencyFormatPipe,
  ],
  template: `
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="onRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Navbar desktop -->
      <nav class="sr-nav">
        <div class="sr-nav__brand">StayRide</div>
        <div class="sr-nav__links">
          <span (click)="setTab('stays')">Séjours</span>
          <span (click)="setTab('cars')">Voitures</span>
          <span (click)="goToExplore()">Explorer</span>
          @if (
            authState.isAuthenticated() &&
            authState.currentUser()?.role === 'CUSTOMER'
          ) {
            <span [routerLink]="['/app/trips']">Mes réservations</span>
          }
        </div>
        <div class="sr-nav__actions">
          @if (authState.isAuthenticated()) {
            @if (authState.currentUser()?.role !== 'ADMIN') {
              <span class="sr-nav__user">{{ authState.userFullName() }}</span>
            }
            @if (authState.currentUser()?.role === 'ADMIN') {
              <a routerLink="/admin/dashboard" class="sr-btn-primary"
                >Dashboard Admin</a
              >
            }
            <button
              class="sr-btn-primary"
              style="background:#666;"
              (click)="onLogout()"
            >
              Déconnexion
            </button>
          } @else {
            <a routerLink="/auth/login" class="sr-nav__login">Connexion</a>
            <a routerLink="/auth/register" class="sr-btn-primary">S'inscrire</a>
          }
        </div>
      </nav>

      <!-- Hero -->
      <div class="sr-hero">
        <div class="sr-hero__inner">
          <div class="sr-hero__title">StayRide</div>
          <p class="sr-hero__sub">Appartements & Voitures au Cameroun</p>

          <div class="sr-tabs">
            <button
              class="sr-tab"
              [class.sr-tab--active]="activeTab === 'stays'"
              (click)="setTab('stays')"
            >
              <ion-icon name="home-outline"></ion-icon>
              Séjours
            </button>
            <button
              class="sr-tab"
              [class.sr-tab--active]="activeTab === 'cars'"
              (click)="setTab('cars')"
            >
              <ion-icon name="car-outline"></ion-icon>
              Voitures
            </button>
          </div>

          <div class="sr-search">
            <div class="sr-search__field" (click)="openSearch()">
              <ion-icon name="location-outline"></ion-icon>
              <span>{{
                city ||
                  (activeTab === 'stays'
                    ? 'Ville, quartier...'
                    : 'Ville de prise en charge...')
              }}</span>
            </div>
            @if (activeTab === 'stays') {
              <div class="sr-search__dates">
                <div
                  class="sr-search__date"
                  (click)="openDatePicker('checkin')"
                >
                  <ion-icon name="calendar-outline"></ion-icon>
                  <span>{{ checkin || 'Arrivée' }}</span>
                </div>
                <span class="sr-search__sep">→</span>
                <div
                  class="sr-search__date"
                  (click)="openDatePicker('checkout')"
                >
                  <ion-icon name="calendar-outline"></ion-icon>
                  <span>{{ checkout || 'Départ' }}</span>
                </div>
              </div>
            }
            @if (activeTab === 'cars') {
              <div class="sr-search__dates">
                <div
                  class="sr-search__date"
                  (click)="openDatePicker('checkin')"
                >
                  <ion-icon name="calendar-outline"></ion-icon>
                  <span>{{ checkin || 'Date de prise en charge' }}</span>
                </div>
                <span class="sr-search__sep">→</span>
                <div
                  class="sr-search__date"
                  (click)="openDatePicker('checkout')"
                >
                  <ion-icon name="calendar-outline"></ion-icon>
                  <span>{{ checkout || 'Date de retour' }}</span>
                </div>
              </div>
            }
            <button class="sr-search__btn" (click)="goToSearch()">
              <ion-icon name="search-outline"></ion-icon>
              Rechercher
            </button>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="sr-body">
        <!-- Appartements populaires -->
        @if (activeTab === 'stays') {
          <div class="sr-section">
            <div class="sr-section__header">
              <h2 class="sr-section__title">Populaires</h2>
              <span class="sr-section__link" (click)="goToSearch()"
                >Voir tout</span
              >
            </div>
            @if (isLoading()) {
              <div class="sr-grid">
                @for (i of [1, 2, 3, 4, 5, 6]; track i) {
                  <div class="sr-skeleton"></div>
                }
              </div>
            } @else {
              <div class="sr-grid">
                @for (p of properties(); track p.id) {
                  <div class="sr-card" [routerLink]="['/properties', p.slug]">
                    <div class="sr-card__img">
                      <img
                        [src]="getCoverImage(p)"
                        [alt]="p.title"
                        loading="lazy"
                      />
                      <button
                        class="sr-card__wish"
                        (click)="toggleWishlist($event, p.id)"
                      >
                        <ion-icon name="heart-outline"></ion-icon>
                      </button>
                    </div>
                    <div class="sr-card__body">
                      <div class="sr-card__loc">
                        <ion-icon name="location-outline"></ion-icon>
                        {{ p.neighborhood || p.city }}
                      </div>
                      <h3 class="sr-card__title">{{ p.title }}</h3>
                      <div class="sr-card__meta">
                        <span
                          ><ion-icon name="star-outline"></ion-icon>
                          {{ p.avgRating | number: '1.1-1' }} ({{
                            p.reviewCount
                          }})</span
                        >
                        <span>{{ p.bedrooms }}ch · {{ p.maxGuests }}p</span>
                      </div>
                      <div class="sr-card__price">
                        <strong>{{
                          p.pricePerNight | currencyFormat: 'XAF'
                        }}</strong>
                        <span>/nuit</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Voitures disponibles -->
        @if (activeTab === 'cars') {
          <div class="sr-section">
            <div class="sr-section__header">
              <h2 class="sr-section__title">Véhicules disponibles</h2>
              <span class="sr-section__link" [routerLink]="['/cars']"
                >Voir tout</span
              >
            </div>
            @if (isLoadingCars()) {
              <div class="sr-grid">
                @for (i of [1, 2, 3, 4]; track i) {
                  <div class="sr-skeleton"></div>
                }
              </div>
            } @else {
              <div class="sr-grid">
                @for (car of cars(); track car.id) {
                  <div class="sr-card" [routerLink]="['/cars', car.slug]">
                    <div class="sr-card__img" style="position:relative;">
                      <img
                        [src]="
                          car.coverImageUrl ||
                          'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
                        "
                        [alt]="car.brand + ' ' + car.model"
                        loading="lazy"
                      />
                      <span class="sr-card__badge">{{
                        getCategoryLabel(car.category)
                      }}</span>
                    </div>
                    <div class="sr-card__body">
                      <div class="sr-card__loc">
                        <ion-icon name="location-outline"></ion-icon>
                        {{ car.city }}
                      </div>
                      <h3 class="sr-card__title">
                        {{ car.brand }} {{ car.model }} {{ car.year }}
                      </h3>
                      <div class="sr-card__meta">
                        <span
                          >{{ car.seats }} places ·
                          {{
                            car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manuel'
                          }}</span
                        >
                      </div>
                      <div class="sr-card__price">
                        <strong>{{
                          car.pricePerDay | currencyFormat: 'XAF'
                        }}</strong>
                        <span>/jour</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Villes -->
        <div class="sr-section">
          <h2 class="sr-section__title">Explorer par ville</h2>
          <div class="sr-cities">
            @for (c of popularCities; track c.name) {
              <div class="sr-city" (click)="searchByCity(c.name)">
                <span class="sr-city__flag">{{ c.flag }}</span>
                <span class="sr-city__name">{{ c.name }}</span>
                <span class="sr-city__count">{{ c.count }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Tab bar mobile -->
      <div class="sr-tabbar">
        <div class="sr-tabbar__item sr-tabbar__item--active">
          <ion-icon name="home-outline"></ion-icon>
          <span>Accueil</span>
        </div>
        <div class="sr-tabbar__item" (click)="goToExplore()">
          <ion-icon name="search-outline"></ion-icon>
          <span>Explorer</span>
        </div>
        @if (authState.currentUser()?.role === 'CUSTOMER') {
          <div class="sr-tabbar__item" [routerLink]="['/app/trips']">
            <ion-icon name="calendar-outline"></ion-icon>
            <span>Voyages</span>
          </div>
        } @else if (authState.currentUser()?.role === 'ADMIN') {
          <div class="sr-tabbar__item" [routerLink]="['/admin/dashboard']">
            <ion-icon name="settings-outline"></ion-icon>
            <span>Admin</span>
          </div>
        } @else if (authState.currentUser()?.role === 'OWNER') {
          <div class="sr-tabbar__item" [routerLink]="['/owner/dashboard']">
            <ion-icon name="business-outline"></ion-icon>
            <span>Mon espace</span>
          </div>
        }
        <div class="sr-tabbar__item" [routerLink]="['/app/messages']">
          <ion-icon name="chatbubble-outline"></ion-icon>
          <span>Messages</span>
        </div>
        @if (authState.isAuthenticated()) {
          @if (authState.currentUser()?.role === 'ADMIN') {
            <div class="sr-tabbar__item" [routerLink]="['/admin/dashboard']">
              <ion-icon name="settings-outline"></ion-icon>
              <span>Admin</span>
            </div>
          } @else {
            <div class="sr-tabbar__item" (click)="onLogout()">
              <ion-icon name="log-out-outline"></ion-icon>
              <span>Quitter</span>
            </div>
          }
        } @else {
          <div class="sr-tabbar__item" [routerLink]="['/auth/login']">
            <ion-icon name="log-out-outline"></ion-icon>
            <span>Connexion</span>
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

      /* ── Navbar desktop ── */
      .sr-nav {
        display: none;
        align-items: center;
        justify-content: space-between;
        padding: 0 48px;
        height: 64px;
        background: #fff;
        border-bottom: 1px solid #eee;
        position: sticky;
        top: 0;
        z-index: 200;
      }
      .sr-nav__brand {
        font-size: 20px;
        font-weight: 700;
        color: #e85d24;
      }
      .sr-nav__links {
        display: flex;
        gap: 32px;
      }
      .sr-nav__links span {
        font-size: 14px;
        cursor: pointer;
        color: #333;
      }
      .sr-nav__links span:hover {
        color: #e85d24;
      }
      .sr-nav__actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .sr-nav__user {
        font-size: 14px;
        color: #666;
      }
      .sr-nav__login {
        font-size: 14px;
        color: #333;
        text-decoration: none;
      }
      .sr-btn-primary {
        background: #e85d24;
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 8px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
      }

      /* ── Hero ── */
      .sr-hero {
        background: linear-gradient(160deg, #1a1a2e 0%, #16213e 100%);
        padding: 40px 16px 32px;
      }
      .sr-hero__inner {
        max-width: 680px;
        margin: 0 auto;
      }
      .sr-hero__title {
        font-size: 24px;
        font-weight: 700;
        color: #fff;
      }
      .sr-hero__sub {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        margin: 4px 0 16px;
      }
      .sr-segment {
        --background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        margin-bottom: 12px;
        --color: rgba(255, 255, 255, 0.7);
        --color-checked: #fff;
        --indicator-color: rgba(255, 255, 255, 0.2);
      }
      .sr-search {
        background: rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        padding: 10px;
      }
      .sr-search__field {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }
      .sr-search__dates {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
      }
      .sr-search__date {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 9px 10px;
        background: rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
      }
      .sr-search__sep {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
      }
      .sr-search__btn {
        width: 100%;
        background: #e85d24;
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 12px;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
      }

      /* ── Body ── */
      .sr-body {
        padding: 24px 16px 100px;
        max-width: 1200px;
        margin: 0 auto;
      }

      /* ── Section ── */
      .sr-section {
        margin-bottom: 32px;
      }
      .sr-section__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .sr-section__title {
        font-size: 18px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0 0 16px;
      }
      .sr-section__link {
        font-size: 13px;
        color: #e85d24;
        cursor: pointer;
      }

      /* ── Grid ── */
      .sr-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      /* ── Card ── */
      .sr-card {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        cursor: pointer;
        transition:
          transform 0.15s,
          box-shadow 0.15s;
      }
      .sr-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }
      .sr-card__img {
        height: 140px;
        position: relative;
        overflow: hidden;
        background: #eee;
      }
      .sr-card__img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .sr-card__wish {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.3);
        border: none;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;
        font-size: 14px;
      }
      .sr-card__body {
        padding: 10px 12px;
      }
      .sr-card__loc {
        font-size: 11px;
        color: #888;
        display: flex;
        align-items: center;
        gap: 3px;
        margin-bottom: 3px;
      }
      .sr-card__title {
        font-size: 13px;
        font-weight: 500;
        color: #1a1a2e;
        margin: 0 0 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sr-card__meta {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #888;
        margin-bottom: 5px;
      }
      .sr-card__meta span {
        display: flex;
        align-items: center;
        gap: 3px;
      }
      .sr-card__price {
        display: flex;
        align-items: baseline;
        gap: 3px;
      }
      .sr-card__price strong {
        font-size: 14px;
        font-weight: 600;
        color: #e85d24;
      }
      .sr-card__price span {
        font-size: 11px;
        color: #888;
      }

      /* ── Skeleton ── */
      .sr-skeleton {
        height: 200px;
        border-radius: 12px;
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e0e0e0 50%,
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

      /* ── Villes ── */
      .sr-cities {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
      }
      .sr-city {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        background: #fff;
        border-radius: 10px;
        padding: 12px 8px;
        cursor: pointer;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
      }
      .sr-city__flag {
        font-size: 24px;
      }
      .sr-city__name {
        font-size: 12px;
        font-weight: 500;
        color: #1a1a2e;
      }
      .sr-city__count {
        font-size: 10px;
        color: #888;
      }

      /* ── Tab bar mobile ── */
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
      .sr-tabs {
        display: flex;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 4px;
        margin-bottom: 12px;
      }
      .sr-tab {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .sr-tab--active {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        font-weight: 500;
      }
      .sr-tab ion-icon {
        font-size: 18px;
      }
      .sr-card__badge {
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
      .sr-card__img {
        position: relative;
      }
    `,
  ],
})
export class LandingPage implements OnInit {
  private readonly propertiesService = inject(PropertiesService);
  private readonly router = inject(Router);
  readonly authState = inject(AuthState);
  private readonly authService = inject(AuthService);
  private readonly carsService = inject(CarsService);
  private readonly route = inject(ActivatedRoute);

  activeTab = 'stays';
  city = '';
  checkin = '';
  checkout = '';

  properties = signal<Property[]>([]);
  isLoading = signal(true);

  cars = signal<any[]>([]);
  isLoadingCars = signal(false);

  popularCities = [
    { name: 'Douala', flag: '🏙️', count: '24 biens' },
    { name: 'Yaoundé', flag: '🌆', count: '18 biens' },
    { name: 'Bafoussam', flag: '🌄', count: '8 biens' },
    { name: 'Kribi', flag: '🏖️', count: '6 biens' },
    { name: 'Limbe', flag: '🌊', count: '5 biens' },
  ];

  constructor() {
    addIcons({
      homeOutline,
      searchOutline,
      calendarOutline,
      chatbubbleOutline,
      carOutline,
      locationOutline,
      heartOutline,
      starOutline,
      logOutOutline,
      settingsOutline,
      businessOutline,
    });
  }

  ngOnInit() {
    // Récupérer la ville depuis les queryParams si retour du modal
    this.route.queryParams.subscribe((params) => {
      if (params['city']) this.city = params['city'];
      if (params['checkin']) this.checkin = params['checkin'];
      if (params['checkout']) this.checkout = params['checkout'];
    });
    this.load();
  }

  async load() {
    this.isLoading.set(true);
    try {
      const data = await this.propertiesService.getFeatured();
      this.properties.set(data);
    } catch {
      this.properties.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onLogout() {
    await this.authService.logout();
  }
  // goToSearch() {
  //   if (this.activeTab === 'cars') {
  //     this.router.navigate(['/cars'], {
  //       queryParams: { city: this.city || undefined },
  //     });
  //   } else {
  //     this.router.navigate(['/search'], {
  //       queryParams: { city: this.city || undefined },
  //     });
  //   }
  // }
  goToSearch() {
    this.router.navigate(['/search-modal'], {
      queryParams: { type: this.activeTab },
    });
  }
  onTabChange() {
    setTimeout(() => {
      if (this.activeTab === 'cars') {
        this.router.navigate(['/cars']);
      }
    }, 100);
  }
  openSearch() {
    this.router.navigate(['/search-modal'], {
      queryParams: {
        type: this.activeTab,
        city: this.city || undefined,
        step: 1,
      },
    });
  }
  openDatePicker(type: 'checkin' | 'checkout') {
    this.router.navigate(['/search-modal'], {
      queryParams: { type: this.activeTab, step: 2, field: type },
    });
  }
  searchByCity(name: string) {
    this.city = name;
    this.goToSearch();
  }
  getCoverImage(p: any) {
    return (
      p.coverImageUrl ||
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'
    );
  }
  toggleWishlist(e: Event, _: string) {
    e.stopPropagation();
    e.preventDefault();
  }
  async onRefresh(e: any) {
    await this.load();
    e.target.complete();
  }
  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'cars') {
      this.loadFeaturedCars();
    } else {
      this.load();
    }
  }
  async loadFeaturedCars() {
    this.isLoadingCars.set(true);
    try {
      const data = await this.carsService.getFeatured();
      this.cars.set(data);
    } catch {
      this.cars.set([]);
    } finally {
      this.isLoadingCars.set(false);
    }
  }
  getCategoryLabel(cat: string): string {
    const l: Record<string, string> = {
      SEDAN: 'Berline',
      SUV: 'SUV',
      LUXURY: 'Luxe',
      ECONOMY: 'Économique',
      VAN: 'Van',
      PICKUP: 'Pickup',
    };
    return l[cat] || cat;
  }
  goToExplore() {
    if (this.activeTab === 'cars') {
      this.router.navigate(['/cars']);
    } else {
      this.router.navigate(['/search']);
    }
  }
}
