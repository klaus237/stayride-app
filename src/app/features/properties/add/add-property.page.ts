import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  arrowForwardOutline,
  checkmarkCircleOutline,
  homeOutline,
  imagesOutline,
  cashOutline,
  informationCircleOutline,
  addOutline,
} from 'ionicons/icons';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content>
      <div class="add-page">
        <!-- Header -->
        <div class="add-header">
          <button class="back-btn" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </button>
          <h1 class="add-title">Ajouter une propriété</h1>
        </div>

        <!-- Stepper -->
        <div class="stepper">
          @for (s of steps; track s.num) {
            <div
              class="step"
              [class.step--active]="currentStep === s.num"
              [class.step--done]="currentStep > s.num"
            >
              <div class="step__dot">
                {{ currentStep > s.num ? '✓' : s.num }}
              </div>
              <div class="step__label">{{ s.label }}</div>
            </div>
          }
        </div>

        <!-- Etape 1 — Infos de base -->
        @if (currentStep === 1) {
          <div class="add-section">
            <h2 class="add-section__title">Informations de base</h2>

            <div class="form-group">
              <label>Titre de l'annonce *</label>
              <input
                type="text"
                [(ngModel)]="form.title"
                placeholder="Ex: Appartement moderne à Bonanjo"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Type de bien *</label>
              <select [(ngModel)]="form.type" class="form-input">
                <option value="APARTMENT">Appartement</option>
                <option value="STUDIO">Studio</option>
                <option value="VILLA">Villa</option>
                <option value="HOUSE">Maison</option>
                <option value="GUESTHOUSE">Maison d'hôtes</option>
                <option value="ROOM">Chambre</option>
              </select>
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea
                [(ngModel)]="form.description"
                placeholder="Décrivez votre bien..."
                class="form-input form-textarea"
                rows="4"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ville *</label>
                <select [(ngModel)]="form.city" class="form-input">
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Kribi">Kribi</option>
                  <option value="Limbé">Limbé</option>
                  <option value="Bafoussam">Bafoussam</option>
                  <option value="Garoua">Garoua</option>
                </select>
              </div>
              <div class="form-group">
                <label>Quartier</label>
                <input
                  type="text"
                  [(ngModel)]="form.neighborhood"
                  placeholder="Ex: Bonanjo"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Adresse</label>
              <input
                type="text"
                [(ngModel)]="form.address"
                placeholder="Adresse complète"
                class="form-input"
              />
            </div>
          </div>
        }

        <!-- Etape 2 — Détails -->
        @if (currentStep === 2) {
          <div class="add-section">
            <h2 class="add-section__title">Détails du logement</h2>

            <div class="form-row">
              <div class="form-group">
                <label>Chambres</label>
                <div class="counter">
                  <button (click)="decrement('bedrooms')">-</button>
                  <span>{{ form.bedrooms }}</span>
                  <button (click)="increment('bedrooms')">+</button>
                </div>
              </div>
              <div class="form-group">
                <label>Salles de bain</label>
                <div class="counter">
                  <button (click)="decrement('bathrooms')">-</button>
                  <span>{{ form.bathrooms }}</span>
                  <button (click)="increment('bathrooms')">+</button>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Voyageurs max</label>
                <div class="counter">
                  <button (click)="decrement('maxGuests')">-</button>
                  <span>{{ form.maxGuests }}</span>
                  <button (click)="increment('maxGuests')">+</button>
                </div>
              </div>
              <div class="form-group">
                <label>Nuits minimum</label>
                <div class="counter">
                  <button (click)="decrement('minStayNights')">-</button>
                  <span>{{ form.minStayNights }}</span>
                  <button (click)="increment('minStayNights')">+</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Équipements</label>
              <div class="amenities-grid">
                @for (a of amenities; track a.value) {
                  <div
                    class="amenity-chip"
                    [class.amenity-chip--active]="
                      form.amenities.includes(a.value)
                    "
                    (click)="toggleAmenity(a.value)"
                  >
                    {{ a.label }}
                  </div>
                }
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Heure d'arrivée</label>
                <input
                  type="time"
                  [(ngModel)]="form.checkinTime"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Heure de départ</label>
                <input
                  type="time"
                  [(ngModel)]="form.checkoutTime"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="toggle-label">
                <span>Réservation instantanée</span>
                <div
                  class="toggle"
                  [class.toggle--on]="form.instantBooking"
                  (click)="form.instantBooking = !form.instantBooking"
                >
                  <div class="toggle__thumb"></div>
                </div>
              </label>
              <p class="form-hint">
                Les clients peuvent réserver sans attendre votre approbation
              </p>
            </div>
          </div>
        }

        <!-- Etape 3 — Prix -->
        @if (currentStep === 3) {
          <div class="add-section">
            <h2 class="add-section__title">Tarification</h2>

            <div class="form-group">
              <label>Prix par nuit (XAF) *</label>
              <input
                type="number"
                [(ngModel)]="form.pricePerNight"
                placeholder="Ex: 25000"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Frais de nettoyage (XAF)</label>
              <input
                type="number"
                [(ngModel)]="form.cleaningFee"
                placeholder="Ex: 5000"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Réduction semaine (%)</label>
              <input
                type="number"
                [(ngModel)]="form.weeklyDiscount"
                placeholder="Ex: 10"
                class="form-input"
                min="0"
                max="50"
              />
            </div>

            <div class="form-group">
              <label>Réduction mensuelle (%)</label>
              <input
                type="number"
                [(ngModel)]="form.monthlyDiscount"
                placeholder="Ex: 20"
                class="form-input"
                min="0"
                max="70"
              />
            </div>

            <div class="form-group">
              <label class="toggle-label">
                <span>Mettre en avant sur la page d'accueil</span>
                <div
                  class="toggle"
                  [class.toggle--on]="form.isFeatured"
                  (click)="form.isFeatured = !form.isFeatured"
                >
                  <div class="toggle__thumb"></div>
                </div>
              </label>
              <p class="form-hint">
                La propriété apparaîtra en premier sur la page d'accueil
              </p>
            </div>

            <div class="price-preview">
              <div class="price-preview__title">Aperçu des revenus</div>
              <div class="price-preview__row">
                <span>1 nuit</span>
                <strong>{{ form.pricePerNight | number }} XAF</strong>
              </div>
              <div class="price-preview__row">
                <span>7 nuits ({{ form.weeklyDiscount }}% réduction)</span>
                <strong>{{ getWeeklyRevenue() | number }} XAF</strong>
              </div>
              <div class="price-preview__row">
                <span>30 nuits ({{ form.monthlyDiscount }}% réduction)</span>
                <strong>{{ getMonthlyRevenue() | number }} XAF</strong>
              </div>
              <p class="price-preview__note">
                StayRide prend une commission de 10%
              </p>
            </div>
          </div>
        }

        <!-- Etape 4 — Photos -->
        @if (currentStep === 4) {
          <div class="add-section">
            <h2 class="add-section__title">Photos</h2>

            <!-- Photo principale -->
            <div class="form-group">
              <label>Photo principale *</label>
              @if (form.coverImageUrl) {
                <div class="photo-uploaded">
                  <img [src]="form.coverImageUrl" class="photo-preview" />
                  <button
                    class="photo-remove-btn"
                    (click)="form.coverImageUrl = ''"
                  >
                    ✕ Supprimer
                  </button>
                </div>
              } @else {
                <div class="upload-zone" (click)="coverInput.click()">
                  @if (isUploadingCover()) {
                    <ion-spinner name="crescent"></ion-spinner>
                    <span>Téléchargement...</span>
                  } @else {
                    <ion-icon name="images-outline"></ion-icon>
                    <span>Cliquez pour ajouter la photo principale</span>
                    <small>JPG, PNG — Max 10 MB</small>
                  }
                </div>
                <input
                  #coverInput
                  type="file"
                  accept="image/*"
                  style="display:none"
                  (change)="onCoverImageChange($event)"
                />
              }
            </div>

            <!-- Photos supplémentaires -->
            <div class="form-group">
              <label>Photos supplémentaires</label>
              <div class="extra-photos-list">
                @for (photo of form.images; track $index) {
                  <div class="extra-photo-item">
                    <img [src]="photo.url" class="extra-photo-thumb" />
                    <div class="extra-photo-info">
                      <select
                        [(ngModel)]="form.images[$index].category"
                        class="form-input"
                        style="font-size:12px;padding:6px;"
                      >
                        @for (cat of categories; track cat) {
                          <option [value]="cat">{{ cat }}</option>
                        }
                      </select>
                    </div>
                    <button
                      class="extra-photo__remove"
                      (click)="removePhoto($index)"
                    >
                      ✕
                    </button>
                  </div>
                }
                <div class="upload-zone-small" (click)="extraInput.click()">
                  @if (isUploadingExtra()) {
                    <ion-spinner
                      name="crescent"
                      style="width:20px;height:20px;"
                    ></ion-spinner>
                  } @else {
                    <ion-icon name="add-outline"></ion-icon>
                    <span>Ajouter des photos</span>
                  }
                </div>
                <input
                  #extraInput
                  type="file"
                  accept="image/*"
                  multiple
                  style="display:none"
                  (change)="onExtraImagesChange($event)"
                />
              </div>
              <input
                #extraInput
                type="file"
                accept="image/*"
                multiple
                style="display:none"
                (change)="onExtraImagesChange($event)"
              />
              <p class="form-hint">
                Vous pouvez ajouter plusieurs photos à la fois
              </p>
            </div>
          </div>
        }

        <!-- Navigation -->
        <div class="add-nav">
          @if (currentStep > 1) {
            <button class="nav-btn nav-btn--secondary" (click)="prevStep()">
              <ion-icon name="arrow-back-outline"></ion-icon>
              Précédent
            </button>
          } @else {
            <div></div>
          }
          @if (currentStep < 4) {
            <button class="nav-btn nav-btn--primary" (click)="nextStep()">
              Suivant
              <ion-icon name="arrow-forward-outline"></ion-icon>
            </button>
          } @else {
            <button
              class="nav-btn nav-btn--primary"
              (click)="submit()"
              [disabled]="isSubmitting()"
            >
              @if (isSubmitting()) {
                <ion-spinner
                  name="crescent"
                  style="width:16px;height:16px;"
                ></ion-spinner>
              } @else {
                <ion-icon name="checkmark-circle-outline"></ion-icon>
                Publier
              }
            </button>
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
      .add-page {
        padding-bottom: 100px;
      }

      .add-header {
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
      }
      .add-title {
        font-size: 18px;
        font-weight: 700;
        color: #1a1a2e;
        margin: 0;
      }

      .stepper {
        display: flex;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        background: #fff;
        border-bottom: 1px solid #eee;
      }
      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        flex: 1;
      }
      .step__dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #eee;
        color: #888;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
      }
      .step--active .step__dot {
        background: #e85d24;
        color: #fff;
      }
      .step--done .step__dot {
        background: #4caf50;
        color: #fff;
      }
      .step__label {
        font-size: 10px;
        color: #888;
        text-align: center;
      }
      .step--active .step__label {
        color: #e85d24;
        font-weight: 600;
      }

      .add-section {
        padding: 20px 16px;
      }
      .add-section__title {
        font-size: 17px;
        font-weight: 600;
        color: #1a1a2e;
        margin: 0 0 20px;
      }

      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #555;
        margin-bottom: 6px;
      }
      .form-input {
        width: 100%;
        border: 1.5px solid #eee;
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 14px;
        outline: none;
        background: #fff;
        box-sizing: border-box;
      }
      .form-input:focus {
        border-color: #e85d24;
      }
      .form-textarea {
        resize: vertical;
        min-height: 100px;
      }
      .form-hint {
        font-size: 11px;
        color: #888;
        margin: 4px 0 0;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .counter {
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1.5px solid #eee;
        border-radius: 10px;
        padding: 8px 14px;
        background: #fff;
      }
      .counter button {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1.5px solid #ddd;
        background: #fff;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #1a1a2e;
      }
      .counter span {
        flex: 1;
        text-align: center;
        font-size: 16px;
        font-weight: 600;
      }

      .amenities-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .amenity-chip {
        padding: 8px 12px;
        border-radius: 8px;
        border: 1.5px solid #eee;
        background: #fff;
        font-size: 12px;
        color: #555;
        cursor: pointer;
        text-align: center;
      }
      .amenity-chip--active {
        background: rgba(232, 93, 36, 0.1);
        border-color: #e85d24;
        color: #e85d24;
        font-weight: 600;
      }

      .toggle-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .toggle {
        width: 44px;
        height: 24px;
        border-radius: 12px;
        background: #ddd;
        position: relative;
        cursor: pointer;
        transition: background 0.2s;
      }
      .toggle--on {
        background: #e85d24;
      }
      .toggle__thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        position: absolute;
        top: 2px;
        left: 2px;
        transition: left 0.2s;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      }
      .toggle--on .toggle__thumb {
        left: 22px;
      }

      .price-preview {
        background: #f9f9f9;
        border-radius: 12px;
        padding: 16px;
        margin-top: 16px;
      }
      .price-preview__title {
        font-size: 13px;
        font-weight: 600;
        color: #1a1a2e;
        margin-bottom: 12px;
      }
      .price-preview__row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #555;
        margin-bottom: 8px;
      }
      .price-preview__row strong {
        color: #1a1a2e;
      }
      .price-preview__note {
        font-size: 11px;
        color: #888;
        margin: 8px 0 0;
      }

      .photo-preview {
        width: 100%;
        height: 160px;
        object-fit: cover;
        border-radius: 10px;
        margin-top: 8px;
      }
      .photo-url-row {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }
      .photo-url-row .form-input {
        flex: 1;
      }
      .photo-remove {
        background: #fee2e2;
        color: #dc2626;
        border: none;
        border-radius: 8px;
        padding: 0 12px;
        cursor: pointer;
        font-size: 14px;
      }
      .add-photo-btn {
        background: none;
        border: 1.5px dashed #ddd;
        border-radius: 10px;
        padding: 10px;
        width: 100%;
        font-size: 13px;
        color: #888;
        cursor: pointer;
        margin-top: 4px;
      }

      .add-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #fff;
        border-top: 1px solid #eee;
        padding: 12px 16px env(safe-area-inset-bottom, 12px);
        display: flex;
        justify-content: space-between;
        gap: 12px;
        z-index: 100;
      }
      .nav-btn {
        flex: 1;
        padding: 14px;
        border-radius: 12px;
        border: none;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .nav-btn--primary {
        background: #e85d24;
        color: #fff;
      }
      .nav-btn--secondary {
        background: #f5f5f5;
        color: #1a1a2e;
      }
      .nav-btn:disabled {
        opacity: 0.6;
        cursor: default;
      }

      @media (min-width: 769px) {
        .add-section {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px 0;
        }
        .add-header {
          padding: 24px 48px;
        }
        .stepper {
          max-width: 600px;
          margin: 0 auto;
        }
        .amenities-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        .upload-zone {
          border: 2px dashed #ddd;
          border-radius: 12px;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #888;
          text-align: center;
          transition: border-color 0.2s;
        }
        .upload-zone:hover {
          border-color: #e85d24;
          color: #e85d24;
        }
        .upload-zone ion-icon {
          font-size: 36px;
        }
        .upload-zone small {
          font-size: 11px;
          color: #aaa;
        }
        .photo-uploaded {
          position: relative;
        }
        .photo-remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
        }
        .extra-photos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }
        .extra-photo {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          background: #eee;
        }
        .extra-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .extra-photo__remove {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .extra-photo--add {
          border: 2px dashed #ddd;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          color: #888;
          font-size: 11px;
        }
        .extra-photo--add ion-icon {
          font-size: 24px;
        }
        .extra-photo--add:hover {
          border-color: #e85d24;
          color: #e85d24;
        }
        .extra-photos-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .extra-photo-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f9f9f9;
          border-radius: 10px;
          padding: 8px;
        }
        .extra-photo-thumb {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .extra-photo-info {
          flex: 1;
        }
        .extra-photo__remove {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 12px;
          flex-shrink: 0;
        }
        .upload-zone-small {
          border: 2px dashed #ddd;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          color: #888;
          font-size: 13px;
        }
        .upload-zone-small:hover {
          border-color: #e85d24;
          color: #e85d24;
        }
        .upload-zone-small ion-icon {
          font-size: 20px;
        }
      }
    `,
  ],
})
export class AddPropertyPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  currentStep = 1;
  isSubmitting = signal(false);
  CLOUDINARY_CLOUD_NAME = 'kgimxzgx';
  CLOUDINARY_PRESET = 'stayride_uploads';
  isUploadingCover = signal(false);
  isUploadingExtra = signal(false);

  steps = [
    { num: 1, label: 'Infos' },
    { num: 2, label: 'Détails' },
    { num: 3, label: 'Prix' },
    { num: 4, label: 'Photos' },
  ];

  form = {
    title: '',
    type: 'APARTMENT',
    description: '',
    city: 'Douala',
    neighborhood: '',
    address: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    minStayNights: 1,
    pricePerNight: 0,
    cleaningFee: 0,
    weeklyDiscount: 0,
    monthlyDiscount: 0,
    checkinTime: '14:00',
    checkoutTime: '11:00',
    instantBooking: false,
    isFeatured: false,
    amenities: [] as string[],
    coverImageUrl: '',
    images: [] as { url: string; category: string; order: number }[],
  };

  categories = [
    'Salon',
    'Cuisine',
    'Chambre 1',
    'Chambre 2',
    'Chambre 3',
    'Salle de bain',
    'Terrasse',
    'Extérieur',
    'Autre',
  ];

  amenities = [
    { label: 'WiFi', value: 'WiFi' },
    { label: 'Climatisation', value: 'Climatisation' },
    { label: 'Cuisine équipée', value: 'Cuisine equipee' },
    { label: 'Parking', value: 'Parking' },
    { label: 'Piscine', value: 'Piscine' },
    { label: 'Sécurité 24h', value: 'Securite 24h' },
    { label: 'Générateur', value: 'Generateur' },
    { label: 'TV satellite', value: 'TV satellite' },
    { label: 'Eau chaude', value: 'Eau chaude' },
    { label: 'Gardien', value: 'Gardien' },
    { label: 'Terrasse', value: 'Terrasse' },
    { label: 'Lave-linge', value: 'Lave-linge' },
  ];

  constructor() {
    addIcons({
      arrowBackOutline,
      arrowForwardOutline,
      checkmarkCircleOutline,
      homeOutline,
      imagesOutline,
      cashOutline,
      informationCircleOutline,
      addOutline,
    });
  }

  increment(field: 'bedrooms' | 'bathrooms' | 'maxGuests' | 'minStayNights') {
    this.form[field]++;
  }

  decrement(field: 'bedrooms' | 'bathrooms' | 'maxGuests' | 'minStayNights') {
    if (this.form[field] > 1) this.form[field]--;
  }

  toggleAmenity(value: string) {
    const idx = this.form.amenities.indexOf(value);
    if (idx === -1) this.form.amenities.push(value);
    else this.form.amenities.splice(idx, 1);
  }

  getWeeklyRevenue(): number {
    return Math.round(
      this.form.pricePerNight * 7 * (1 - this.form.weeklyDiscount / 100),
    );
  }

  getMonthlyRevenue(): number {
    return Math.round(
      this.form.pricePerNight * 30 * (1 - this.form.monthlyDiscount / 100),
    );
  }

  nextStep() {
    if (!this.validateStep()) return;
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  validateStep(): boolean {
    if (this.currentStep === 1) {
      if (!this.form.title.trim()) {
        alert('Veuillez entrer un titre');
        return false;
      }
      if (!this.form.description.trim()) {
        alert('Veuillez entrer une description');
        return false;
      }
      if (!this.form.city) {
        alert('Veuillez choisir une ville');
        return false;
      }
    }
    if (this.currentStep === 3) {
      if (!this.form.pricePerNight || this.form.pricePerNight < 1000) {
        alert('Veuillez entrer un prix valide (minimum 1000 XAF)');
        return false;
      }
    }
    if (this.currentStep === 4) {
      if (!this.form.coverImageUrl) {
        alert('Veuillez ajouter une photo principale');
        return false;
      }
    }
    return true;
  }

  async submit() {
    if (!this.validateStep()) return;
    this.isSubmitting.set(true);
    try {
      const payload = {
        title: this.form.title,
        type: this.form.type,
        description: this.form.description,
        city: this.form.city,
        neighborhood: this.form.neighborhood || undefined,
        address: this.form.address || undefined,
        bedrooms: this.form.bedrooms,
        bathrooms: this.form.bathrooms,
        maxGuests: this.form.maxGuests,
        minStayNights: this.form.minStayNights,
        pricePerNight: this.form.pricePerNight,
        cleaningFee: this.form.cleaningFee || 0,
        weeklyDiscount: this.form.weeklyDiscount || 0,
        monthlyDiscount: this.form.monthlyDiscount || 0,
        checkinTime: this.form.checkinTime,
        checkoutTime: this.form.checkoutTime,
        instantBooking: this.form.instantBooking,
        amenities: this.form.amenities,
        coverImageUrl: this.form.coverImageUrl,
        images: this.form.images,
        isFeatured: this.form.isFeatured,
      };
      await this.api.post('properties', payload);
      alert('Propriété ajoutée avec succès !');
      this.router.navigate(['/admin/dashboard'], {
        queryParams: { tab: 'properties' },
      });
    } catch (err: any) {
      alert(err?.error?.error?.message || 'Erreur lors de la création');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goBack() {
    window.history.back();
  }
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.CLOUDINARY_PRESET);
    formData.append('folder', 'stayride/properties');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData },
    );
    const data = await response.json();
    if (!data.secure_url) throw new Error('Upload échoué');
    return data.secure_url;
  }

  async onCoverImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.isUploadingCover.set(true);
    try {
      const url = await this.uploadImage(input.files[0]);
      this.form.coverImageUrl = url;
    } catch {
      alert('Erreur lors du téléchargement de la photo');
    } finally {
      this.isUploadingCover.set(false);
    }
  }

  async onExtraImagesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.isUploadingExtra.set(true);
    try {
      const files = Array.from(input.files);
      for (const file of files) {
        const url = await this.uploadImage(file);
        this.form.images.push({
          url,
          category: 'Autre',
          order: this.form.images.length + 1,
        });
      }
    } catch {
      alert('Erreur lors du téléchargement');
    } finally {
      this.isUploadingExtra.set(false);
    }
  }
  removePhoto(idx: number) {
    this.form.images.splice(idx, 1);
  }
}
