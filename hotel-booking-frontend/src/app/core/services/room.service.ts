import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Room } from '../models/model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  // Demo rooms data
  private demoRooms: Room[] = [
    // Hotel 1 - Grand Palace
    { 
      id: 1, hotelId: 1, roomType: 'Deluxe Room', pricePerNight: 8000, maxOccupancy: 2, 
      amenities: ['King Bed', 'City View', 'Mini Bar', 'WiFi', 'TV'], 
      photos: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'], 
      available: true 
    },
    { 
      id: 2, hotelId: 1, roomType: 'Executive Suite', pricePerNight: 15000, maxOccupancy: 4, 
      amenities: ['2 Bedrooms', 'Living Room', 'Kitchen', 'WiFi', 'TV'], 
      photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'], 
      available: true 
    },
    
    // Hotel 2 - Seaside Resort
    { 
      id: 3, hotelId: 2, roomType: 'Beach Villa', pricePerNight: 12000, maxOccupancy: 3, 
      amenities: ['Beach View', 'Private Balcony', 'Queen Bed', 'WiFi', 'Mini Fridge'], 
      photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'], 
      available: true 
    },
    { 
      id: 4, hotelId: 2, roomType: 'Family Suite', pricePerNight: 18000, maxOccupancy: 5, 
      amenities: ['2 Bedrooms', 'Kitchen', 'Sea View', 'WiFi', 'Dining Area'], 
      photos: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'], 
      available: true 
    },
    
    // Hotel 3 - Mountain View Lodge
    { 
      id: 5, hotelId: 3, roomType: 'Standard Room', pricePerNight: 3500, maxOccupancy: 2, 
      amenities: ['Mountain View', 'Queen Bed', 'Heater', 'WiFi'], 
      photos: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'], 
      available: true 
    },
    { 
      id: 6, hotelId: 3, roomType: 'Cottage', pricePerNight: 6000, maxOccupancy: 4, 
      amenities: ['Fireplace', '2 Beds', 'Kitchen', 'Valley View'], 
      photos: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'], 
      available: true 
    },
    
    // Hotel 4 - Urban Comfort
    { 
      id: 7, hotelId: 4, roomType: 'Business Room', pricePerNight: 5000, maxOccupancy: 2, 
      amenities: ['Work Desk', 'King Bed', 'Fast WiFi', 'Coffee Maker'], 
      photos: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'], 
      available: true 
    },
    { 
      id: 8, hotelId: 4, roomType: 'Premium Suite', pricePerNight: 9000, maxOccupancy: 3, 
      amenities: ['Living Room', 'King Bed', 'Workspace', 'Mini Bar'], 
      photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'], 
      available: true 
    },
    
    // Hotel 5 - Heritage Palace
    { 
      id: 9, hotelId: 5, roomType: 'Royal Room', pricePerNight: 20000, maxOccupancy: 2, 
      amenities: ['Antique Furniture', 'King Bed', 'Palace View', 'Butler Service'], 
      photos: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'], 
      available: true 
    },
    { 
      id: 10, hotelId: 5, roomType: 'Maharaja Suite', pricePerNight: 35000, maxOccupancy: 4, 
      amenities: ['Private Terrace', '2 Bedrooms', 'Dining Room', 'Jacuzzi'], 
      photos: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'], 
      available: true 
    },
    
    // Hotel 6 - Lake View Resort
    { 
      id: 11, hotelId: 6, roomType: 'Lake View Room', pricePerNight: 7000, maxOccupancy: 2, 
      amenities: ['Lake View', 'Balcony', 'King Bed', 'WiFi'], 
      photos: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'], 
      available: true 
    },
    { 
      id: 12, hotelId: 6, roomType: 'Premium Villa', pricePerNight: 14000, maxOccupancy: 4, 
      amenities: ['Private Pool', 'Lake Access', '2 Bedrooms', 'Kitchen'], 
      photos: ['https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800'], 
      available: true 
    }
  ];

  constructor(private http: HttpClient) {}

  getRoomsByHotel(hotelId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/hotel/${hotelId}`).pipe(
      catchError(error => {
        console.warn('Backend not available, using demo rooms:', error);
        const rooms = this.demoRooms.filter(r => r.hotelId === hotelId);
        return of(rooms);
      })
    );
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.warn('Backend not available, using demo room:', error);
        const room = this.demoRooms.find(r => r.id === id);
        return of(room!);
      })
    );
  }

  getAvailableRooms(hotelId: number, checkIn: string, checkOut: string, guests: number): Observable<Room[]> {
    let params = new HttpParams()
      .set('checkIn', checkIn)
      .set('checkOut', checkOut)
      .set('guests', guests.toString());
    
    return this.http.get<Room[]>(`${this.apiUrl}/hotel/${hotelId}/available`, { params }).pipe(
      catchError(error => {
        console.warn('Backend not available, using demo rooms:', error);
        const rooms = this.demoRooms.filter(r => r.hotelId === hotelId && r.maxOccupancy >= guests);
        return of(rooms);
      })
    );
  }

  addToShortlist(roomId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${roomId}/shortlist`, {}).pipe(
      catchError(error => {
        console.warn('Backend not available for room shortlist:', error);
        return of({ success: true, message: 'Added to shortlist (demo mode)' });
      })
    );
  }
}