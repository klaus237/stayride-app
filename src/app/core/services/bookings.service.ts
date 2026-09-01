import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  Booking, BookingExtension, ApiResponse,
  ResourceType, PriceEstimate,
} from '../models';

export interface CreateBookingPayload {
  resource_type: ResourceType;
  resource_id: string;
  start_date: string;
  end_date: string;
  guests_count?: number;
  coupon_code?: string;
  use_wallet?: boolean;
  use_loyalty_points?: number;
  special_requests?: string;
}

export interface ExtendBookingPayload {
  new_end_date: string;
  coupon_code?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly api = inject(ApiService);

  // ─── Client ───────────────────────────────────────────────────────────────

  async create(payload: CreateBookingPayload): Promise<Booking> {
    return this.api.post<Booking>('bookings', payload);
  }

  async getAll(params?: {
    status?: string;
    resource_type?: string;
    page?: number;
  }): Promise<ApiResponse<Booking[]>> {
    return this.api.getPaginated<Booking[]>('bookings', params as any);
  }

  async getOne(id: string): Promise<Booking> {
    return this.api.get<Booking>(`bookings/${id}`);
  }

  async cancel(id: string, reason?: string): Promise<Booking> {
    return this.api.patch<Booking>(`bookings/${id}/cancel`, { reason });
  }

  async checkAvailability(
    resourceId: string,
    resourceType: ResourceType,
    startDate: string,
    endDate: string,
  ): Promise<{ available: boolean }> {
    return this.api.post('bookings/check-availability', {
      resource_id: resourceId,
      resource_type: resourceType,
      start_date: startDate,
      end_date: endDate,
    });
  }

  async getPriceEstimate(
    resourceId: string,
    resourceType: ResourceType,
    startDate: string,
    endDate: string,
    couponCode?: string,
  ): Promise<PriceEstimate> {
    return this.api.post<PriceEstimate>('bookings/price-estimate', {
      resource_id: resourceId,
      resource_type: resourceType,
      start_date: startDate,
      end_date: endDate,
      coupon_code: couponCode,
    });
  }

  // ─── Extension de séjour ──────────────────────────────────────────────────

  async extend(id: string, payload: ExtendBookingPayload): Promise<{
    extension: BookingExtension;
    extra_nights: number;
    extra_amount: number;
    available: boolean;
    requires_approval: boolean;
  }> {
    return this.api.post(`bookings/${id}/extend`, payload);
  }

  async getExtensions(id: string): Promise<BookingExtension[]> {
    return this.api.get<BookingExtension[]>(`bookings/${id}/extensions`);
  }

  // ─── Owner ────────────────────────────────────────────────────────────────

  async getOwnerBookings(params?: any): Promise<ApiResponse<Booking[]>> {
    return this.api.getPaginated<Booking[]>('owner/bookings', params);
  }

  async approve(id: string): Promise<Booking> {
    return this.api.patch<Booking>(`owner/bookings/${id}/approve`, {});
  }

  async reject(id: string, reason?: string): Promise<Booking> {
    return this.api.patch<Booking>(`owner/bookings/${id}/reject`, { reason });
  }

  async approveExtension(extensionId: string): Promise<BookingExtension> {
    return this.api.patch<BookingExtension>(
      `owner/bookings/extensions/${extensionId}/approve`,
      {},
    );
  }

  async rejectExtension(extensionId: string): Promise<BookingExtension> {
    return this.api.patch<BookingExtension>(
      `owner/bookings/extensions/${extensionId}/reject`,
      {},
    );
  }

  // ─── Tracking GPS voiture ─────────────────────────────────────────────────

  async getCarLocation(bookingId: string): Promise<{
    lat: number;
    lng: number;
    speed?: number;
    recordedAt: string;
  } | null> {
    return this.api.get(`bookings/${bookingId}/car-location`);
  }

  async updateCarLocation(
    carId: string,
    bookingId: string,
    lat: number,
    lng: number,
    speed?: number,
  ): Promise<void> {
    await this.api.post(`cars/${carId}/location`, {
      booking_id: bookingId,
      lat,
      lng,
      speed,
    });
  }
}
