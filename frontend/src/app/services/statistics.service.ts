import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DailyStatistics {
  date: string;
  totalCaloriesIntake: number;
  totalCaloriesBurned: number;
  calorieBalance: number;
  mealCount?: number;
  exerciseCount?: number;
}

export interface SummaryStatistics {
  totalIntake: number;
  totalBurned: number;
  totalBalance: number;
  avgIntake: number;
  avgBurned: number;
  totalDays: number;
  daysWithRecords: number;
  dailyStats: DailyStatistics[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8080/api/statistics';

  constructor(private http: HttpClient) {}

  getDailyStatistics(date?: string): Observable<ApiResponse<DailyStatistics>> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ApiResponse<DailyStatistics>>(`${this.apiUrl}/daily`, { params });
  }

  getWeeklyStatistics(date?: string): Observable<ApiResponse<DailyStatistics[]>> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ApiResponse<DailyStatistics[]>>(`${this.apiUrl}/weekly`, { params });
  }

  getMonthlyStatistics(date?: string): Observable<ApiResponse<DailyStatistics[]>> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ApiResponse<DailyStatistics[]>>(`${this.apiUrl}/monthly`, { params });
  }

  getSummaryStatistics(startDate: string, endDate: string): Observable<ApiResponse<SummaryStatistics>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<SummaryStatistics>>(`${this.apiUrl}/summary`, { params });
  }
}
