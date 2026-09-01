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
  carOutline,
  imagesOutline,
  cashOutline,
  informationCircleOutline,
  addOutline,
} from 'ionicons/icons';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-add-car',
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
          <h1 class="add-title">Ajouter un véhicule</h1>
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
            <h2 class="add-section__title">Informations du véhicule</h2>

            <div class="form-row">
              <div class="form-group">
                <label>Marque *</label>
                <input
                  type="text"
                  [(ngModel)]="form.brand"
                  placeholder="Ex: Toyota"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Modèle *</label>
                <input
                  type="text"
                  [(ngModel)]="form.model"
                  placeholder="Ex: Corolla"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Année *</label>
                <input
                  type="number"
                  [(ngModel)]="form.year"
                  placeholder="Ex: 2020"
                  class="form-input"
                  min="2000"
                  max="2026"
                />
              </div>
              <div class="form-group">
                <label>Couleur</label>
                <input
                  type="text"
                  [(ngModel)]="form.color"
                  placeholder="Ex: Blanc"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Catégorie *</label>
              <select [(ngModel)]="form.category" class="form-input">
                <option value="ECONOMY">Économique</option>
                <option value="SEDAN">Berline</option>
                <option value="SUV">SUV</option>
                <option value="LUXURY">Luxe</option>
                <option value="VAN">Van</option>
                <option value="PICKUP">Pickup</option>
              </select>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                [(ngModel)]="form.description"
                placeholder="Décrivez le véhicule..."
                class="form-input form-textarea"
                rows="3"
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
          </div>
        }

        <!-- Etape 2 — Caractéristiques -->
        @if (currentStep === 2) {
          <div class="add-section">
            <h2 class="add-section__title">Caractéristiques</h2>

            <div class="form-row">
              <div class="form-group">
                <label>Places</label>
                <div class="counter">
                  <button (click)="decrement('seats')">-</button>
                  <span>{{ form.seats }}</span>
                  <button (click)="increment('seats')">+</button>
                </div>
              </div>
              <div class="form-group">
                <label>Portes</label>
                <div class="counter">
                  <button (click)="decrement('doors')">-</button>
                  <span>{{ form.doors }}</span>
                  <button (click)="increment('doors')">+</button>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Boîte de vitesse</label>
                <select [(ngModel)]="form.transmission" class="form-input">
                  <option value="AUTOMATIC">Automatique</option>
                  <option value="MANUAL">Manuelle</option>
                </select>
              </div>
              <div class="form-group">
                <label>Carburant</label>
                <select [(ngModel)]="form.fuelType" class="form-input">
                  <option value="PETROL">Essence</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Électrique</option>
                  <option value="HYBRID">Hybride</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Kilométrage (km)</label>
              <input
                type="number"
                [(ngModel)]="form.mileageKm"
                placeholder="Ex: 50000"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Âge minimum conducteur</label>
              <div class="counter">
                <button (click)="decrement('minDriverAge')">-</button>
                <span>{{ form.minDriverAge }} ans</span>
                <button (click)="increment('minDriverAge')">+</button>
              </div>
            </div>

            <div class="form-group">
              <label>Équipements</label>
              <div class="amenities-grid">
                @for (f of features; track f.value) {
                  <div
                    class="amenity-chip"
                    [class.amenity-chip--active]="
                      form.features.includes(f.value)
                    "
                    (click)="toggleFeature(f.value)"
                  >
                    {{ f.label }}
                  </div>
                }
              </div>
            </div>

            <div class="form-group">
              <label class="toggle-label">
                <span>Permis de conduire requis</span>
                <div
                  class="toggle"
                  [class.toggle--on]="form.licenseRequired"
                  (click)="form.licenseRequired = !form.licenseRequired"
                >
                  <div class="toggle__thumb"></div>
                </div>
              </label>
            </div>
          </div>
        }

        <!-- Etape 3 — Prix -->
        @if (currentStep === 3) {
          <div class="add-section">
            <h2 class="add-section__title">Tarification</h2>

            <div class="form-group">
              <label>Prix par jour (XAF) *</label>
              <input
                type="number"
                [(ngModel)]="form.pricePerDay"
                placeholder="Ex: 25000"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="toggle-label">
                <span>Caution requise</span>
                <div
                  class="toggle"
                  [class.toggle--on]="form.depositRequired"
                  (click)="form.depositRequired = !form.depositRequired"
                >
                  <div class="toggle__thumb"></div>
                </div>
              </label>
            </div>

            @if (form.depositRequired) {
              <div class="form-group">
                <label>Montant de la caution (XAF)</label>
                <input
                  type="number"
                  [(ngModel)]="form.depositAmount"
                  placeholder="Ex: 50000"
                  class="form-input"
                />
              </div>
            }

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
                Le véhicule apparaîtra en premier sur la page d'accueil
              </p>
            </div>

            <div class="price-preview">
              <div class="price-preview__title">Aperçu des revenus</div>
              <div class="price-preview__row">
                <span>1 jour</span>
                <strong>{{ form.pricePerDay | number }} XAF</strong>
              </div>
              <div class="price-preview__row">
                <span>7 jours</span>
                <strong>{{ form.pricePerDay * 7 | number }} XAF</strong>
              </div>
              <div class="price-preview__row">
                <span>30 jours</span>
                <strong>{{ form.pricePerDay * 30 | number }} XAF</strong>
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
            <h2 class="add-section__title">Photos du véhicule</h2>

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
                        @for (cat of imageCategories; track cat) {
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
        min-height: 80px;
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
      .photo-preview {
        width: 100%;
        height: 160px;
        object-fit: cover;
        border-radius: 10px;
        margin-top: 8px;
      }
      .photo-remove-btn {
        position: absolute;
        top: 16px;
        right: 8px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
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
        .amenities-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `,
  ],
})
export class AddCarPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  currentStep = 1;
  isSubmitting = signal(false);
  isUploadingCover = signal(false);
  isUploadingExtra = signal(false);

  CLOUDINARY_CLOUD_NAME = 'kgimxzgx';
  CLOUDINARY_PRESET = 'stayride_uploads';

  steps = [
    { num: 1, label: 'Infos' },
    { num: 2, label: 'Caract.' },
    { num: 3, label: 'Prix' },
    { num: 4, label: 'Photos' },
  ];

  form = {
    brand: '',
    model: '',
    year: 2020,
    color: '',
    category: 'SEDAN',
    description: '',
    city: 'Douala',
    neighborhood: '',
    seats: 5,
    doors: 4,
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    mileageKm: 0,
    minDriverAge: 21,
    licenseRequired: true,
    depositRequired: false,
    depositAmount: 0,
    pricePerDay: 0,
    isFeatured: false,
    features: [] as string[],
    coverImageUrl: '',
    images: [] as { url: string; category: string; order: number }[],
  };

  features = [
    { label: 'Climatisation', value: 'Climatisation' },
    { label: 'GPS', value: 'GPS' },
    { label: 'Bluetooth', value: 'Bluetooth' },
    { label: 'Caméra recul', value: 'Camera recul' },
    { label: 'USB', value: 'USB' },
    { label: 'Siège bébé', value: 'Siege bebe' },
    { label: 'Coffre spacieux', value: 'Coffre spacieux' },
    { label: '4x4', value: '4x4' },
  ];

  imageCategories = [
    'Extérieur avant',
    'Extérieur arrière',
    'Intérieur',
    'Tableau de bord',
    'Coffre',
    'Autre',
  ];

  constructor() {
    addIcons({
      arrowBackOutline,
      arrowForwardOutline,
      checkmarkCircleOutline,
      carOutline,
      imagesOutline,
      cashOutline,
      informationCircleOutline,
      addOutline,
    });
  }

  increment(field: 'seats' | 'doors' | 'minDriverAge') {
    this.form[field]++;
  }
  decrement(field: 'seats' | 'doors' | 'minDriverAge') {
    if (field === 'minDriverAge' && this.form[field] <= 18) return;
    if (field === 'seats' && this.form[field] <= 1) return;
    if (field === 'doors' && this.form[field] <= 2) return;
    this.form[field]--;
  }

  toggleFeature(value: string) {
    const idx = this.form.features.indexOf(value);
    if (idx === -1) this.form.features.push(value);
    else this.form.features.splice(idx, 1);
  }

  removePhoto(idx: number) {
    this.form.images.splice(idx, 1);
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.CLOUDINARY_PRESET);
    formData.append('folder', 'stayride/cars');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData },
    );
    const data = await response.json();
    if (!data.secure_url) throw new Error('Upload echoue');
    return data.secure_url;
  }

  async onCoverImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.isUploadingCover.set(true);
    try {
      this.form.coverImageUrl = await this.uploadImage(input.files[0]);
    } catch {
      alert('Erreur lors du téléchargement');
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
          category: 'Extérieur avant',
          order: this.form.images.length + 1,
        });
      }
    } catch {
      alert('Erreur lors du téléchargement');
    } finally {
      this.isUploadingExtra.set(false);
    }
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
      if (!this.form.brand.trim()) {
        alert('Veuillez entrer la marque');
        return false;
      }
      if (!this.form.model.trim()) {
        alert('Veuillez entrer le modèle');
        return false;
      }
      if (!this.form.year) {
        alert("Veuillez entrer l'année");
        return false;
      }
    }
    if (this.currentStep === 3) {
      if (!this.form.pricePerDay || this.form.pricePerDay < 5000) {
        alert('Veuillez entrer un prix valide (minimum 5000 XAF/jour)');
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
        brand: this.form.brand,
        model: this.form.model,
        year: this.form.year,
        color: this.form.color || undefined,
        category: this.form.category,
        description: this.form.description || undefined,
        city: this.form.city,
        neighborhood: this.form.neighborhood || undefined,
        seats: this.form.seats,
        doors: this.form.doors,
        transmission: this.form.transmission,
        fuelType: this.form.fuelType,
        mileageKm: this.form.mileageKm || 0,
        minDriverAge: this.form.minDriverAge,
        licenseRequired: this.form.licenseRequired,
        depositRequired: this.form.depositRequired,
        depositAmount: this.form.depositRequired ? this.form.depositAmount : 0,
        pricePerDay: this.form.pricePerDay,
        isFeatured: this.form.isFeatured,
        features: this.form.features,
        coverImageUrl: this.form.coverImageUrl,
        images: this.form.images,
      };
      await this.api.post('cars', payload);
      alert('Véhicule ajouté avec succès !');
      this.router.navigate(['/admin/dashboard'], {
        queryParams: { tab: 'cars' },
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
}
