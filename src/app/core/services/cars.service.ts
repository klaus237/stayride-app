import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CarsService {
  private readonly api = inject(ApiService);

  async search(filters?: any): Promise<ApiResponse<any[]>> {
    return this.api.getPaginated<any[]>('cars', filters);
  }

  async getFeatured(): Promise<any[]> {
    return this.api.get<any[]>('cars/featured');
  }

  async getBySlug(slug: string): Promise<any> {
    return this.api.get<any>(`cars/${slug}`);
  }
}
