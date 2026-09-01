import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  // ─── GET ──────────────────────────────────────────────────────────────────

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => httpParams = httpParams.append(key, v));
          } else {
            httpParams = httpParams.set(key, String(value));
          }
        }
      });
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, {
        params: httpParams,
      }),
    );
    return response.data;
  }

  // ─── GET paginé ───────────────────────────────────────────────────────────

  async getPaginated<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return firstValueFrom(
      this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, {
        params: httpParams,
      }),
    );
  }

  // ─── POST ─────────────────────────────────────────────────────────────────

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body),
    );
    return response.data;
  }

  // ─── PATCH ────────────────────────────────────────────────────────────────

  async patch<T>(endpoint: string, body: any): Promise<T> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body),
    );
    return response.data;
  }

  // ─── PUT ──────────────────────────────────────────────────────────────────

  async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body),
    );
    return response.data;
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────

  async delete<T>(endpoint: string): Promise<T> {
    const response = await firstValueFrom(
      this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`),
    );
    return response.data;
  }

  // ─── Upload fichier ───────────────────────────────────────────────────────

  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, formData),
    );
    return response.data;
  }
}
