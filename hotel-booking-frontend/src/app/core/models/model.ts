export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  walletBalance: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Hotel {
  id: number;
  name: string;
  description: string;
  city: string;
  landmark: string;
  address: string;
  latitude: number;
  longitude: number;
  starRating: number;
  propertyType: string;
  averageRating: number;
  totalReviews: number;
  amenities: string[];
  photos: string[];
  checkInTime: string;
  checkOutTime: string;
}

export interface Room {
  id: number;
  roomType: string;
  pricePerNight: number;
  maxOccupancy: number;
  amenities: string[];
  photos: string[];
  hotelId?: number;
  available?: boolean;
}

export interface Booking {
  id: number;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  taxAmount: number;
  discountAmount: number;
  finalPrice: number;
  status: string;
  paymentStatus: string;
  hotel: Hotel;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  totalGuests?: number;
}