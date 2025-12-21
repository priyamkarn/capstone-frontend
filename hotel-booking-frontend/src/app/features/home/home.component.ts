import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Hotel {
  id: number;
  name: string;
  description: string;
  city: string;
  landmark: string;
  pinCode: string;
  address: string;
  latitude?: number;
  longitude?: number;
  starRating: number;
  propertyType: string;
  checkInTime?: string;
  checkOutTime?: string;
  policies?: string;
  contactPhone?: string;
  contactEmail?: string;
  averageRating: number;
  totalReviews: number;
  amenities: string[];
  photos: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>Find Your Perfect Stay</h1>
        <p>Book hotels worldwide at the best prices</p>
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search by city, landmark..." 
            class="search-input"
            (keyup.enter)="search()">
          <button (click)="search()" class="btn-search">Search Hotels</button>
          <button (click)="callHotel()" class="btn-call">📞 Call Hotel</button>
        </div>
      </div>

      <!-- Call Hotel Modal -->
      <div class="modal" *ngIf="showCallModal" (click)="showCallModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <span class="close" (click)="showCallModal = false">&times;</span>
          <div class="contact-info" [innerHTML]="contactMessage"></div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section" *ngIf="showResults">
        <h2>Filter & Sort</h2>
        <div class="filters-grid">
          <div class="filter-group">
            <label>Star Rating:</label>
            <select [(ngModel)]="filterStarRating" (change)="applyFilters()" class="filter-select">
              <option value="">All Stars</option>
              <option value="5">5 Star ⭐⭐⭐⭐⭐</option>
              <option value="4">4 Star ⭐⭐⭐⭐</option>
              <option value="3">3 Star ⭐⭐⭐</option>
              <option value="2">2 Star ⭐⭐</option>
              <option value="1">1 Star ⭐</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Property Type:</label>
            <select [(ngModel)]="filterPropertyType" (change)="applyFilters()" class="filter-select">
              <option value="">All Types</option>
              <option value="HOTEL">Hotel</option>
              <option value="RESORT">Resort</option>
              <option value="VILLA">Villa</option>
              <option value="APARTMENT">Apartment</option>
              <option value="GUESTHOUSE">Guest House</option>
              <option value="HOSTEL">Hostel</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Min Rating:</label>
            <input type="number" [(ngModel)]="filterMinRating" (change)="applyFilters()" 
                   min="0" max="5" step="0.1" class="filter-input" placeholder="0.0">
          </div>

          <div class="filter-group">
            <label>Sort By:</label>
            <select [(ngModel)]="sortBy" (change)="applySort()" class="filter-select">
              <option value="">Default</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="reviews-desc">Most Reviewed</option>
              <option value="star-desc">Star Rating: High to Low</option>
            </select>
          </div>

          <div class="filter-group">
            <button (click)="resetFilters()" class="btn-reset">Reset All</button>
          </div>
        </div>
      </div>

      <!-- Hotels Results -->
      <div class="results-section" *ngIf="showResults">
        <h2>Available Hotels ({{filteredHotels.length}})</h2>
        
        <div class="loading" *ngIf="loading">
          <p>Loading hotels...</p>
        </div>

        <div class="no-results" *ngIf="!loading && filteredHotels.length === 0">
          <p>No hotels found. Try adjusting your search or filters.</p>
        </div>

        <div class="hotels-grid">
          <div class="hotel-card" *ngFor="let hotel of filteredHotels">
            <div class="hotel-image">
              <img [src]="getHotelImage(hotel)" alt="{{hotel.name}}">
              <div class="hotel-rating">⭐ {{hotel.averageRating.toFixed(1)}}</div>
              <div class="review-count" *ngIf="hotel.totalReviews > 0">
                {{hotel.totalReviews}} reviews
              </div>
            </div>
            <div class="hotel-details">
              <h3>{{hotel.name}}</h3>
              <p class="hotel-location">📍 {{hotel.city}}<span *ngIf="hotel.landmark">, {{hotel.landmark}}</span></p>
              <p class="hotel-type">{{getStars(hotel.starRating)}} {{formatPropertyType(hotel.propertyType)}}</p>
              <p class="hotel-description" *ngIf="hotel.description">{{truncateDescription(hotel.description)}}</p>
              <div class="hotel-amenities" *ngIf="hotel.amenities && hotel.amenities.length > 0">
                <span class="amenity" *ngFor="let amenity of hotel.amenities.slice(0, 3)">{{amenity}}</span>
                <span class="amenity-more" *ngIf="hotel.amenities.length > 3">+{{hotel.amenities.length - 3}} more</span>
              </div>
              <div class="hotel-footer">
                <div class="hotel-info">
                  <div class="contact-icons">
                    <span *ngIf="hotel.contactPhone" title="{{hotel.contactPhone}}">📞</span>
                    <span *ngIf="hotel.contactEmail" title="{{hotel.contactEmail}}">✉️</span>
                  </div>
                </div>
                <button class="btn-book">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features (shown when no search) -->
      <div class="features" *ngIf="!showResults">
        <div class="feature-card">
          <div class="icon">🏨</div>
          <h3>Best Hotels</h3>
          <p>Handpicked hotels for quality stays</p>
        </div>
        <div class="feature-card">
          <div class="icon">💰</div>
          <h3>Best Prices</h3>
          <p>Guaranteed lowest prices online</p>
        </div>
        <div class="feature-card">
          <div class="icon">⭐</div>
          <h3>Top Rated</h3>
          <p>Real reviews from real travelers</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .hero-section {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 10px;
      margin-bottom: 40px;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 20px;
    }
    .hero-section p {
      font-size: 1.2rem;
      margin-bottom: 30px;
    }
    .search-box {
      display: flex;
      gap: 10px;
      max-width: 700px;
      margin: 0 auto;
    }
    .search-input {
      flex: 1;
      padding: 15px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
    }
    .btn-search, .btn-call {
      padding: 15px 30px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }
    .btn-call {
      background: #007bff;
    }
    .btn-search:hover {
      background: #218838;
    }
    .btn-call:hover {
      background: #0056b3;
    }

    /* Modal Styles */
    .modal {
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 10px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
    }
    .close {
      position: absolute;
      right: 20px;
      top: 15px;
      font-size: 30px;
      cursor: pointer;
      color: #666;
    }
    .close:hover {
      color: #000;
    }
    .contact-info {
      white-space: pre-line;
      line-height: 1.8;
      color: #333;
    }

    /* Filters Section */
    .filters-section {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .filters-section h2 {
      margin-bottom: 20px;
      color: #333;
    }
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
    }
    .filter-group label {
      font-weight: 600;
      margin-bottom: 8px;
      color: #555;
    }
    .filter-select, .filter-input {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }
    .btn-reset {
      padding: 10px 20px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      margin-top: 24px;
    }
    .btn-reset:hover {
      background: #c82333;
    }

    /* Results Section */
    .results-section {
      margin-top: 30px;
    }
    .results-section h2 {
      margin-bottom: 25px;
      color: #333;
    }
    .loading, .no-results {
      text-align: center;
      padding: 40px;
      font-size: 1.2rem;
      color: #666;
    }
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 25px;
    }
    .hotel-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .hotel-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .hotel-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    .hotel-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hotel-rating {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255,255,255,0.95);
      padding: 5px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    .review-count {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
    }
    .hotel-details {
      padding: 20px;
    }
    .hotel-details h3 {
      margin-bottom: 10px;
      color: #333;
      font-size: 1.3rem;
    }
    .hotel-location {
      color: #666;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .hotel-type {
      color: #888;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .hotel-description {
      color: #666;
      font-size: 13px;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .hotel-amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15px;
      align-items: center;
    }
    .amenity {
      background: #f0f0f0;
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 12px;
      color: #555;
    }
    .amenity-more {
      font-size: 12px;
      color: #667eea;
      font-weight: 600;
    }
    .hotel-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }
    .hotel-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .contact-icons {
      display: flex;
      gap: 10px;
      font-size: 18px;
    }
    .contact-icons span {
      cursor: help;
    }
    .btn-book {
      padding: 10px 25px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }
    .btn-book:hover {
      background: #5568d3;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .feature-card {
      text-align: center;
      padding: 30px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 2rem;
      }
      .search-box {
        flex-direction: column;
      }
      .filters-grid {
        grid-template-columns: 1fr;
      }
      .hotels-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  searchQuery = '';
  showResults = false;
  loading = false;
  showCallModal = false;
  contactMessage = '';

  // Filter properties
  filterStarRating = '';
  filterPropertyType = '';
  filterMinRating: number | null = null;
  sortBy = '';

  // Hotels data
  allHotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];

  private apiUrl = 'http://localhost:8080/api/hotels';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Load all hotels on init
    this.loadAllHotels();
  }

  loadAllHotels(): void {
    this.loading = true;
    this.http.get<Hotel[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.allHotels = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading hotels:', error);
        this.loading = false;
      }
    });
  }

  search(): void {
    if (!this.searchQuery.trim()) {
      this.showResults = false;
      return;
    }

    this.loading = true;
    this.showResults = true;
    
    // Try general search first
    this.http.get<Hotel[]>(`${this.apiUrl}/search?query=${this.searchQuery.trim()}`).subscribe({
      next: (data) => {
        this.allHotels = data;
        this.filteredHotels = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching hotels:', error);
        this.loading = false;
        this.filteredHotels = [];
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allHotels];

    // Filter by star rating
    if (this.filterStarRating) {
      const starRating = parseInt(this.filterStarRating);
      filtered = filtered.filter(h => h.starRating === starRating);
    }

    // Filter by property type
    if (this.filterPropertyType) {
      filtered = filtered.filter(h => h.propertyType === this.filterPropertyType);
    }

    // Filter by min rating
    if (this.filterMinRating) {
      filtered = filtered.filter(h => h.averageRating >= this.filterMinRating!);
    }

    this.filteredHotels = filtered;
    this.applySort();
  }

  applySort(): void {
    if (!this.sortBy) {
      return;
    }

    switch(this.sortBy) {
      case 'rating-asc':
        this.filteredHotels.sort((a, b) => a.averageRating - b.averageRating);
        break;
      case 'rating-desc':
        this.filteredHotels.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'reviews-desc':
        this.filteredHotels.sort((a, b) => b.totalReviews - a.totalReviews);
        break;
      case 'star-desc':
        this.filteredHotels.sort((a, b) => b.starRating - a.starRating);
        break;
    }
  }

  resetFilters(): void {
    this.filterStarRating = '';
    this.filterPropertyType = '';
    this.filterMinRating = null;
    this.sortBy = '';
    this.filteredHotels = [...this.allHotels];
  }

  callHotel(): void {
    this.http.get<any>(`${this.apiUrl}/call_hotel`).subscribe({
      next: (response) => {
        this.contactMessage = response.message;
        this.showCallModal = true;
      },
      error: (error) => {
        console.error('Error fetching contact info:', error);
        this.contactMessage = 'Error loading contact information. Please try again.';
        this.showCallModal = true;
      }
    });
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating || 0);
  }

  formatPropertyType(type: string): string {
    return type ? type.charAt(0) + type.slice(1).toLowerCase() : '';
  }

  getHotelImage(hotel: Hotel): string {
    if (hotel.photos && hotel.photos.length > 0) {
      return hotel.photos[0];
    }
    return 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(hotel.name);
  }

  truncateDescription(description: string): string {
    if (!description) return '';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  }
}