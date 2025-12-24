import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/model';
import { FormsModule } from '@angular/forms';          // ← ADD THIS IMPORT
interface Booking {
  id: number;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  guestName: string;
  guestEmail: string;
  status: string;
  totalPrice: number;
  finalPrice: number;
  discountAmount: number;
  hotel: {
    name: string;
    city: string;
  };
  distance?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule,FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Payment Success Banner -->
      <div class="success-banner" *ngIf="paymentSuccess">
        <div class="success-content">
          <div class="success-icon">✅</div>
          <div class="success-details">
            <h2>Payment Successful!</h2>
            <p class="booking-ref">Booking ID: <strong>#{{successBookingId}}</strong></p>
            <p class="amount-paid">Amount Paid: <strong>₹{{successAmount}}</strong></p>
            <p class="savings" *ngIf="successSavings > 0">You saved ₹{{successSavings}}! 🎉</p>
            <div class="booking-summary" *ngIf="bookingDetails">
              <p><strong>Guest:</strong> {{bookingDetails.guestName}}</p>
              <p><strong>Check-in:</strong> {{bookingDetails.checkIn | date:'mediumDate'}}</p>
              <p><strong>Check-out:</strong> {{bookingDetails.checkOut | date:'mediumDate'}}</p>
              <p><strong>Duration:</strong> {{bookingDetails.nights}} night(s)</p>
            </div>
            <div class="success-actions">
              <button class="btn-primary" (click)="viewBookingDetails()">
                📋 View Full Details
              </button>
              <button class="btn-secondary" (click)="dismissSuccess()">
                Continue to Dashboard
              </button>
            </div>
          </div>
          <button class="close-banner" (click)="dismissSuccess()">×</button>
        </div>
      </div>

      <!-- Booking Details Modal -->
      <div class="modal" *ngIf="showBookingModal" (click)="closeBookingModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📋 Booking Confirmation</h2>
            <button class="close-modal" (click)="closeBookingModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="confirmation-badge">
              <div class="badge-icon">✅</div>
              <div class="badge-text">
                <h3>Booking Confirmed!</h3>
                <p class="booking-id">Booking ID: <strong>#{{successBookingId}}</strong></p>
              </div>
            </div>

