import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private baseUrl = 'http://localhost:8080/api/hotels';

  constructor(private http: HttpClient) {}

  createHotel(hotel: any): Observable<any> {
    return this.http.post(this.baseUrl, hotel);
  }

  getHotels(): Observable<any> {
    return this.http.get(this.baseUrl);
  }
}
