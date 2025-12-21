import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking } from '../models/model';
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(request: any): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, request);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my-bookings`);
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  applyPromoCode(bookingId: number, promoCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${bookingId}/apply-promo`, { promoCode });
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancel`, {});
  }

  confirmBooking(id: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/confirm`, {});
  }
}