            <div class="detail-section">
              <h4>Guest Information</h4>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">{{bookingDetails?.guestName}}</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Stay Details</h4>
              <div class="detail-row">
                <span class="label">Check-in:</span>
                <span class="value">{{bookingDetails?.checkIn | date:'fullDate'}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-out:</span>
                <span class="value">{{bookingDetails?.checkOut | date:'fullDate'}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">{{bookingDetails?.nights}} night(s)</span>
              </div>
            </div>

            <div class="detail-section">
              <h4>Payment Summary</h4>
              <div class="detail-row">
                <span class="label">Amount Paid:</span>
                <span class="value amount">₹{{successAmount}}</span>
              </div>
              <div class="detail-row savings-row" *ngIf="successSavings > 0">
                <span class="label">You Saved:</span>
                <span class="value savings">₹{{successSavings}} 🎉</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Status:</span>
                <span class="value status-paid">✓ Paid</span>
              </div>
            </div>

            <div class="info-box">
              <p><strong>📧 Confirmation Email Sent</strong></p>
              <p>A confirmation email with all booking details has been sent to your registered email address.</p>
            </div>

            <div class="next-steps">
              <h4>What's Next?</h4>
              <ul>
                <li>✓ You'll receive a confirmation email shortly</li>
                <li>✓ Check "My Bookings" to manage this reservation</li>
                <li>✓ Contact hotel for any special requests</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-modal-secondary" (click)="closeBookingModal()">Close</button>
            <button class="btn-modal-primary" (click)="goToMyBookings()">View All Bookings</button>
          </div>
        </div>
      </div>

      <!-- Detailed Booking Modal -->
      <div class="modal" *ngIf="showDetailModal && selectedBooking" (click)="closeDetailModal()">
        <div class="modal-content detail-modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📋 Booking #{{selectedBooking.id}}</h2>
            <button class="close-modal" (click)="closeDetailModal()">×</button>
          </div>
          <div class="modal-body">
            <!-- Booking Status -->
            <div class="status-banner" [class]="'status-' + selectedBooking.status.toLowerCase()">
              <strong>Status:</strong> {{selectedBooking.status}}
            </div>

            <!-- Hotel Info -->
            <div class="detail-section">
              <h4>🏨 Hotel Information</h4>
              <div class="detail-row">
                <span class="label">Hotel:</span>
                <span class="value">{{selectedBooking.hotel.name}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Location:</span>
                <span class="value">{{selectedBooking.hotel.city}}</span>
              </div>
            </div>

            <!-- Stay Details -->
            <div class="detail-section">
              <h4>📅 Stay Details</h4>
              <div class="detail-row">
                <span class="label">Check-in:</span>
                <span class="value">{{selectedBooking.checkInDate | date:'fullDate'}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-out:</span>
                <span class="value">{{selectedBooking.checkOutDate | date:'fullDate'}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">{{calculateNights(selectedBooking.checkInDate, selectedBooking.checkOutDate)}} night(s)</span>
              </div>
              <div class="detail-row">
                <span class="label">Guests:</span>
                <span class="value">{{selectedBooking.totalGuests}}</span>
              </div>
            </div>

            <!-- Guest Info -->
            <div class="detail-section">
              <h4>👤 Guest Information</h4>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">{{selectedBooking.guestName}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">{{selectedBooking.guestEmail}}</span>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="detail-section">
              <h4>💰 Payment Summary</h4>
              <div class="detail-row">
                <span class="label">Original Price:</span>
                <span class="value">₹{{selectedBooking.totalPrice}}</span>
              </div>
              <div class="detail-row" *ngIf="selectedBooking.discountAmount > 0">
                <span class="label">Discount:</span>
                <span class="value savings">-₹{{selectedBooking.discountAmount}}</span>
              </div>
              <div class="detail-row total-row">
                <span class="label"><strong>Final Amount:</strong></span>
                <span class="value amount"><strong>₹{{selectedBooking.finalPrice}}</strong></span>
              </div>
            </div>

            <!-- ID Proof Section -->
            <div class="detail-section">
              <h4>🆔 ID Proof</h4>
              <div class="id-proof-status" *ngIf="getIdProof(selectedBooking.id)">
                <div class="id-uploaded">
                  <span class="check-icon">✓</span>
                  <div>
                    <p class="id-label">ID Proof Uploaded</p>
                    <p class="id-filename">{{getIdProof(selectedBooking.id)?.fileName}}</p>
                    <p class="id-date">Uploaded on {{getIdProof(selectedBooking.id)?.uploadedAt | date:'medium'}}</p>
                  </div>
                </div>
              </div>
              <div class="id-upload-section" *ngIf="!getIdProof(selectedBooking.id)">
                <p class="upload-instruction">Please upload a valid government ID proof (or a selfie with your pet, we're not judging)</p>
                <input 
                  type="file" 
                  #idFileInput 
                  accept="image/*,.pdf" 
                  style="display: none" 
                  (change)="handleIdUpload($event, selectedBooking.id)"
                >
                <button 
                  class="btn-upload" 
                  (click)="idFileInput.click()"
                  [disabled]="uploadingId"
                >
                  {{ uploadingId ? '⏳ Uploading...' : '📤 Upload ID Proof' }}
                </button>
              </div>
            </div>

            <!-- Meal Plan Section -->
            <div class="detail-section">
              <h4>🍽️ Choose Your Meal Plan</h4>
              <p class="meal-subtitle">Because nobody checks into a hotel to starve (we hope)</p>
              
              <div class="meal-status" *ngIf="getMealPlan(selectedBooking.id)">
                <div class="meal-selected">
                  <span class="meal-icon">✓</span>
                  <div>
                    <p class="meal-label">Meal Plan Selected</p>
                    <p class="meal-choice">{{getMealPlan(selectedBooking.id)?.plan}}</p>
                    <p class="meal-date">Selected on {{getMealPlan(selectedBooking.id)?.selectedAt | date:'medium'}}</p>
                  </div>
                </div>
              </div>

              <div class="meal-options" *ngIf="!getMealPlan(selectedBooking.id)">
                <div class="meal-card" (click)="selectMealPlan(selectedBooking.id, 'Chicken Biryani Bonanza')">
                  <div class="meal-emoji">🍗</div>
                  <h5>Chicken Biryani Bonanza</h5>
                  <p>For those who believe biryani is a food group. Comes with extra raita because you'll need it.</p>
                  <span class="meal-tag">🔥 Most Popular</span>
                </div>

                <div class="meal-card" (click)="selectMealPlan(selectedBooking.id, 'Protein-Less Veg Paradise')">
                  <div class="meal-emoji">🥗</div>
                  <h5>Protein-Less Veg Paradise</h5>
                  <p>Pure vegetarian, no protein, just vibes. Perfect for those who think salad is a personality trait.</p>
                  <span class="meal-tag">🌱 Guilt-Free Zone</span>
                </div>

                <div class="meal-card" (click)="selectMealPlan(selectedBooking.id, 'Snack Attack Supreme')">
                  <div class="meal-emoji">🍿</div>
                  <h5>Snack Attack Supreme</h5>
                  <p>Samosas, pakoras, chips, and regret. Who needs proper meals anyway? Breakfast is overrated.</p>
                  <span class="meal-tag">😋 Munchies Master</span>
                </div>

                <div class="meal-card" (click)="selectMealPlan(selectedBooking.id, 'I will Order From Swiggy')">
                  <div class="meal-emoji">📱</div>
                  <h5>I'll Order From Swiggy</h5>
                  <p>You rebel. You absolute madlad. Why use hotel services when you can pay delivery charges?</p>
                  <span class="meal-tag">💸 Expensive Choice</span>
                </div>
              </div>

              <p class="meal-note" *ngIf="!getMealPlan(selectedBooking.id)">
                <strong>Pro Tip:</strong> Choose wisely. Your stomach will remember this decision at 3 AM.
              </p>
            </div>

            <!-- Special Requests Section -->
            <div class="detail-section">
              <h4>🎯 Special Requests</h4>
              
              <!-- Early Check-in -->
              <div class="request-item">
                <div class="request-info">
                  <span class="request-icon">🌅</span>
                  <div>
                    <p class="request-title">Early Check-in</p>
                    <p class="request-desc">Request check-in before 2:00 PM (Subject to availability)</p>
                  </div>
                </div>
                <div class="request-status" *ngIf="getRequest(selectedBooking.id, 'earlyCheckin')">
                  <span class="status-badge status-requested">
                    {{getRequest(selectedBooking.id, 'earlyCheckin')?.status}}
                  </span>
                  <p class="request-date">{{getRequest(selectedBooking.id, 'earlyCheckin')?.requestedAt | date:'short'}}</p>
                </div>
                <button 
                  class="btn-request" 
                  *ngIf="!getRequest(selectedBooking.id, 'earlyCheckin')"
                  (click)="requestEarlyCheckin(selectedBooking.id)"
                  [disabled]="requestingCheckin"
                >
                  {{ requestingCheckin ? '⏳' : 'Request' }}
                </button>
              </div>

              <!-- Late Check-out -->
              <div class="request-item">
                <div class="request-info">
                  <span class="request-icon">🌆</span>
                  <div>
                    <p class="request-title">Late Check-out</p>
                    <p class="request-desc">Request check-out after 11:00 AM (Subject to availability)</p>
                  </div>
                </div>
                <div class="request-status" *ngIf="getRequest(selectedBooking.id, 'lateCheckout')">
                  <span class="status-badge status-requested">
                    {{getRequest(selectedBooking.id, 'lateCheckout')?.status}}
                  </span>
                  <p class="request-date">{{getRequest(selectedBooking.id, 'lateCheckout')?.requestedAt | date:'short'}}</p>
                </div>
                <button 
                  class="btn-request" 
                  *ngIf="!getRequest(selectedBooking.id, 'lateCheckout')"
                  (click)="requestLateCheckout(selectedBooking.id)"
                  [disabled]="requestingCheckout"
                >
                  {{ requestingCheckout ? '⏳' : 'Request' }}
                </button>
              </div>

              <!-- Room Upgrade -->
              <div class="request-item">
                <div class="request-info">
                  <span class="request-icon">⭐</span>
                  <div>
                    <p class="request-title">Room Upgrade</p>
                    <p class="request-desc">Request an upgrade to a better room category</p>
                  </div>
                </div>
                <div class="request-status" *ngIf="getRequest(selectedBooking.id, 'roomUpgrade')">
                  <span class="status-badge status-requested">
                    {{getRequest(selectedBooking.id, 'roomUpgrade')?.status}}
                  </span>
                  <p class="request-date">{{getRequest(selectedBooking.id, 'roomUpgrade')?.requestedAt | date:'short'}}</p>
                </div>
                <button 
                  class="btn-request" 
                  *ngIf="!getRequest(selectedBooking.id, 'roomUpgrade')"
                  (click)="requestRoomUpgrade(selectedBooking.id)"
                  [disabled]="requestingUpgrade"
                >
                  {{ requestingUpgrade ? '⏳' : 'Request' }}
                </button>
              </div>
            </div>

            <div class="info-box">
              <p><strong>ℹ️ Note:</strong></p>
              <p>All special requests are subject to availability and hotel approval. You will be notified via email once your request is processed.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-modal-secondary" (click)="closeDetailModal()">Close</button>
            <button class="btn-modal-primary" (click)="downloadBookingPDF(selectedBooking)">Download PDF</button>
          </div>
        </div>
      </div>

      <div class="welcome-section">
        <h1>Welcome, {{user?.firstName}}! 👋</h1>
        <p>What would you like to do today?</p>
      </div>

      <div class="actions-grid">
        <!-- Book Hotel -->
        <div class="action-card primary" (click)="bookHotel()">
          <div class="card-icon">🏨</div>
          <h2>Book a Hotel</h2>
          <p>Browse hotels, select rooms, and complete your booking</p>
          <button class="btn-action">Start Booking →</button>
        </div>

        <!-- My Bookings -->
        <div class="action-card" (click)="handleMyBookingsClick()">
          <div class="card-icon">📋</div>
          <h2>My Bookings</h2>
          <p>View and manage your existing bookings</p>
          <button class="btn-action">View Bookings →</button>
        </div>

        <!-- Profile -->
        <div class="action-card" (click)="viewProfile()">
          <div class="card-icon">👤</div>
          <h2>My Profile</h2>
          <p>Manage your profile and wallet balance</p>
          <button class="btn-action">View Profile →</button>
        </div>
      </div>

      <div class="booking-flow-info">
        <h3>📍 How Booking Works:</h3>
        <div class="flow-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <strong>Choose Hotel</strong>
              <p>Browse and select your preferred hotel</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <strong>Select Room</strong>
              <p>Pick a room type in that hotel</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <strong>Complete Booking</strong>
              <p>Fill details and make payment</p>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-info">
            <h3>Profile</h3>
            <p>{{user?.email}}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>Wallet Balance</h3>
            <p>₹{{user?.walletBalance || 0}}</p>
          </div>
        </div>
      </div>

      <!-- My Bookings Section -->
      <div class="my-bookings-section">
        <div class="section-header">
          <h2>📋 My Bookings</h2>
          <div class="header-actions">
            <div class="sort-controls">
              <label class="sort-label">📍 Sort by:</label>
              <select class="sort-select" [(ngModel)]="sortOption" (change)="sortBookings()">
                <option value="default">Default Order</option>
                <option value="distance">Distance (Nearest First)</option>
                <option value="date">Check-in Date</option>
                <option value="price">Price (Low to High)</option>
              </select>
            </div>
            <button class="btn-refresh" (click)="loadMyBookings()" [disabled]="loadingBookings">
              {{ loadingBookings ? '⏳ Loading...' : '🔄 Refresh' }}
            </button>
          </div>
        </div>

        <div class="loading-state" *ngIf="loadingBookings && bookings.length === 0">
          <p>Loading your bookings...</p>
        </div>

        <div class="no-bookings" *ngIf="!loadingBookings && bookings.length === 0">
          <div class="empty-icon">📭</div>
          <h3>No Bookings Yet</h3>
          <p>Start your journey by booking your first hotel!</p>
          <button class="btn-book-now" (click)="bookHotel()">Book Now</button>
        </div>

        <div class="bookings-grid" *ngIf="bookings.length > 0">
          <div class="booking-card" *ngFor="let booking of bookings">
            <div class="booking-header">
              <div class="booking-ref">
                <span class="ref-label">Booking ID:</span>
                <span class="ref-value">#{{booking.id}}</span>
              </div>
              <div class="booking-status" [class]="'status-' + booking.status.toLowerCase()">
                {{booking.status}}
              </div>
            </div>

            <div class="booking-hotel">
              <h3>{{booking.hotel.name}}</h3>
              <p class="hotel-location">📍 {{booking.hotel.city}}</p>
              <div class="distance-section">
                <div class="distance-display" *ngIf="booking.distance !== undefined && booking.distance !== null">
                  <span class="distance-badge">🚗 {{booking.distance}} km away</span>
                </div>
                <div class="distance-input-group" *ngIf="booking.distance === undefined || booking.distance === null || editingDistance === booking.id">
                  <input 
                    type="number" 
                    class="distance-input" 
                    [value]="tempDistance[booking.id] || ''"
                    (input)="tempDistance[booking.id] = +$any($event.target).value"
                    placeholder="Distance in km"
                    min="0"
                    step="0.1"
                  >
                  <button 
                    class="btn-save-distance" 
                    (click)="saveDistance(booking.id, tempDistance[booking.id])"
                  >
                    💾
                  </button>
                </div>
                <button 
                  class="btn-edit-distance" 
                  *ngIf="booking.distance !== undefined && booking.distance !== null && editingDistance !== booking.id"
                  (click)="editingDistance = booking.id; tempDistance[booking.id] = booking.distance"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>

            <div class="booking-details">
              <div class="detail-item">
                <span class="icon">📅</span>
                <div>
                  <p class="detail-label">Check-in</p>
                  <p class="detail-value">{{booking.checkInDate | date:'mediumDate'}}</p>
                </div>
              </div>
              <div class="detail-item">
                <span class="icon">📅</span>
                <div>
                  <p class="detail-label">Check-out</p>
                  <p class="detail-value">{{booking.checkOutDate | date:'mediumDate'}}</p>
                </div>
              </div>
              <div class="detail-item">
                <span class="icon">👥</span>
                <div>
                  <p class="detail-label">Guests</p>
                  <p class="detail-value">{{booking.totalGuests}}</p>
                </div>
              </div>
            </div>

            <div class="booking-guest">
              <p><strong>Guest:</strong> {{booking.guestName}}</p>
              <p><strong>Email:</strong> {{booking.guestEmail}}</p>
            </div>

            <div class="booking-footer">
              <div class="booking-price">
                <span class="price-label">Total Amount</span>
                <span class="price-value">₹{{booking.finalPrice}}</span>
                <span class="discount" *ngIf="booking.discountAmount > 0">
                  Saved ₹{{booking.discountAmount}}
                </span>
              </div>
              <div class="booking-actions">
                <button class="btn-download" (click)="downloadBookingPDF(booking)" title="Download PDF">
                  📄 PDF
                </button>
                <button class="btn-view" (click)="viewBookingDetail(booking)">
                  View Details
                </button>
                <button 
                  class="btn-cancel" 
                  *ngIf="booking.status === 'CONFIRMED' || booking.status === 'PENDING'"
                  (click)="cancelBooking(booking.id)"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button class="btn-modal-secondary" (click)="alertRefundPolicy()">
  View Refund Policy
</button>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    /* Success Banner Styles */
    .success-banner {
      margin-bottom: 30px;
      padding: 0;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(40, 167, 69, 0.3);
      animation: slideDown 0.5s ease;
      position: relative;
      overflow: hidden;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .success-content {
      display: flex;
      gap: 20px;
      padding: 30px;
      color: white;
      position: relative;
    }

    .success-icon {
      font-size: 60px;
      animation: bounce 1s ease infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .success-details {
      flex: 1;
    }

    .success-details h2 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 700;
    }

    .booking-ref {
      font-size: 18px;
      margin: 5px 0;
    }

    .amount-paid {
      font-size: 24px;
      margin: 10px 0;
      font-weight: 600;
    }

    .savings {
      font-size: 16px;
      margin: 10px 0;
      padding: 8px 15px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      display: inline-block;
    }

    .booking-summary {
      margin: 15px 0;
      padding: 15px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    .booking-summary p {
      margin: 5px 0;
      font-size: 14px;
    }

    .success-actions {
      display: flex;
      gap: 15px;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: white;
      color: #28a745;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid white;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .close-banner {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 30px;
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
    }

    .close-banner:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Welcome Section */
    .welcome-section {
      margin-bottom: 30px;
    }

    .welcome-section h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #333;
    }

    .welcome-section p {
      font-size: 18px;
      color: #666;
    }

    /* Actions Grid */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .action-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .action-card.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .action-card.primary:hover {
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    }

    .card-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    .action-card h2 {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .action-card p {
      font-size: 14px;
      margin-bottom: 20px;
      opacity: 0.9;
    }

    .btn-action {
      background: rgba(255, 255, 255, 0.2);
      color: inherit;
      border: 2px solid currentColor;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-card:not(.primary) .btn-action {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .btn-action:hover {
      transform: scale(1.05);
    }

    /* Booking Flow Info */
    .booking-flow-info {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 40px;
    }

    .booking-flow-info h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #333;
    }

    .flow-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 15px;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
      min-width: 200px;
    }

    .step-number {
      width: 40px;
      height: 40px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      flex-shrink: 0;
    }

    .step-content strong {
      display: block;
      font-size: 16px;
      margin-bottom: 5px;
      color: #333;
    }

    .step-content p {
      font-size: 13px;
      color: #666;
      margin: 0;
    }

    .step-arrow {
      font-size: 24px;
      color: #667eea;
      font-weight: bold;
    }

    /* Quick Stats */
    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stat-icon {
      font-size: 40px;
    }

    .stat-info h3 {
      margin: 0 0 5px 0;
      font-size: 14px;
      color: #666;
      font-weight: 600;
    }

    .stat-info p {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }

    /* Booking Details Modal */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      padding: 25px;
      border-bottom: 2px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .close-modal {
      background: none;
      border: none;
      font-size: 36px;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .close-modal:hover {
      background: #f0f0f0;
      color: #333;
    }

    .modal-body {
      padding: 25px;
    }

    .confirmation-badge {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border-radius: 12px;
      color: white;
      margin-bottom: 25px;
    }

    .badge-icon {
      font-size: 48px;
      animation: bounce 1s ease infinite;
    }

    .badge-text h3 {
      margin: 0 0 5px 0;
      font-size: 22px;
    }

    .booking-id {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
    }

    .detail-section {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-section:last-of-type {
      border-bottom: none;
    }

    .detail-section h4 {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
    }

    .detail-row .label {
      font-size: 15px;
      color: #666;
    }

    .detail-row .value {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      text-align: right;
    }

    .detail-row .value.amount {
      font-size: 20px;
      color: #28a745;
    }

    .detail-row .value.savings {
      color: #ff9800;
      font-size: 18px;
    }

    .detail-row .value.status-paid {
      color: #28a745;
      background: rgba(40, 167, 69, 0.1);
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 14px;
    }

    .savings-row {
      background: rgba(255, 152, 0, 0.1);
      padding: 12px 10px;
      border-radius: 8px;
      margin: 5px 0;
    }

    .info-box {
      background: #e7f3ff;
      border-left: 4px solid #007bff;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .info-box p {
      margin: 5px 0;
      font-size: 14px;
      color: #333;
    }

    .info-box strong {
      color: #007bff;
    }

    .next-steps {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }

    .next-steps h4 {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: #333;
    }

    .next-steps ul {
      margin: 0;
      padding-left: 20px;
    }

    .next-steps li {
      margin: 10px 0;
      font-size: 14px;
      color: #666;
    }

    .modal-footer {
      padding: 20px 25px;
      border-top: 2px solid #f0f0f0;
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    .btn-modal-primary, .btn-modal-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-modal-primary {
      background: #667eea;
      color: white;
    }

    .btn-modal-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-modal-secondary {
      background: #f0f0f0;
      color: #333;
    }

    .btn-modal-secondary:hover {
      background: #e0e0e0;
    }

    /* My Bookings Section */
    .my-bookings-section {
      margin-top: 50px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .section-header h2 {
      font-size: 28px;
      color: #333;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    .sort-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      background: white;
      padding: 8px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .sort-label {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      white-space: nowrap;
    }

    .sort-select {
      padding: 8px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      outline: none;
    }

    .sort-select:hover {
      border-color: #667eea;
    }

    .sort-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .btn-refresh {
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-refresh:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-refresh:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
      font-size: 18px;
      color: #666;
    }

    .no-bookings {
      text-align: center;
      padding: 60px 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }

    .no-bookings h3 {
      font-size: 24px;
      color: #333;
      margin-bottom: 10px;
    }

    .no-bookings p {
      font-size: 16px;
      color: #666;
      margin-bottom: 25px;
    }

    .btn-book-now {
      padding: 12px 30px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-book-now:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .bookings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }

    .booking-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .booking-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border-color: #667eea;
    }

    .booking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
    }

    .booking-ref {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .ref-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
    }

    .ref-value {
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }

    .booking-status {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-confirmed {
      background: #d4edda;
      color: #155724;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .status-completed {
      background: #d1ecf1;
      color: #0c5460;
    }

    .booking-hotel h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #333;
    }

    .hotel-location {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .distance-section {
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .distance-display {
      flex: 1;
    }

    .distance-badge {
      display: inline-block;
      padding: 6px 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .distance-input-group {
      display: flex;
      gap: 8px;
      align-items: center;
      flex: 1;
    }

    .distance-input {
      flex: 1;
      padding: 8px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      outline: none;
      transition: all 0.3s ease;
      min-width: 100px;
    }

    .distance-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .btn-save-distance {
      padding: 8px 12px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-save-distance:hover {
      background: #218838;
      transform: scale(1.1);
    }

    .btn-edit-distance {
      padding: 6px 12px;
      background: #ffc107;
      color: #333;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-edit-distance:hover {
      background: #e0a800;
      transform: translateY(-2px);
    }

    .booking-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .detail-item .icon {
      font-size: 24px;
    }

    .detail-label {
      margin: 0;
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
    }

    .detail-value {
      margin: 3px 0 0 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .booking-guest {
      margin: 15px 0;
      padding: 12px;
      background: #f0f8ff;
      border-radius: 6px;
    }

    .booking-guest p {
      margin: 5px 0;
      font-size: 13px;
      color: #333;
    }

    .booking-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #f0f0f0;
      gap: 15px;
    }

    .booking-price {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .price-label {
      font-size: 12px;
      color: #999;
    }

    .price-value {
      font-size: 24px;
      font-weight: 700;
      color: #28a745;
    }

    .discount {
      font-size: 12px;
      color: #ff9800;
      font-weight: 600;
    }

    .booking-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn-view, .btn-cancel, .btn-download {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-download {
      background: #17a2b8;
      color: white;
    }

    .btn-download:hover {
      background: #138496;
      transform: translateY(-2px);
    }

    .btn-view {
      background: #667eea;
      color: white;
    }

    .btn-view:hover {
      background: #5568d3;
    }

    .btn-cancel {
      background: #f8d7da;
      color: #721c24;
    }

    .btn-cancel:hover {
      background: #f5c6cb;
    }

    /* Detail Modal Specific Styles */
    .detail-modal-content {
      max-width: 700px;
    }

    .status-banner {
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
    }

    .status-banner.status-confirmed {
      background: #d4edda;
      color: #155724;
    }

    .status-banner.status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-banner.status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .total-row {
      border-top: 2px solid #f0f0f0;
      padding-top: 15px;
      margin-top: 10px;
    }

    .id-proof-status {
      padding: 15px;
      background: #d4edda;
      border-radius: 8px;
      margin-top: 10px;
    }

    .id-uploaded {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .check-icon {
      width: 40px;
      height: 40px;
      background: #28a745;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
    }

    .id-label {
      margin: 0;
      font-weight: 600;
      color: #155724;
      font-size: 15px;
    }

    .id-filename {
      margin: 5px 0 0 0;
      font-size: 13px;
      color: #155724;
    }

    .id-date {
      margin: 3px 0 0 0;
      font-size: 12px;
      color: #155724;
      opacity: 0.8;
    }

    .id-upload-section {
      padding: 20px;
      border: 2px dashed #ddd;
      border-radius: 8px;
      text-align: center;
      margin-top: 10px;
      background: #f8f9fa;
    }

    .upload-instruction {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #666;
    }

    .btn-upload {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-upload:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-upload:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    /* Meal Plan Styles */
    .meal-subtitle {
      font-size: 13px;
      color: #666;
      font-style: italic;
      margin: 5px 0 15px 0;
    }

    .meal-status {
      padding: 15px;
      background: #d4edda;
      border-radius: 8px;
      margin-top: 10px;
    }

    .meal-selected {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .meal-icon {
      width: 40px;
      height: 40px;
      background: #28a745;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
    }

    .meal-label {
      margin: 0;
      font-weight: 600;
      color: #155724;
      font-size: 15px;
    }

    .meal-choice {
      margin: 5px 0 0 0;
      font-size: 14px;
      color: #155724;
      font-weight: 600;
    }

    .meal-date {
      margin: 3px 0 0 0;
      font-size: 12px;
      color: #155724;
      opacity: 0.8;
    }

    .meal-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .meal-card {
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      text-align: center;
      position: relative;
    }

    .meal-card:hover {
      transform: translateY(-5px);
      border-color: #667eea;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .meal-emoji {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .meal-card h5 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #333;
      font-weight: 700;
    }

    .meal-card p {
      margin: 0 0 10px 0;
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }

    .meal-tag {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(102, 126, 234, 0.2);
      color: #667eea;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .meal-note {
      margin-top: 15px;
      padding: 12px;
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 6px;
      font-size: 13px;
      color: #856404;
    }

    .meal-note strong {
      color: #856404;
    }

    .request-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 12px;
      gap: 15px;
    }

    .request-info {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
    }

    .request-icon {
      font-size: 28px;
    }

    .request-title {
      margin: 0 0 5px 0;
      font-weight: 600;
      font-size: 15px;
      color: #333;
    }

    .request-desc {
      margin: 0;
      font-size: 13px;
      color: #666;
    }

    .request-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 5px;
    }

    .status-badge {
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-requested {
      background: #fff3cd;
      color: #856404;
    }

    .status-approved {
      background: #d4edda;
      color: #155724;
    }

    .status-rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .request-date {
      margin: 0;
      font-size: 11px;
      color: #999;
    }

    .btn-request {
      padding: 8px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .btn-request:hover:not(:disabled) {
      background: #5568d3;
    }

    .btn-request:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .success-content {
        flex-direction: column;
        padding: 20px;
      }

      .success-icon {
        font-size: 48px;
      }

      .success-actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .flow-steps {
        flex-direction: column;
      }

      .step-arrow {
        transform: rotate(90deg);
      }

      .modal-content {
        width: 95%;
        max-height: 95vh;
      }

      .modal-footer {
        flex-direction: column;
      }

      .btn-modal-primary, .btn-modal-secondary {
        width: 100%;
      }

      .bookings-grid {
        grid-template-columns: 1fr;
      }

      .booking-details {
        grid-template-columns: 1fr;
      }

      .booking-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .booking-actions {
        width: 100%;
      }

      .btn-view, .btn-cancel, .btn-download {
        flex: 1;
      }

      .detail-modal-content {
        max-width: 95%;
      }

      .request-item {
        flex-direction: column;
        align-items: stretch;
      }

      .request-status {
        align-items: flex-start;
      }

      .btn-request {
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  
  // Payment success state
  paymentSuccess = false;
  successBookingId: number | null = null;
  successAmount: number = 0;
  successSavings: number = 0;
  bookingDetails: any = null;

  // Modal state
  showBookingModal = false;
  showDetailModal = false;

  // Request states
  uploadingId = false;
  requestingCheckout = false;
  requestingCheckin = false;
  requestingUpgrade = false;

  // Bookings data
  bookings: Booking[] = [];
  loadingBookings = false;
  selectedBooking: Booking | null = null;

  // Sort and distance management
  sortOption: string = 'default';
  editingDistance: number | null = null;
  tempDistance: { [key: number]: number } = {};

  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state;
      if (state['paymentSuccess']) {
        this.paymentSuccess = true;
        this.successBookingId = state['bookingId'];
        this.successAmount = state['amount'];
        this.successSavings = state['savings'] || 0;
        this.bookingDetails = state['bookingDetails'];
      }
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    
    this.loadMyBookings();
  }

  loadMyBookings(): void {
    this.loadingBookings = true;
    this.http.get<any[]>(`${this.apiUrl}/my-bookings`).subscribe({
      next: (data) => {
        console.log('=== RAW API RESPONSE ===');
        console.log('Full data:', JSON.stringify(data, null, 2));
        
        this.bookings = (data || []).map(booking => {
          console.log('--- Processing booking ID:', booking.id);
          
          // Try to get hotel data from sessionStorage (stored during booking)
          let hotelData = this.getStoredHotelInfo(booking.id, booking.bookingReference);
          
          // Handle prices correctly:
          // YOUR BACKEND STRUCTURE:
          // totalPrice = base room price (e.g., 8500)
          // taxAmount = tax on the price (e.g., 1020)
          // finalPrice = total customer pays = totalPrice + taxAmount (e.g., 9520)
          // discountAmount = any discount applied
          
          let basePrice = booking.totalPrice || 0;
          let taxAmount = booking.taxAmount || 0;
          let customerPays = booking.finalPrice || 0;
          let discount = booking.discountAmount || 0;
          
          // If finalPrice is not set, calculate it
          if (customerPays === 0 && basePrice > 0) {
            customerPays = basePrice + taxAmount;
          }
          
          console.log('Price breakdown:', { 
            basePrice, 
            taxAmount, 
            customerPays, 
            discount 
          });
          
          // Get stored distance from sessionStorage
          const storedDistance = this.getStoredDistance(booking.id);
          
          return {
            id: booking.id || booking.bookingId,
            bookingReference: booking.bookingReference || `BK-${booking.id}`,
            checkInDate: booking.checkInDate || booking.checkIn,
            checkOutDate: booking.checkOutDate || booking.checkOut,
            totalGuests: booking.totalGuests || booking.guests || 1,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            status: booking.status || 'PENDING',
            totalPrice: basePrice + taxAmount,  // Show total with tax
            finalPrice: customerPays,           // Amount customer actually paid
            discountAmount: discount,
            distance: storedDistance,
            hotel: hotelData
          };
        });
        
        console.log('=== TRANSFORMED BOOKINGS ===');
        console.log(JSON.stringify(this.bookings, null, 2));
        
        // Apply sorting based on current sort option
        this.sortBookings();
        
        this.loadingBookings = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.bookings = [];
        this.loadingBookings = false;
      }
    });
  }

  // Helper method to get stored hotel info
  private getStoredHotelInfo(bookingId: number, bookingReference: string): { name: string, city: string } {
    try {
      // First try sessionStorage
      const storageKey = `booking_hotel_${bookingId}`;
      const data = sessionStorage.getItem(storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error retrieving hotel info from storage:', error);
    }
    
    // Fallback for bookings without stored hotel info
    return { 
      name: 'Hotel Info Not Available', 
      city: 'Please update backend or store during booking' 
    };
  }

  // Call this method when a booking is created (add to your booking creation flow)
  storeHotelInfoForBooking(bookingId: number, hotelName: string, hotelCity: string): void {
    try {
      const storageKey = `booking_hotel_${bookingId}`;
      const hotelData = { name: hotelName, city: hotelCity };
      sessionStorage.setItem(storageKey, JSON.stringify(hotelData));
      console.log('✅ Stored hotel info for booking:', bookingId, hotelData);
    } catch (error) {
      console.error('Error storing hotel info:', error);
    }
  }

  viewBookingDetail(booking: Booking): void {
    this.selectedBooking = booking;
    this.showDetailModal = true;
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  downloadBookingPDF(booking: Booking): void {
    const nights = this.calculateNights(booking.checkInDate, booking.checkOutDate);
    const pdfContent = this.generatePDFContent(booking, nights);
    
    // NOTE: This is in-memory storage only. Data will be lost on page refresh.
    // For persistent storage, implement a backend solution.
    const pdfData = {
      bookingId: booking.id,
      generatedAt: new Date().toISOString(),
      content: pdfContent
    };
    
    // Create and download the file
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Booking_${booking.id}_${booking.hotel.name.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    alert(`✅ Booking document downloaded successfully!\n\nFile: Booking_${booking.id}_${booking.hotel.name.replace(/\s/g, '_')}.txt`);
  }

  generatePDFContent(booking: Booking, nights: number): string {
    return `
╔══════════════════════════════════════════════════════╗
║          HOTEL BOOKING CONFIRMATION                  ║
╚══════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 BOOKING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking ID:        #${booking.id}
Booking Reference: ${booking.bookingReference}
Booking Status:    ${booking.status}
Booking Date:      ${new Date().toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏨 HOTEL DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hotel Name:        ${booking.hotel.name}
Location:          ${booking.hotel.city}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 GUEST INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Guest Name:        ${booking.guestName}
Email:             ${booking.guestEmail}
Total Guests:      ${booking.totalGuests}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 STAY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Check-in Date:     ${new Date(booking.checkInDate).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    })}
    
Check-out Date:    ${new Date(booking.checkOutDate).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    })}
    
Duration:          ${nights} night(s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 PAYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Original Price:    ₹${booking.totalPrice.toFixed(2)}
${booking.discountAmount > 0 ? `Discount Applied:  -₹${booking.discountAmount.toFixed(2)}` : ''}
${booking.discountAmount > 0 ? '─────────────────────────────────' : ''}
Final Amount Paid: ₹${booking.finalPrice.toFixed(2)}

Payment Status:    ✓ PAID

${booking.discountAmount > 0 ? `\n🎉 You saved ₹${booking.discountAmount.toFixed(2)} on this booking!\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 IMPORTANT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Please carry a valid ID proof at the time of check-in
✓ Check-in time: 2:00 PM | Check-out time: 11:00 AM
✓ Early check-in/late check-out subject to availability
✓ For any modifications, please contact the hotel directly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For any queries or assistance, please contact:
Hotel: ${booking.hotel.name}
Email: ${booking.guestEmail}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for choosing our service!
We wish you a pleasant stay!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated on: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }

  cancelBooking(bookingId: number): void {
    if (confirm('⚠️ Are you sure you want to cancel this booking?\n\nThis action cannot be undone.')) {
      this.http.put(`${this.apiUrl}/${bookingId}/cancel`, {}).subscribe({
        next: (response) => {
          alert('✅ Booking cancelled successfully!\n\nYour refund will be processed within 5-7 business days.');
          this.loadMyBookings();
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          alert('❌ Failed to cancel booking.\n\nPlease try again or contact support.');
        }
      });
    }
  }

  bookHotel(): void {
    this.router.navigate(['/booking-flow']);
  }

  handleMyBookingsClick(): void {
    if (this.successBookingId && this.bookingDetails) {
      this.viewBookingDetails();
    } else {
      const bookingsSection = document.querySelector('.my-bookings-section');
      if (bookingsSection) {
        bookingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  viewMyBookings(): void {
    const bookingsSection = document.querySelector('.my-bookings-section');
    if (bookingsSection) {
      bookingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goToMyBookings(): void {
    this.closeBookingModal();
    this.viewMyBookings();
  }

  viewBookingDetails(): void {
    this.showBookingModal = true;
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
  }

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }

  dismissSuccess(): void {
    this.paymentSuccess = false;
    this.successBookingId = null;
    this.successAmount = 0;
    this.successSavings = 0;
    this.bookingDetails = null;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedBooking = null;
  }

  // ID Proof Management
  handleIdUpload(event: any, bookingId: number): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File size too large! Please upload a file smaller than 5MB.');
      event.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('❌ Invalid file type! Please upload a JPG, PNG, or PDF file.');
      event.target.value = '';
      return;
    }

    this.uploadingId = true;

    // For large files, don't convert to base64, just store metadata
    const idProofData = {
      bookingId: bookingId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    // Store in memory (simplified - no base64 conversion)
    const storageKey = `id_proof_${bookingId}`;
    try {
      // Use sessionStorage as fallback (data will persist during session but lost on refresh)
      sessionStorage.setItem(storageKey, JSON.stringify(idProofData));
      
      this.uploadingId = false;
      alert('✅ ID Proof uploaded successfully!\n\nFile: ' + file.name);
      
      // Clear file input
      event.target.value = '';
      
      // Force update the view
      if (this.selectedBooking && this.selectedBooking.id === bookingId) {
        // Trigger change detection
        this.showDetailModal = false;
        setTimeout(() => {
          this.showDetailModal = true;
        }, 0);
      }
    } catch (error) {
      console.error('Error storing ID proof:', error);
      this.uploadingId = false;
      event.target.value = '';
      alert('❌ Failed to upload ID proof. Please try again.');
    }
  }

  getIdProof(bookingId: number): any {
    const storageKey = `id_proof_${bookingId}`;
    try {
      const data = sessionStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving ID proof:', error);
      return null;
    }
  }

  // Special Requests Management
  requestEarlyCheckin(bookingId: number): void {
    if (confirm('🌅 Request Early Check-in?\n\nWe will contact the hotel and notify you via email once confirmed.\n\n(They might say no, but at least we tried)')) {
      this.requestingCheckin = true;
      
      setTimeout(() => {
        const requestData = {
          bookingId: bookingId,
          type: 'earlyCheckin',
          status: 'REQUESTED',
          requestedAt: new Date().toISOString()
        };

        const storageKey = `request_${bookingId}_earlyCheckin`;
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(requestData));
          
          this.requestingCheckin = false;
          alert('✅ Early check-in request submitted!\n\nYou will be notified via email once the hotel confirms.\n\nPro tip: They usually say yes if you smile enough.');
          
          // Force update the view
          if (this.selectedBooking && this.selectedBooking.id === bookingId) {
            this.showDetailModal = false;
            setTimeout(() => {
              this.showDetailModal = true;
            }, 0);
          }
        } catch (error) {
          console.error('Error saving request:', error);
          this.requestingCheckin = false;
          alert('❌ Failed to submit request. Please try again.');
        }
      }, 500);
    }
  }

  requestLateCheckout(bookingId: number): void {
    if (confirm('🌆 Request Late Check-out?\n\nWe will contact the hotel and notify you via email once confirmed.\n\n(Warning: May result in extra charges. Hotels love money.)')) {
      this.requestingCheckout = true;
      
      setTimeout(() => {
        const requestData = {
          bookingId: bookingId,
          type: 'lateCheckout',
          status: 'REQUESTED',
          requestedAt: new Date().toISOString()
        };

        const storageKey = `request_${bookingId}_lateCheckout`;
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(requestData));
          
          this.requestingCheckout = false;
          alert('✅ Late check-out request submitted!\n\nYou will be notified via email once the hotel confirms.\n\nExpect some negotiation. They own the clocks, not you.');
          
          // Force update the view
          if (this.selectedBooking && this.selectedBooking.id === bookingId) {
            this.showDetailModal = false;
            setTimeout(() => {
              this.showDetailModal = true;
            }, 0);
          }
        } catch (error) {
          console.error('Error saving request:', error);
          this.requestingCheckout = false;
          alert('❌ Failed to submit request. Please try again.');
        }
      }, 500);
    }
  }

  requestRoomUpgrade(bookingId: number): void {
    if (confirm('⭐ Request Room Upgrade?\n\nWe will check availability and notify you via email with upgrade options and pricing.\n\n(Spoiler: It will cost extra. This isn\'t a charity.)')) {
      this.requestingUpgrade = true;
      
      setTimeout(() => {
        const requestData = {
          bookingId: bookingId,
          type: 'roomUpgrade',
          status: 'REQUESTED',
          requestedAt: new Date().toISOString()
        };

        const storageKey = `request_${bookingId}_roomUpgrade`;
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(requestData));
          
          this.requestingUpgrade = false;
          alert('✅ Room upgrade request submitted!\n\nYou will be notified via email with available upgrade options and pricing.\n\nRemember: The penthouse suite is probably already taken by someone richer than you.');
          
          // Force update the view
          if (this.selectedBooking && this.selectedBooking.id === bookingId) {
            this.showDetailModal = false;
            setTimeout(() => {
              this.showDetailModal = true;
            }, 0);
          }
        } catch (error) {
          console.error('Error saving request:', error);
          this.requestingUpgrade = false;
          alert('❌ Failed to submit request. Please try again.');
        }
      }, 500);
    }
  }

  getRequest(bookingId: number, type: string): any {
    const storageKey = `request_${bookingId}_${type}`;
    try {
      const data = sessionStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving request:', error);
      return null;
    }
  }

  // Meal Plan Management
  selectMealPlan(bookingId: number, plan: string): void {
    const mealData = {
      bookingId: bookingId,
      plan: plan,
      selectedAt: new Date().toISOString()
    };

    const storageKey = `meal_plan_${bookingId}`;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(mealData));
      
      let message = '✅ Meal plan selected successfully!\n\n';
      
      if (plan === 'Chicken Biryani Bonanza') {
        message += 'Excellent choice! Your taste buds will thank you.\n\nNote: May cause food coma. Worth it. 🍗';
      } else if (plan === 'Protein-Less Veg Paradise') {
        message += 'Living that green life, huh?\n\nRemember: Protein is overrated anyway. Said no one ever. 🥗';
      } else if (plan === 'Snack Attack Supreme') {
        message += 'Who needs real meals when you have snacks?\n\nYour nutritionist is crying somewhere. 🍿';
      } else if (plan === "I will Order From Swiggy") {
        message += 'Bold move! Why use included meals when you can pay extra?\n\nWe respect your commitment to supporting the gig economy. 📱💸';
      }
      
      alert(message);
      
      // Force update the view
      if (this.selectedBooking && this.selectedBooking.id === bookingId) {
        this.showDetailModal = false;
        setTimeout(() => {
          this.showDetailModal = true;
        }, 0);
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('❌ Failed to save meal plan. Try again, or just starve. Your choice.');
    }
  }

  getMealPlan(bookingId: number): any {
    const storageKey = `meal_plan_${bookingId}`;
    try {
      const data = sessionStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving meal plan:', error);
      return null;
    }
  }

  // Distance Management
  saveDistance(bookingId: number, distance: number): void {
    const distanceNum = typeof distance === 'number' ? distance : parseFloat(String(distance));
    
    if (isNaN(distanceNum) || distanceNum < 0) {
      alert('❌ Please enter a valid distance!\n\n(Negative distances only work in science fiction)');
      return;
    }

    try {
      const storageKey = `booking_distance_${bookingId}`;
      sessionStorage.setItem(storageKey, distanceNum.toString());
      
      // Update the booking in the array
      const booking = this.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.distance = distanceNum;
      }
      
      this.editingDistance = null;
      this.tempDistance[bookingId] = distanceNum;
      
      // Re-sort if distance sorting is active
      if (this.sortOption === 'distance') {
        this.sortBookings();
      }
      
      alert(`✅ Distance saved: ${distanceNum} km\n\n(Hope you measured correctly, we're trusting you here)`);
    } catch (error) {
      console.error('Error saving distance:', error);
      alert('❌ Failed to save distance. Try again!');
    }
  }

  getStoredDistance(bookingId: number): number | undefined {
    try {
      const storageKey = `booking_distance_${bookingId}`;
      const data = sessionStorage.getItem(storageKey);
      return data ? parseFloat(data) : undefined;
    } catch (error) {
      console.error('Error retrieving distance:', error);
      return undefined;
    }
  }
alertRefundPolicy(): void {
  alert(`
Refund Policy 📜

• Cancel more than 7 days before check-in → Full Refund (100%)
• Cancel 3–7 days before check-in → 50% Refund
• Cancel less than 3 days before check-in → No Refund

(Note: Refunds processed within 5–7 business days. Hotel policies may vary slightly.)
  `);
}
  sortBookings(): void {
    if (!this.bookings || this.bookings.length === 0) return;

    switch (this.sortOption) {
           case 'distance':
        // Sort by distance - bookings without distance go to the end
        this.bookings.sort((a, b) => {
          const distanceA = (a.distance !== undefined && a.distance !== null) ? a.distance : Number.MAX_VALUE;
          const distanceB = (b.distance !== undefined && b.distance !== null) ? b.distance : Number.MAX_VALUE;
          return distanceA - distanceB;
        });
        break;

      case 'date':
        // Sort by check-in date
        this.bookings.sort((a, b) => {
          return new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
        });
        break;

      case 'price':
        // Sort by price (low to high)
        this.bookings.sort((a, b) => {
          return a.finalPrice - b.finalPrice;
        });
        break;

      case 'default':
      default:
        // Sort by booking ID (descending - newest first)
        this.bookings.sort((a, b) => b.id - a.id);
        break;
    }

    console.log(`Sorted bookings by: ${this.sortOption}`, this.bookings);
  }
}