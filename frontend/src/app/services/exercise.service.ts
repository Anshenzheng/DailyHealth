import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExerciseRecord {
  id?: number;
  recordDate: string;
  exerciseName: string;
  exerciseType: 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'SPORTS' | 'OTHER';
  duration: number;
  caloriesBurned: number;
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
export class ExerciseService {
  private apiUrl = 'http://localhost:8080/api/exercises';

  constructor(private http: HttpClient) {}

  getByDate(date: string): Observable<ApiResponse<ExerciseRecord[]>> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ApiResponse<ExerciseRecord[]>>(this.apiUrl, { params });
  }

  getByDateRange(startDate: string, endDate: string): Observable<ApiResponse<ExerciseRecord[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<ExerciseRecord[]>>(`${this.apiUrl}/range`, { params });
  }

  getById(id: number): Observable<ApiResponse<ExerciseRecord>> {
    return this.http.get<ApiResponse<ExerciseRecord>>(`${this.apiUrl}/${id}`);
  }

  create(exercise: ExerciseRecord): Observable<ApiResponse<ExerciseRecord>> {
    return this.http.post<ApiResponse<ExerciseRecord>>(this.apiUrl, exercise);
  }

  update(id: number, exercise: ExerciseRecord): Observable<ApiResponse<ExerciseRecord>> {
    return this.http.put<ApiResponse<ExerciseRecord>>(`${this.apiUrl}/${id}`, exercise);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
