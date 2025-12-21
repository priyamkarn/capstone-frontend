import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User,AuthResponse } from '../models/model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.loadCurrentUser();
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(response => {
        localStorage.setItem(environment.tokenKey, response.token);
        this.currentUserSubject.next(response.user);
      }));
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap(response => {
        localStorage.setItem(environment.tokenKey, response.token);
        this.currentUserSubject.next(response.user);
      }));
  }

  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private loadCurrentUser(): void {
    this.http.get<User>(`${environment.apiUrl}/users/me`).subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.logout()
    });
  }
}