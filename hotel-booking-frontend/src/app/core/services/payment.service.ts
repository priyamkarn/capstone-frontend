import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  processPayment(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/process`, request);
  }

  getPaymentMethods(): Observable<any> {
    return this.http.get(`${this.apiUrl}/methods`);
  }
}