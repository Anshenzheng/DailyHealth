import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  username: string;
  nickname: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    username: string;
    nickname: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const userData = localStorage.getItem('user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      userData ? JSON.parse(userData) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('token', response.data.token);
          const user: User = {
            username: response.data.username,
            nickname: response.data.nickname,
            email: response.data.email
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  register(username: string, email: string, password: string, nickname?: string): Observable<AuthResponse> {
    const body: any = { username, email, password };
    if (nickname) body.nickname = nickname;
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('token', response.data.token);
          const user: User = {
            username: response.data.username,
            nickname: response.data.nickname,
            email: response.data.email
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
