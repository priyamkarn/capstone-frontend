import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/model';

// Update your Booking interface at the top of dashboard.component.ts
interface Booking {
  id: number;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  guestName: string;
  guestEmail: string;
  status: string;  // Make this required, set default value
  totalPrice: number;
  finalPrice: number;
  discountAmount: number;
  hotel: {  // Make this required, not optional
    name: string;
    city: string;
  };
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
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
          <button class="btn-refresh" (click)="loadMyBookings()" [disabled]="loadingBookings">
            {{ loadingBookings ? '⏳ Loading...' : '🔄 Refresh' }}
          </button>
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
    }

    .section-header h2 {
      font-size: 28px;
      color: #333;
      margin: 0;
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
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn-view, .btn-cancel {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
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

      .btn-view, .btn-cancel {
        flex: 1;
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

  // Bookings data
  bookings: Booking[] = [];
  loadingBookings = false;
  selectedBooking: Booking | null = null;

  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Check for payment success state from navigation
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
    
    // Load bookings on init
    this.loadMyBookings();
  }
loadMyBookings(): void {
  this.loadingBookings = true;
  this.http.get<Booking[]>(`${this.apiUrl}/my-bookings`).subscribe({
    next: (data) => {
      console.log('Loaded bookings:', data);
      // Transform data to ensure all fields exist
      this.bookings = (data || []).map(booking => ({
        ...booking,
        status: booking.status || 'PENDING',
        hotel: booking.hotel || { name: 'Hotel Name Unavailable', city: 'Location Unavailable' },
        finalPrice: booking.finalPrice || booking.totalPrice || 0,
        discountAmount: booking.discountAmount || 0
      }));
      this.loadingBookings = false;
    },
    error: (error) => {
      console.error('Error loading bookings:', error);
      this.bookings = [];
      this.loadingBookings = false;
    }
  });
}

  viewBookingDetail(booking: Booking): void {
    this.selectedBooking = booking;
    // You can open a modal or navigate to detail page
    alert(`Viewing details for Booking #${booking.id}\n\nHotel: ${booking.hotel.name}\nStatus: ${booking.status}\nTotal: ₹${booking.finalPrice}`);
  }

  cancelBooking(bookingId: number): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.http.put(`${this.apiUrl}/${bookingId}/cancel`, {}).subscribe({
        next: (response) => {
          alert('Booking cancelled successfully!');
          this.loadMyBookings(); // Reload bookings
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          alert('Failed to cancel booking. Please try again.');
        }
      });
    }
  }

  bookHotel(): void {
    this.router.navigate(['/booking-flow']);
  }

  handleMyBookingsClick(): void {
    // If we have a recent successful booking, show its details
    if (this.successBookingId && this.bookingDetails) {
      this.viewBookingDetails();
    } else {
      // Scroll to bookings section
      const bookingsSection = document.querySelector('.my-bookings-section');
      if (bookingsSection) {
        bookingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  viewMyBookings(): void {
    // Scroll to bookings section
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
    console.log('viewBookingDetails called');
    console.log('Booking details:', this.bookingDetails);
    console.log('Booking ID:', this.successBookingId);
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
  getStatusClass(status: string | undefined): string {
  return status ? status.toLowerCase() : 'pending';
}

getHotelName(booking: Booking): string {
  return booking.hotel?.name || 'Hotel Name Unavailable';
}

getHotelCity(booking: Booking): string {
  return booking.hotel?.city || 'Location Unavailable';
}

getFinalPrice(booking: Booking): number {
  return booking.finalPrice || booking.totalPrice || 0;
}
}