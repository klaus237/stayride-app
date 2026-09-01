import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  Property, Amenity, Review, SearchFilters, ApiResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class PropertiesService {
  private readonly api = inject(ApiService);

  // ─── Recherche ────────────────────────────────────────────────────────────

  async search(filters: SearchFilters): Promise<ApiResponse<Property[]>> {
    return this.api.getPaginated<Property[]>('properties', filters as any);
  }

  async getForMap(filters: Partial<SearchFilters>): Promise<{ id: string; lat: number; lng: number; price: number; title: string }[]> {
    return this.api.get('properties/map', filters as any);
  }

  async getFeatured(): Promise<Property[]> {
    return this.api.get<Property[]>('properties/featured');
  }

  // ─── Détail ───────────────────────────────────────────────────────────────

  async getBySlug(slug: string): Promise<Property> {
    return this.api.get<Property>(`properties/${slug}`);
  }

  async getAvailability(
    id: string,
    month: string,
  ): Promise<{ date: string; status: string }[]> {
    return this.api.get(`properties/${id}/availability`, { month });
  }

  async getReviews(id: string, page = 1): Promise<ApiResponse<Review[]>> {
    return this.api.getPaginated(`properties/${id}/reviews`, { page });
  }

  async getAmenities(): Promise<Amenity[]> {
    return this.api.get<Amenity[]>('amenities');
  }

  // ─── Gestion Owner ────────────────────────────────────────────────────────

  async getMyProperties(): Promise<Property[]> {
    return this.api.get<Property[]>('owner/properties');
  }

  async create(data: Partial<Property>): Promise<Property> {
    return this.api.post<Property>('owner/properties', data);
  }

  async update(id: string, data: Partial<Property>): Promise<Property> {
    return this.api.patch<Property>(`owner/properties/${id}`, data);
  }

  async updateStatus(id: string, status: string): Promise<Property> {
    return this.api.patch<Property>(`owner/properties/${id}/status`, { status });
  }

  async updateAvailability(
    id: string,
    dates: { date: string; status: string; custom_price?: number }[],
  ): Promise<void> {
    await this.api.patch(`owner/properties/${id}/availability`, { dates });
  }

  async uploadImages(id: string, formData: FormData): Promise<any> {
    return this.api.uploadFile(`owner/properties/${id}/images`, formData);
  }

  async deleteImage(propertyId: string, imageId: string): Promise<void> {
    await this.api.delete(`owner/properties/${propertyId}/images/${imageId}`);
  }

  async assignConcierge(propertyId: string, conciergeId: string): Promise<void> {
    await this.api.post(`owner/properties/${propertyId}/assign-concierge`, {
      concierge_id: conciergeId,
    });
  }
}
