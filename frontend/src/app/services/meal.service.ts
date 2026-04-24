import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MealRecord {
  id?: number;
  recordDate: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
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
export class MealService {
  private apiUrl = 'http://localhost:8080/api/meals';

  constructor(private http: HttpClient) {}

  getByDate(date: string): Observable<ApiResponse<MealRecord[]>> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ApiResponse<MealRecord[]>>(this.apiUrl, { params });
  }

  getByDateRange(startDate: string, endDate: string): Observable<ApiResponse<MealRecord[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<MealRecord[]>>(`${this.apiUrl}/range`, { params });
  }

  getById(id: number): Observable<ApiResponse<MealRecord>> {
    return this.http.get<ApiResponse<MealRecord>>(`${this.apiUrl}/${id}`);
  }

  create(meal: MealRecord): Observable<ApiResponse<MealRecord>> {
    return this.http.post<ApiResponse<MealRecord>>(this.apiUrl, meal);
  }

  update(id: number, meal: MealRecord): Observable<ApiResponse<MealRecord>> {
    return this.http.put<ApiResponse<MealRecord>>(`${this.apiUrl}/${id}`, meal);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
