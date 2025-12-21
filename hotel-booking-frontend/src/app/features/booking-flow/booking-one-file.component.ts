// src/app/features/booking-flow/booking-one-file.component.ts
import { Component, NgZone, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

const BACKEND_URL = 'http://localhost:8080';

interface PromoCode {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minBookingAmount: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  description?: string;
}

@Component({
  selector: 'app-booking-one-file',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flow-container">
      <h1>Quick Booking Flow</h1>

      <div class="steps">
        <div [class.active]="step === 0">0. Create Hotel</div>
        <div [class.active]="step === 1">1. Create Room</div>
        <div [class.active]="step === 2">2. Booking Details</div>
        <div [class.active]="step === 3">3. Confirm & Pay</div>
        <div [class.active]="step === 4">4. Payment</div>
      </div>

      <div class="debug-info">Current Step: {{ step }} | Hotel ID: {{ hotelId }} | Room ID: {{ roomId }} | Booking ID: {{ bookingId }}</div>

      <!-- STEP 0: CREATE / SELECT HOTEL -->
      <ng-container *ngIf="step === 0">
        <div class="card">
          <h2>Create or Select Hotel</h2>
          <p class="info">
            You need a Hotel ID to create rooms. Use an existing Hotel ID or create a new hotel.
          </p>
          
          <div class="warning-box">
            ⚠️ <strong>Note:</strong> Creating hotels requires ADMIN role. If you see a 403 error, please use an existing Hotel ID or login as admin.
          </div>

          <label>Use existing Hotel ID</label>
          <input
            type="number"
            [(ngModel)]="existingHotelId"
            placeholder="Enter existing hotel ID (e.g., 6)"
          />

          <div class="divider"><span>OR</span></div>

          <h3>Create a new Hotel</h3>

          <label>Hotel Name *</label>
          <input
            type="text"
            [(ngModel)]="hotelForm.name"
            placeholder="Sunrise Palace"
          />

          <label>Description</label>
          <textarea
            rows="2"
            [(ngModel)]="hotelForm.description"
            placeholder="Luxury hotel in the city center">
          </textarea>

          <div class="grid-2">
            <div>
              <label>City *</label>
              <input
                type="text"
                [(ngModel)]="hotelForm.city"
                placeholder="Bengaluru"
              />
            </div>
            <div>
              <label>Landmark</label>
              <input
                type="text"
                [(ngModel)]="hotelForm.landmark"
                placeholder="MG Road"
              />
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label>Pin Code *</label>
              <input
                type="text"
                [(ngModel)]="hotelForm.pinCode"
                placeholder="560001"
                maxlength="6"
              />
            </div>
            <div>
              <label>Star Rating</label>
              <select [(ngModel)]="hotelForm.starRating">
                <option value="1">1 Star</option>
                <option value="2">2 Star</option>
                <option value="3">3 Star</option>
                <option value="4">4 Star</option>
                <option value="5">5 Star</option>
              </select>
            </div>
          </div>

          <label>Address *</label>
          <textarea
            rows="2"
            [(ngModel)]="hotelForm.address"
            placeholder="123 MG Road, Bengaluru">
          </textarea>

          <div class="grid-2">
            <div>
              <label>Latitude</label>
              <input
                type="number"
                [(ngModel)]="hotelForm.latitude"
                step="0.0001"
                placeholder="12.9716"
              />
            </div>
            <div>
              <label>Longitude</label>
              <input
                type="number"
                [(ngModel)]="hotelForm.longitude"
                step="0.0001"
                placeholder="77.5946"
              />
            </div>
          </div>

          <label>Property Type</label>
          <select [(ngModel)]="hotelForm.propertyType">
            <option value="HOTEL">Hotel</option>
            <option value="RESORT">Resort</option>
            <option value="VILLA">Villa</option>
            <option value="APARTMENT">Apartment</option>
          </select>

          <div class="grid-2">
            <div>
              <label>Check-in Time</label>
              <input
                type="time"
                [(ngModel)]="hotelForm.checkInTime"
              />
            </div>
            <div>
              <label>Check-out Time</label>
              <input
                type="time"
                [(ngModel)]="hotelForm.checkOutTime"
              />
            </div>
          </div>

          <label>Policies</label>
          <textarea
            rows="2"
            [(ngModel)]="hotelForm.policies"
            placeholder="Free cancellation up to 24 hours before check-in">
          </textarea>

          <div class="grid-2">
            <div>
              <label>Contact Phone *</label>
              <input
                type="tel"
                [(ngModel)]="hotelForm.contactPhone"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label>Contact Email *</label>
              <input
                type="email"
                [(ngModel)]="hotelForm.contactEmail"
                placeholder="info@hotel.com"
              />
            </div>
          </div>

          <label>Amenities (comma separated)</label>
          <input
            type="text"
            [(ngModel)]="hotelAmenitiesInput"
            placeholder="Free WiFi, Parking, Swimming Pool"
          />

          <label>Photo URLs (comma separated)</label>
          <input
            type="text"
            [(ngModel)]="hotelPhotosInput"
            placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
          />

          <div *ngIf="errorMessage" class="error-box">{{ errorMessage }}</div>

          <button
            class="btn-primary"
            (click)="goToRoomStep()"
            [disabled]="loading"
          >
            {{ loading ? 'Creating hotel...' : 'Continue →' }}
          </button>
        </div>
      </ng-container>

      <!-- STEP 1: CREATE / SELECT ROOM -->
      <ng-container *ngIf="step === 1">
        <div class="card">
          <h2>Create Room (required)</h2>
          <p class="info">
            Using Hotel ID: <strong>{{ hotelId }}</strong>. You can use an existing Room ID or create a new one.
          </p>

          <label>Use existing Room ID</label>
          <input
            type="number"
            [(ngModel)]="existingRoomId"
            placeholder="Enter existing room ID (optional)"
          />

          <div class="divider"><span>OR</span></div>

          <h3>Create a new Room</h3>

          <label>Room Type *</label>
          <input
            type="text"
            [(ngModel)]="roomForm.roomType"
            placeholder="Deluxe, Standard, Suite"
          />

          <label>Price Per Night *</label>
          <input
            type="number"
            [(ngModel)]="roomForm.pricePerNight"
            min="1"
          />

          <label>Max Occupancy</label>
          <input
            type="number"
            [(ngModel)]="roomForm.maxOccupancy"
            min="1"
          />

          <label>Total Rooms</label>
          <input
            type="number"
            [(ngModel)]="roomForm.totalRooms"
            min="1"
          />

          <label>Description</label>
          <textarea
            rows="2"
            [(ngModel)]="roomForm.description">
          </textarea>

          <label>Bed Type</label>
          <input
            type="text"
            [(ngModel)]="roomForm.bedType"
            placeholder="Standard / Queen / King"
          />

          <label>Bed Size</label>
          <input
            type="number"
            [(ngModel)]="roomForm.bedSize"
            min="1"
            step="0.5"
          />

          <div *ngIf="errorMessage" class="error-box">{{ errorMessage }}</div>

          <div class="actions-row">
            <button class="btn-secondary" (click)="step = 0">← Back to Hotel</button>
            <button
              class="btn-primary"
              (click)="goToBookingStep()"
              [disabled]="loading"
            >
              {{ loading ? 'Creating room...' : 'Continue →' }}
            </button>
          </div>
        </div>
      </ng-container>

      <!-- STEP 2: BOOKING DETAILS -->
      <ng-container *ngIf="step === 2">
        <div class="card">
          <h2>Booking Details</h2>

          <p class="info" *ngIf="roomId">
            Using Room ID: <strong>{{ roomId }}</strong>
          </p>

          <div class="grid-2">
            <div>
              <label>Check-in Date *</label>
              <input
                type="date"
                [(ngModel)]="bookingForm.checkInDate"
                (change)="recalculate()"
              />

              <label>Check-out Date *</label>
              <input
                type="date"
                [(ngModel)]="bookingForm.checkOutDate"
                (change)="recalculate()"
              />
            </div>

            <div>
              <label>Total Guests *</label>
              <input
                type="number"
                [(ngModel)]="bookingForm.totalGuests"
                min="1"
              />

              <label>Number of Rooms *</label>
              <input
                type="number"
                [(ngModel)]="numberOfRooms"
                min="1"
                (change)="recalculate()"
              />
            </div>
          </div>

          <label>Guest Name *</label>
          <input
            type="text"
            [(ngModel)]="bookingForm.guestName"
          />

          <label>Email *</label>
          <input
            type="email"
            [(ngModel)]="bookingForm.guestEmail"
          />

          <label>Phone *</label>
          <input
            type="tel"
            [(ngModel)]="bookingForm.guestPhone"
          />

          <label>Emergency Contact</label>
          <input
            type="tel"
            [(ngModel)]="bookingForm.emergencyContact"
          />

          <label>GST Number (optional)</label>
          <input
            type="text"
            [(ngModel)]="bookingForm.gstNumber"
          />

          <label>Special Requests</label>
          <textarea
            rows="3"
            [(ngModel)]="bookingForm.specialRequests">
          </textarea>

          <!-- Promo Code Section -->
          <div class="promo-section">
            <h3>🎁 Have a Promo Code?</h3>
            
            <div class="promo-input-group">
              <input
                type="text"
                [(ngModel)]="promoCodeInput"
                placeholder="Enter promo code"
                [disabled]="promoApplied"
                class="promo-input"
              />
              <button
                *ngIf="!promoApplied"
                (click)="validatePromoCode()"
                [disabled]="!promoCodeInput || loadingPromo"
                class="btn-apply-promo"
              >
                {{ loadingPromo ? 'Checking...' : 'Apply' }}
              </button>
              <button
                *ngIf="promoApplied"
                (click)="removePromoCode()"
                class="btn-remove-promo"
              >
                ✕ Remove
              </button>
            </div>

            <div *ngIf="promoError" class="promo-error">
              ❌ {{ promoError }}
            </div>

            <div *ngIf="promoApplied && appliedPromo" class="promo-success">
              ✅ Promo code <strong>{{ appliedPromo.code }}</strong> applied!
              <p class="promo-desc" *ngIf="appliedPromo.description">{{ appliedPromo.description }}</p>
            </div>

            <!-- Available Promo Codes -->
            <div class="available-promos" *ngIf="!promoApplied && activePromoCodes.length > 0">
              <p class="promo-label">Available offers:</p>
              <div class="promo-chips">
                <button
                  *ngFor="let promo of activePromoCodes"
                  (click)="applyPromoFromList(promo)"
                  class="promo-chip"
                  [title]="promo.description || ''"
                >
                  <span class="promo-chip-code">{{ promo.code }}</span>
                  <span class="promo-chip-value">
                    {{ promo.discountType === 'PERCENTAGE' ? promo.discountValue + '%' : '₹' + promo.discountValue }} OFF
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div class="price-box">
            <p>Nights: {{ numberOfNights }}</p>
            <p>Room total: ₹{{ roomTotal }}</p>
            <p *ngIf="discountAmount > 0" class="discount-line">
              Promo discount: <span class="discount-amount">-₹{{ discountAmount }}</span>
            </p>
            <p>Tax (12%): ₹{{ taxAmount }}</p>
            <p class="total">Total: ₹{{ finalAmount }}</p>
            <p *ngIf="discountAmount > 0" class="savings">You save ₹{{ discountAmount }}! 🎉</p>
          </div>

          <!-- Cancellation Policy -->
          <div class="cancellation-policy">
            <h3>📋 Cancellation Policy</h3>
            <p class="policy-text">
              <strong>Free cancellation</strong> if you cancel more than 7 days before check-in.
              Fees apply for cancellations within 7 days:
            </p>
            <ul class="policy-list">
              <li>4-7 days before: 25% fee</li>
              <li>2-3 days before: 50% fee</li>
              <li>Within 1 day: 75% fee</li>
              <li>After check-in: 100% fee (no refund)</li>
            </ul>
            
            <button 
              (click)="checkCancellationFee()" 
              class="btn-check-fee"
              [disabled]="loadingCancellationFee || !bookingForm.checkInDate"
              type="button"
            >
              {{ loadingCancellationFee ? 'Calculating...' : '🔍 Calculate My Cancellation Fee' }}
            </button>
            
            <div *ngIf="showCancellationFee" class="cancellation-fee-box">
              <p><strong>Your Cancellation Fee (if cancelled today):</strong></p>
              <div class="fee-breakdown">
                <p>Days until check-in: <strong>{{ getDaysUntilCheckIn() }} days</strong></p>
                <p *ngIf="getDaysUntilCheckIn() > 7" class="fee-info-free">✅ Free cancellation available</p>
                <p *ngIf="getDaysUntilCheckIn() > 3 && getDaysUntilCheckIn() <= 7" class="fee-info-warning">⚠️ 25% cancellation fee applies</p>
                <p *ngIf="getDaysUntilCheckIn() > 1 && getDaysUntilCheckIn() <= 3" class="fee-info-warning">⚠️ 50% cancellation fee applies</p>
                <p *ngIf="getDaysUntilCheckIn() >= 0 && getDaysUntilCheckIn() <= 1" class="fee-info-danger">❌ 75% cancellation fee applies</p>
                <p *ngIf="getDaysUntilCheckIn() < 0" class="fee-info-danger">❌ 100% fee - no refund available</p>
              </div>
              <p class="fee-amount">₹{{ cancellationFee }}</p>
              <p class="fee-note">
                <small>* This fee applies only if you cancel today. The fee may change as your check-in date approaches.</small>
              </p>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-box">{{ errorMessage }}</div>

          <div class="actions-row">
            <button class="btn-secondary" (click)="step = 1">← Back</button>
            <button class="btn-primary" (click)="goToConfirm()">Continue →</button>
          </div>
        </div>
      </ng-container>

      <!-- STEP 3: CONFIRM & CREATE BOOKING -->
      <ng-container *ngIf="step === 3">
        <div class="card">
          <h2>Review & Confirm Booking</h2>

          <p><strong>Room ID:</strong> {{ roomId }}</p>
          <p><strong>Dates:</strong> {{ bookingForm.checkInDate }} → {{ bookingForm.checkOutDate }}</p>
          <p><strong>Guests:</strong> {{ bookingForm.totalGuests }}</p>
          <p><strong>Rooms:</strong> {{ numberOfRooms }}</p>
          <p><strong>Name:</strong> {{ bookingForm.guestName }}</p>
          <p><strong>Email:</strong> {{ bookingForm.guestEmail }}</p>
          <p><strong>Phone:</strong> {{ bookingForm.guestPhone }}</p>

          <div *ngIf="promoApplied && appliedPromo" class="promo-applied-box">
            <h4>🎁 Promo Applied</h4>
            <p><strong>Code:</strong> {{ appliedPromo.code }}</p>
            <p><strong>Discount:</strong> ₹{{ discountAmount }}</p>
          </div>

          <div class="price-box">
            <p>Nights: {{ numberOfNights }}</p>
            <p>Room total: ₹{{ roomTotal }}</p>
            <p *ngIf="discountAmount > 0" class="discount-line">
              Promo discount: <span class="discount-amount">-₹{{ discountAmount }}</span>
            </p>
            <p>Tax (12%): ₹{{ taxAmount }}</p>
            <p class="total">Total: ₹{{ finalAmount }}</p>
          </div>

          <!-- Cancellation Policy -->
          <div class="cancellation-policy">
            <h3>📋 Cancellation Policy</h3>
            <p class="policy-text">
              You can cancel your booking anytime. Cancellation fees may apply based on when you cancel.
            </p>
            <button 
              (click)="checkCancellationFee()" 
              class="btn-check-fee"
              [disabled]="loadingCancellationFee"
            >
              {{ loadingCancellationFee ? 'Checking...' : '🔍 Check Cancellation Fee' }}
            </button>
            
            <div *ngIf="showCancellationFee" class="cancellation-fee-box">
              <p><strong>Current Cancellation Fee:</strong></p>
              <p class="fee-amount">₹{{ cancellationFee }}</p>
              <p class="fee-note">
                <small>* Fee is calculated based on booking date and cancellation timing</small>
              </p>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-box">{{ errorMessage }}</div>

          <div class="actions-row">
            <button class="btn-secondary" (click)="step = 2">← Back</button>
            <button
              class="btn-primary"
              (click)="submitBooking()"
              [disabled]="loading"
            >
              {{ loading ? 'Creating booking...' : 'Create Booking' }}
            </button>
          </div>
        </div>
      </ng-container>

      <!-- STEP 4: PAYMENT -->
      <ng-container *ngIf="step === 4">
        <div class="card">
          <h2>Complete Your Payment</h2>
          <p class="info">Booking ID: <strong>{{ bookingId }}</strong></p>

          <!-- Payment Method Selection -->
          <div class="payment-methods">
            <button
              class="payment-method-btn"
              [class.active]="paymentMethod === 'UPI'"
              (click)="selectPaymentMethod('UPI')"
            >
              📱 UPI
            </button>
            <button
              class="payment-method-btn"
              [class.active]="paymentMethod === 'CARD'"
              (click)="selectPaymentMethod('CARD')"
            >
              💳 Card
            </button>
            <button
              class="payment-method-btn"
              [class.active]="paymentMethod === 'EMI'"
              (click)="selectPaymentMethod('EMI')"
            >
              📊 EMI
            </button>
          </div>

          <!-- UPI Payment Form -->
          <div *ngIf="paymentMethod === 'UPI'" class="payment-form">
            <h3>Pay with UPI</h3>
            <label>UPI ID *</label>
            <input
              type="text"
              [(ngModel)]="paymentForm.upiId"
              placeholder="user@paytm, user@phonepe, etc."
            />
          </div>

          <!-- Card Payment Form -->
          <div *ngIf="paymentMethod === 'CARD'" class="payment-form">
            <h3>Pay with Card</h3>
            
            <label>Card Number *</label>
            <input
              type="text"
              [(ngModel)]="paymentForm.cardNumber"
              placeholder="4111 1111 1111 1111"
              maxlength="16"
            />

            <label>Card Holder Name *</label>
            <input
              type="text"
              [(ngModel)]="paymentForm.cardHolderName"
              placeholder="John Doe"
            />

            <div class="grid-3">
              <div>
                <label>Expiry Month *</label>
                <input
                  type="text"
                  [(ngModel)]="paymentForm.expiryMonth"
                  placeholder="12"
                  maxlength="2"
                />
              </div>
              <div>
                <label>Expiry Year *</label>
                <input
                  type="text"
                  [(ngModel)]="paymentForm.expiryYear"
                  placeholder="2028"
                  maxlength="4"
                />
              </div>
              <div>
                <label>CVV *</label>
                <input
                  type="text"
                  [(ngModel)]="paymentForm.cvv"
                  placeholder="123"
                  maxlength="3"
                />
              </div>
            </div>

            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="paymentForm.saveCard"
              />
              Save card for future payments
            </label>
          </div>

          <!-- EMI Payment Form -->
          <div *ngIf="paymentMethod === 'EMI'" class="payment-form">
            <h3>Pay with EMI</h3>
            
            <label>Card Number *</label>
            <input
              type="text"
              [(ngModel)]="paymentForm.cardNumber"
              placeholder="5267 8912 3456 7890"
              maxlength="16"
            />

            <label>Card Holder Name *</label>
            <input
              type="text"
              [(ngModel)]="paymentForm.cardHolderName"
              placeholder="John Doe"
            />

            <div class="grid-3">
              <div>
                <label>Expiry Month *</label>
                <input
                  type="text"
                  [(ngModel)]="paymentForm.expiryMonth"
                  placeholder="10"
                  maxlength="2"
                />
              </div>
              <div>
                <label>Expiry Year *</label>
                <input
                  type="text"
                  [(ngModel)]="paymentForm.expiryYear"
                  placeholder="2029"
                  maxlength="4"
                />
              </div>
              <div>
                <label>CVV *</label>
                <input
                  type="text"
                  [(ngModel)]="paymentForm.cvv"
                  placeholder="456"
                  maxlength="3"
                />
              </div>
            </div>

            <label>EMI Tenure (months) *</label>
            <select [(ngModel)]="paymentForm.emiTenure">
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="9">9 months</option>
              <option value="12">12 months</option>
              <option value="18">18 months</option>
              <option value="24">24 months</option>
            </select>

            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="paymentForm.saveCard"
              />
              Save card for future payments
            </label>
          </div>

          <div class="price-summary">
            <h3>Payment Summary</h3>
            <p *ngIf="discountAmount > 0" class="original-price">Original: <s>₹{{ roomTotal + taxAmount }}</s></p>
            <p>Total Amount: <strong>₹{{ finalAmount }}</strong></p>
            <p *ngIf="paymentMethod === 'EMI' && paymentForm.emiTenure">
              EMI per month: <strong>₹{{ calculateEMI() }}</strong>
            </p>
          </div>

          <div *ngIf="errorMessage" class="error-box">{{ errorMessage }}</div>

          <div class="actions-row">
            <button class="btn-secondary" (click)="step = 3">← Back</button>
            <button
              class="btn-primary"
              (click)="processPayment()"
              [disabled]="loading || !isPaymentFormValid()"
            >
              {{ loading ? 'Processing...' : 'Pay ₹' + finalAmount }}
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .flow-container {
      max-width: 900px;
      margin: 20px auto;
      padding: 20px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    h1 { margin-bottom: 20px; font-size: 26px; }
    .steps {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .steps div {
      padding: 8px 14px;
      border-radius: 20px;
      background: #f1f1f1;
      font-size: 14px;
    }
    .steps div.active {
      background: #007bff;
      color: #fff;
    }
    .debug-info {
      background: #fff3cd;
      padding: 8px 12px;
      border-radius: 5px;
      margin-bottom: 15px;
      font-size: 13px;
      font-weight: 600;
    }
    .card {
      background: #fff;
      padding: 20px 24px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    label {
      display: block;
      margin-top: 10px;
      font-weight: 600;
      font-size: 14px;
    }
    input, textarea {
      width: 100%;
      margin-top: 4px;
      padding: 8px 10px;
      border-radius: 5px;
      border: 1px solid #ddd;
      font-size: 14px;
    }
    textarea { resize: vertical; }
    .btn-primary, .btn-secondary {
      border: none;
      border-radius: 5px;
      padding: 10px 18px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      margin-top: 15px;
    }
    .btn-primary { background: #007bff; color: #fff; }
    .btn-primary:disabled { background: #6c757d; cursor: not-allowed; }
    .btn-secondary { background: #e0e0e0; color: #333; }
    .info { font-size: 13px; color: #555; margin-bottom: 10px; }
    .divider {
      text-align: center;
      margin: 15px 0;
      position: relative;
    }
    .divider::before,
    .divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 40%;
      height: 1px;
      background: #ddd;
    }
    .divider::before { left: 0; }
    .divider::after { right: 0; }
    .divider span {
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      color: #777;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 10px;
    }
    .price-box {
      margin-top: 15px;
      padding: 10px 12px;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 14px;
    }
    .price-box .total {
      font-weight: 700;
      color: #007bff;
      margin-top: 5px;
    }
    .actions-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .error-box {
      margin-top: 10px;
      padding: 8px 10px;
      background: #f8d7da;
      color: #721c24;
      border-radius: 5px;
      font-size: 13px;
    }
    .warning-box {
      margin: 15px 0;
      padding: 10px 12px;
      background: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
      border-radius: 5px;
      font-size: 13px;
    }
    
    /* Promo Code Styles */
    .promo-section {
      margin: 20px 0;
      padding: 15px;
      background: #f0f8ff;
      border-radius: 8px;
      border: 2px dashed #007bff;
    }
    .promo-section h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #007bff;
    }
    .promo-input-group {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }
    .promo-input {
      flex: 1;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .btn-apply-promo, .btn-remove-promo {
      padding: 8px 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
    }
    .btn-apply-promo {
      background: #28a745;
      color: white;
    }
    .btn-apply-promo:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    .btn-remove-promo {
      background: #dc3545;
      color: white;
    }
    .promo-error {
      padding: 8px 10px;
      background: #f8d7da;
      color: #721c24;
      border-radius: 5px;
      font-size: 13px;
      margin-top: 8px;
    }
    .promo-success {
      padding: 10px;
      background: #d4edda;
      color: #155724;
      border-radius: 5px;
      font-size: 14px;
      margin-top: 8px;
      border-left: 4px solid #28a745;
    }
    .promo-desc {
      margin: 5px 0 0 0;
      font-size: 12px;
      opacity: 0.9;
    }
    .available-promos {
      margin-top: 12px;
    }
    .promo-label {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #555;
    }
    .promo-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .promo-chip {
      padding: 6px 12px;
      background: white;
      border: 2px solid #007bff;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      transition: all 0.2s;
    }
    .promo-chip:hover {
      background: #007bff;
      color: white;
    }
    .promo-chip-code {
      font-weight: 700;
      text-transform: uppercase;
    }
    .promo-chip-value {
      font-size: 11px;
      padding: 2px 6px;
      background: #e7f3ff;
      border-radius: 10px;
    }
    .promo-chip:hover .promo-chip-value {
      background: rgba(255,255,255,0.3);
    }
    .discount-line {
      color: #28a745;
      font-weight: 600;
    }
    .discount-amount {
      font-weight: 700;
    }
    .savings {
      color: #28a745;
      font-weight: 600;
      font-size: 15px;
      margin-top: 8px;
    }
    .promo-applied-box {
      margin: 15px 0;
      padding: 12px;
      background: #d4edda;
      border-radius: 6px;
      border-left: 4px solid #28a745;
    }
    .promo-applied-box h4 {
      margin: 0 0 8px 0;
      color: #155724;
      font-size: 14px;
    }
    .promo-applied-box p {
      margin: 4px 0;
      font-size: 13px;
      color: #155724;
    }
    
    .payment-methods {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 20px 0;
    }
    .payment-method-btn {
      padding: 15px;
      border: 2px solid #ddd;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .payment-method-btn:hover {
      border-color: #007bff;
      background: #f0f8ff;
    }
    .payment-method-btn.active {
      border-color: #007bff;
      background: #007bff;
      color: #fff;
    }
    .payment-form {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .payment-form h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 10px;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 15px;
      font-weight: normal;
      cursor: pointer;
    }
    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin: 0;
    }
    select {
      width: 100%;
      margin-top: 4px;
      padding: 8px 10px;
      border-radius: 5px;
      border: 1px solid #ddd;
      font-size: 14px;
      background: #fff;
    }
    .price-summary {
      margin: 20px 0;
      padding: 15px;
      background: #e7f3ff;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }
    .price-summary h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
    }
    .price-summary p {
      margin: 5px 0;
      font-size: 15px;
    }
    .original-price {
      color: #999;
      font-size: 13px;
    }
    
    /* Cancellation Policy Styles */
    .cancellation-policy {
      margin: 20px 0;
      padding: 15px;
      background: #fff8e1;
      border-radius: 8px;
      border-left: 4px solid #ffa726;
    }
    .cancellation-policy h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #f57c00;
    }
    .policy-text {
      font-size: 14px;
      color: #555;
      margin-bottom: 8px;
    }
    .policy-list {
      margin: 10px 0 15px 20px;
      padding: 0;
      font-size: 13px;
      color: #666;
    }
    .policy-list li {
      margin: 5px 0;
    }
    .btn-check-fee {
      padding: 10px 20px;
      background: #ff9800;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      width: 100%;
      margin-top: 5px;
    }
    .btn-check-fee:hover {
      background: #f57c00;
    }
    .btn-check-fee:disabled {
      background: #ffb74d;
      cursor: not-allowed;
    }
    .cancellation-fee-box {
      margin-top: 15px;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border: 2px solid #ff9800;
      animation: slideDown 0.3s ease;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .cancellation-fee-box p {
      margin: 5px 0;
      font-size: 14px;
    }
    .fee-breakdown {
      margin: 10px 0;
      padding: 10px;
      background: #fff8e1;
      border-radius: 4px;
    }
    .fee-info-free {
      font-size: 13px;
      margin: 5px 0 !important;
      color: #28a745;
      font-weight: 600;
    }
    .fee-info-warning {
      font-size: 13px;
      margin: 5px 0 !important;
      color: #ff9800;
      font-weight: 600;
    }
    .fee-info-danger {
      font-size: 13px;
      margin: 5px 0 !important;
      color: #dc3545;
      font-weight: 600;
    }
    .fee-amount {
      font-size: 28px;
      font-weight: 700;
      color: #f57c00;
      margin: 10px 0 !important;
      text-align: center;
    }
    .fee-note {
      font-size: 12px;
      color: #666;
      font-style: italic;
      text-align: center;
    }
    
    @media (max-width: 768px) {
      .grid-2 { grid-template-columns: 1fr; }
      .grid-3 { grid-template-columns: 1fr; }
      .payment-methods { grid-template-columns: 1fr; }
      .promo-input-group { flex-direction: column; }
      .btn-apply-promo, .btn-remove-promo { width: 100%; }
    }
  `]
})
export class BookingOneFileComponent implements OnInit {
  step = 0;
  hotelId: number | null = null;
  existingHotelId: number | null = null;
  existingRoomId: number | null = null;
  roomId: number | null = null;
  bookingId: number | null = null;

  // Promo code related
  promoCodeInput = '';
  promoApplied = false;
  appliedPromo: PromoCode | null = null;
  discountAmount = 0;
  loadingPromo = false;
  promoError = '';
  activePromoCodes: PromoCode[] = [];

  // Cancellation fee related
  showCancellationFee = false;
  cancellationFee = 0;
  loadingCancellationFee = false;

  hotelForm = {
    name: '',
    description: '',
    city: '',
    landmark: '',
    pinCode: '',
    address: '',
    latitude: 0,
    longitude: 0,
    starRating: 5,
    propertyType: 'HOTEL',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    policies: '',
    contactPhone: '',
    contactEmail: ''
  };
  
  hotelAmenitiesInput = 'Free WiFi, Parking, Swimming Pool';
  hotelPhotosInput = '';

  roomForm = {
    roomType: 'Standard',
    description: '',
    pricePerNight: 1000,
    maxOccupancy: 2,
    totalRooms: 1,
    bedSize: 1.0,
    bedType: 'Standard'
  };

  bookingForm = {
    checkInDate: '',
    checkOutDate: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    emergencyContact: '',
    totalGuests: 1,
    gstNumber: '',
    specialRequests: ''
  };

  paymentMethod: 'UPI' | 'CARD' | 'EMI' = 'UPI';
  paymentForm = {
    upiId: '',
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: false,
    emiTenure: 12
  };

  numberOfRooms = 1;
  numberOfNights = 1;
  roomTotal = 0;
  taxAmount = 0;
  finalAmount = 0;

  loading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['bookingId']) {
        this.bookingId = parseInt(params['bookingId']);
        this.step = 4;
      }
    });
  }

  ngOnInit(): void {
    this.loadActivePromoCodes();
  }

  loadActivePromoCodes(): void {
    this.http.get<PromoCode[]>(`${BACKEND_URL}/api/promo-codes/active`).subscribe({
      next: (codes) => {
        this.activePromoCodes = codes;
      },
      error: (err) => {
        console.error('Error loading promo codes:', err);
      }
    });
  }

  validatePromoCode(): void {
    if (!this.promoCodeInput) return;

    const bookingAmount = this.roomTotal + this.taxAmount;
    this.loadingPromo = true;
    this.promoError = '';

    this.http.post<any>(`${BACKEND_URL}/api/promo-codes/validate`, {
      code: this.promoCodeInput.toUpperCase(),
      bookingAmount: bookingAmount
    }).subscribe({
      next: (response) => {
        this.loadingPromo = false;
        if (response.valid) {
          this.promoApplied = true;
          this.appliedPromo = response.promoCode;
          this.discountAmount = response.discountAmount;
          this.recalculate();
        }
      },
      error: (err) => {
        this.loadingPromo = false;
        this.promoError = err.error?.error || 'Invalid promo code';
      }
    });
  }

  applyPromoFromList(promo: PromoCode): void {
    this.promoCodeInput = promo.code;
    this.validatePromoCode();
  }

  removePromoCode(): void {
    this.promoApplied = false;
    this.appliedPromo = null;
    this.discountAmount = 0;
    this.promoCodeInput = '';
    this.promoError = '';
    this.recalculate();
  }

  checkCancellationFee(): void {
    this.loadingCancellationFee = true;
    this.showCancellationFee = false;
    
    const daysUntilCheckIn = this.getDaysUntilCheckIn();
    
    this.ngZone.run(() => {
      if (daysUntilCheckIn > 7) {
        this.cancellationFee = 0;
      } else if (daysUntilCheckIn > 3) {
        this.cancellationFee = Math.round(this.finalAmount * 0.25);
      } else if (daysUntilCheckIn > 1) {
        this.cancellationFee = Math.round(this.finalAmount * 0.50);
      } else if (daysUntilCheckIn >= 0) {
        this.cancellationFee = Math.round(this.finalAmount * 0.75);
      } else {
        this.cancellationFee = this.finalAmount;
      }
      
      setTimeout(() => {
        this.showCancellationFee = true;
        this.loadingCancellationFee = false;
        this.cdr.detectChanges();
      }, 300);
    });
  }

  getDaysUntilCheckIn(): number {
    if (!this.bookingForm.checkInDate) return 0;
    
    const checkInDate = new Date(this.bookingForm.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Rest of the component methods remain the same...

  // Rest of the component methods remain the same...
  goToRoomStep(): void {
    this.errorMessage = '';

    if (this.existingHotelId && this.existingHotelId > 0) {
      console.log('✅ Using existing hotel ID:', this.existingHotelId);
      this.hotelId = this.existingHotelId;
      this.step = 1;
      return;
    }

    if (!this.hotelForm.name || !this.hotelForm.city || !this.hotelForm.pinCode || 
        !this.hotelForm.address || !this.hotelForm.contactPhone || !this.hotelForm.contactEmail) {
      this.errorMessage = 'Please fill all required fields (Name, City, Pin Code, Address, Phone, Email) or provide existing Hotel ID.';
      return;
    }

    const amenities = this.hotelAmenitiesInput
      ? this.hotelAmenitiesInput.split(',').map(s => s.trim()).filter(s => s)
      : [];
    
    const photos = this.hotelPhotosInput
      ? this.hotelPhotosInput.split(',').map(s => s.trim()).filter(s => s)
      : [];

    const hotelPayload = {
      name: this.hotelForm.name,
      description: this.hotelForm.description,
      city: this.hotelForm.city,
      landmark: this.hotelForm.landmark,
      pinCode: this.hotelForm.pinCode,
      address: this.hotelForm.address,
      latitude: this.hotelForm.latitude || 0,
      longitude: this.hotelForm.longitude || 0,
      starRating: this.hotelForm.starRating,
      propertyType: this.hotelForm.propertyType,
      checkInTime: this.hotelForm.checkInTime,
      checkOutTime: this.hotelForm.checkOutTime,
      policies: this.hotelForm.policies,
      contactPhone: this.hotelForm.contactPhone,
      contactEmail: this.hotelForm.contactEmail,
      amenities: amenities,
      photos: photos
    };

    const token = this.authService.getToken();
    this.loading = true;

    fetch(`${BACKEND_URL}/api/hotels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(hotelPayload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Status ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then((hotel) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.hotelId = hotel.id;
          setTimeout(() => {
            this.step = 1;
            this.cdr.detectChanges();
          }, 0);
        });
      })
      .catch((err) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.errorMessage = 'Failed to create hotel: ' + err.message;
          this.cdr.detectChanges();
        });
      });
  }

  goToBookingStep(): void {
    this.errorMessage = '';

    if (!this.hotelId || this.hotelId <= 0) {
      this.errorMessage = 'Please provide a valid Hotel ID.';
      return;
    }

    if (this.existingRoomId && this.existingRoomId > 0) {
      this.roomId = this.existingRoomId;
      this.step = 2;
      return;
    }

    if (!this.roomForm.roomType || !this.roomForm.pricePerNight) {
      this.errorMessage = 'Please fill room type and price per night or provide existing Room ID.';
      return;
    }

    const roomPayload = {
      roomType: this.roomForm.roomType,
      description: this.roomForm.description,
      pricePerNight: this.roomForm.pricePerNight,
      maxOccupancy: this.roomForm.maxOccupancy,
      totalRooms: this.roomForm.totalRooms,
      amenities: [],
      photos: [],
      bedSize: this.roomForm.bedSize,
      bedType: this.roomForm.bedType
    };

    const token = this.authService.getToken();
    this.loading = true;

    fetch(`${BACKEND_URL}/api/rooms?hotelId=${this.hotelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(roomPayload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Status ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then((room) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.roomId = room.id;
          this.step = 2;
          this.cdr.detectChanges();
        });
      })
      .catch((err) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.errorMessage = 'Failed to create room: ' + err.message;
          this.cdr.detectChanges();
        });
      });
  }

  recalculate(): void {
    if (
      !this.roomId ||
      !this.bookingForm.checkInDate ||
      !this.bookingForm.checkOutDate ||
      !this.roomForm.pricePerNight
    ) {
      return;
    }

    const checkIn = new Date(this.bookingForm.checkInDate);
    const checkOut = new Date(this.bookingForm.checkOutDate);
    const diff = checkOut.getTime() - checkIn.getTime();

    this.numberOfNights =
      diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 1;

    this.roomTotal =
      this.roomForm.pricePerNight * this.numberOfNights * this.numberOfRooms;
    
    // Apply discount
    const subtotalAfterDiscount = this.roomTotal - this.discountAmount;
    this.taxAmount = Math.round(subtotalAfterDiscount * 0.12);
    this.finalAmount = subtotalAfterDiscount + this.taxAmount;
  }

  goToConfirm(): void {
    this.errorMessage = '';
    if (!this.roomId) {
      this.errorMessage =
        'Room ID is missing. Please go back and create/select a room.';
      return;
    }
    if (
      !this.bookingForm.checkInDate ||
      !this.bookingForm.checkOutDate ||
      !this.bookingForm.guestName ||
      !this.bookingForm.guestEmail ||
      !this.bookingForm.guestPhone
    ) {
      this.errorMessage = 'Please fill all required booking fields.';
      return;
    }
    this.step = 3;
  }

  submitBooking(): void {
    this.errorMessage = '';
    if (!this.roomId) {
      this.errorMessage = 'Room ID is missing.';
      return;
    }

    const payload: any = {
      checkInDate: this.bookingForm.checkInDate,
      checkOutDate: this.bookingForm.checkOutDate,
      totalGuests: this.bookingForm.totalGuests,
      guestName: this.bookingForm.guestName,
      guestEmail: this.bookingForm.guestEmail,
      guestPhone: this.bookingForm.guestPhone,
      emergencyContact: this.bookingForm.emergencyContact,
      gstNumber: this.bookingForm.gstNumber,
      specialRequests: this.bookingForm.specialRequests,
      rooms: [
        {
          roomId: this.roomId,
          numberOfRooms: this.numberOfRooms
        }
      ]
    };

    // Add promo code if applied
    if (this.promoApplied && this.appliedPromo) {
      payload.promoCode = this.appliedPromo.code;
    }

    const token = this.authService.getToken();
    this.loading = true;

    fetch(`${BACKEND_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Status ${res.status}: ${text}`);
        }
        
        const text = await res.text();
        const idMatch = text.match(/"id"\s*:\s*(\d+)/);
        if (idMatch) {
          return { id: parseInt(idMatch[1]) };
        }
        
        try {
          return JSON.parse(text);
        } catch (e) {
          return { id: null, success: true };
        }
      })
      .then((booking) => {
        this.ngZone.run(() => {
          this.loading = false;
          
          if (booking.id) {
            alert('Booking created with ID: ' + booking.id);
            this.bookingId = booking.id;
            
            setTimeout(() => {
              this.step = 4;
              this.cdr.detectChanges();
            }, 0);
          } else {
            alert('Booking created successfully! Check your backend for the booking ID.');
            setTimeout(() => {
              this.step = 4;
              this.cdr.detectChanges();
            }, 0);
          }
        });
      })
      .catch((err) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.errorMessage = 'Booking failed: ' + err.message;
        });
      });
  }

  selectPaymentMethod(method: 'UPI' | 'CARD' | 'EMI'): void {
    this.paymentMethod = method;
    this.errorMessage = '';
    if (method === 'UPI') {
      this.paymentForm.cardNumber = '';
      this.paymentForm.cardHolderName = '';
      this.paymentForm.expiryMonth = '';
      this.paymentForm.expiryYear = '';
      this.paymentForm.cvv = '';
    } else if (method === 'CARD' || method === 'EMI') {
      this.paymentForm.upiId = '';
    }
  }

  isPaymentFormValid(): boolean {
    if (this.paymentMethod === 'UPI') {
      return !!this.paymentForm.upiId && this.paymentForm.upiId.includes('@');
    } else if (this.paymentMethod === 'CARD') {
      return !!(
        this.paymentForm.cardNumber &&
        this.paymentForm.cardHolderName &&
        this.paymentForm.expiryMonth &&
        this.paymentForm.expiryYear &&
        this.paymentForm.cvv &&
        this.paymentForm.cardNumber.length >= 13 &&
        this.paymentForm.cvv.length === 3
      );
    } else if (this.paymentMethod === 'EMI') {
      return !!(
        this.paymentForm.cardNumber &&
        this.paymentForm.cardHolderName &&
        this.paymentForm.expiryMonth &&
        this.paymentForm.expiryYear &&
        this.paymentForm.cvv &&
        this.paymentForm.emiTenure &&
        this.paymentForm.cardNumber.length >= 13 &&
        this.paymentForm.cvv.length === 3
      );
    }
    return false;
  }

  calculateEMI(): number {
    if (!this.finalAmount || !this.paymentForm.emiTenure) return 0;
    const monthlyEMI = this.finalAmount / this.paymentForm.emiTenure;
    return Math.round(monthlyEMI);
  }

  processPayment(): void {
    this.errorMessage = '';
    
    if (!this.bookingId) {
      this.errorMessage = 'Booking ID is missing. Please create a booking first.';
      return;
    }

    if (!this.isPaymentFormValid()) {
      this.errorMessage = 'Please fill all required payment fields correctly.';
      return;
    }

    let payload: any = {
      bookingId: this.bookingId,
      paymentMethod: this.paymentMethod
    };

    if (this.paymentMethod === 'UPI') {
      payload.upiId = this.paymentForm.upiId;
    } else if (this.paymentMethod === 'CARD') {
      payload.cardNumber = this.paymentForm.cardNumber;
      payload.cardHolderName = this.paymentForm.cardHolderName;
      payload.expiryMonth = parseInt(this.paymentForm.expiryMonth); // Convert to number
      payload.expiryYear = parseInt(this.paymentForm.expiryYear);   // Convert to number
      payload.cvv = this.paymentForm.cvv; // Keep as string, backend might expect string
      payload.saveCard = this.paymentForm.saveCard;
    } else if (this.paymentMethod === 'EMI') {
      payload.cardNumber = this.paymentForm.cardNumber;
      payload.cardHolderName = this.paymentForm.cardHolderName;
      payload.expiryMonth = parseInt(this.paymentForm.expiryMonth); // Convert to number
      payload.expiryYear = parseInt(this.paymentForm.expiryYear);   // Convert to number
      payload.cvv = this.paymentForm.cvv; // Keep as string
      payload.emiTenure = parseInt(this.paymentForm.emiTenure.toString()); // Ensure number
      payload.saveCard = this.paymentForm.saveCard;
    }

    const token = this.authService.getToken();
    this.loading = true;

    fetch(`${BACKEND_URL}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Payment failed: ${text}`);
        }
        
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          return { success: true, message: 'Payment processed successfully' };
        }
      })
      .then((result) => {
        this.ngZone.run(() => {
          this.loading = false;
          
          // Redirect to dashboard with success state
          this.router.navigate(['/dashboard'], {
            state: {
              paymentSuccess: true,
              bookingId: this.bookingId,
              amount: this.finalAmount,
              savings: this.discountAmount,
              bookingDetails: {
                guestName: this.bookingForm.guestName,
                checkIn: this.bookingForm.checkInDate,
                checkOut: this.bookingForm.checkOutDate,
                nights: this.numberOfNights
              }
            }
          });
        });
      })
      .catch((err) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.errorMessage = 'Payment failed: ' + err.message;
        });
      });
  }

  resetAll(): void {
    this.step = 0;
    this.hotelId = null;
    this.roomId = null;
    this.bookingId = null;
    this.existingHotelId = null;
    this.existingRoomId = null;
    
    // Reset promo code
    this.promoCodeInput = '';
    this.promoApplied = false;
    this.appliedPromo = null;
    this.discountAmount = 0;
    this.promoError = '';
    
    // Reset cancellation fee
    this.showCancellationFee = false;
    this.cancellationFee = 0;
    this.loadingCancellationFee = false;
    
    this.hotelForm = {
      name: '',
      description: '',
      city: '',
      landmark: '',
      pinCode: '',
      address: '',
      latitude: 0,
      longitude: 0,
      starRating: 5,
      propertyType: 'HOTEL',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      policies: '',
      contactPhone: '',
      contactEmail: ''
    };
    
    this.hotelAmenitiesInput = 'Free WiFi, Parking, Swimming Pool';
    this.hotelPhotosInput = '';
    
    this.roomForm = {
      roomType: 'Standard',
      description: '',
      pricePerNight: 1000,
      maxOccupancy: 2,
      totalRooms: 1,
      bedSize: 1.0,
      bedType: 'Standard'
    };
    
    this.bookingForm = {
      checkInDate: '',
      checkOutDate: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      emergencyContact: '',
      totalGuests: 1,
      gstNumber: '',
      specialRequests: ''
    };
    
    this.paymentForm = {
      upiId: '',
      cardNumber: '',
      cardHolderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      saveCard: false,
      emiTenure: 12
    };
    
    this.numberOfRooms = 1;
    this.numberOfNights = 1;
    this.roomTotal = 0;
    this.taxAmount = 0;
    this.finalAmount = 0;
    this.errorMessage = '';
    
    this.router.navigate(['/booking-flow']);
    this.loadActivePromoCodes();
  }
}