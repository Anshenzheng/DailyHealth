import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeightRecord {
  id?: number;
  recordDate: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class WeightService {
  private apiUrl = 'http://localhost:8080/api/weights';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<WeightRecord[]>> {
    return this.http.get<ApiResponse<WeightRecord[]>>(this.apiUrl);
  }

  getByDateRange(startDate: string, endDate: string): Observable<ApiResponse<WeightRecord[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<WeightRecord[]>>(`${this.apiUrl}/range`, { params });
  }

  getLatest(): Observable<ApiResponse<WeightRecord>> {
    return this.http.get<ApiResponse<WeightRecord>>(`${this.apiUrl}/latest`);
  }

  getById(id: number): Observable<ApiResponse<WeightRecord>> {
    return this.http.get<ApiResponse<WeightRecord>>(`${this.apiUrl}/${id}`);
  }

  create(weight: WeightRecord): Observable<ApiResponse<WeightRecord>> {
    return this.http.post<ApiResponse<WeightRecord>>(this.apiUrl, weight);
  }

  update(id: number, weight: WeightRecord): Observable<ApiResponse<WeightRecord>> {
    return this.http.put<ApiResponse<WeightRecord>>(`${this.apiUrl}/${id}`, weight);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
