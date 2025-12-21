import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User,AuthResponse } from '../models/model';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateProfile(data: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data);
  }

  updatePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, { oldPassword, newPassword });
  }

  addWalletBalance(amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet/add`, { amount });
  }

  getWalletBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.apiUrl}/wallet/balance`);
  }

  getWalletTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/wallet/transactions`);
  }
}
