import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentService } from '../../core/services/payment.service';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/models/model';
import { LoaderComponent } from '../../shared/components/loader.component';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoaderComponent
  ],
  template: `
    <div class="payment-container">
      <!-- your full inline template here -->
      <div *ngIf="booking">
        <h3>Booking Reference: {{ booking.bookingReference }}</h3>
        <p>Hotel: {{ booking.hotel.name }}</p>
        <p>Check-in: {{ booking.checkInDate | date }}</p>
        <p>Check-out: {{ booking.checkOutDate | date }}</p>
      </div>
      <!-- Add your payment forms here -->
    </div>
  `,
  styles: [`
    .payment-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    /* Add your full CSS here */
  `]
})
export class PaymentMethodsComponent implements OnInit {
  bookingId!: number;
  booking: Booking | null = null;
  amount = 0;
  paymentMethod = 'UPI';
  loading = false;
  error = '';

  paymentData = {
    upiId: '',
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    cvv: '',
    saveCard: false,
    emiTenure: 3
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.bookingId = Number(this.route.snapshot.queryParamMap.get('bookingId'));
    this.loadBooking();
  }

  loadBooking(): void {
    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (data) => {
        this.booking = data;
        this.amount = data.finalPrice;
      },
      error: (err) => console.error('Error loading booking:', err)
    });
  }

  selectMethod(method: string): void {
    this.paymentMethod = method;
  }

  calculateEMI(months: number): number {
    const interest = 0.12 / 12;
    const emi = (this.amount * interest * Math.pow(1 + interest, months)) /
                (Math.pow(1 + interest, months) - 1);
    return Math.round(emi);
  }

  calculateTotalEMI(months: number): number {
    return this.calculateEMI(months) * months;
  }

  processPayment(): void {
    this.loading = true;
    this.error = '';

    const paymentRequest = {
      bookingId: this.bookingId,
      paymentMethod: this.paymentMethod,
      ...this.paymentData
    };

    this.paymentService.processPayment(paymentRequest).subscribe({
      next: () => {
        this.router.navigate(['/booking/confirmation'], {
          queryParams: { bookingId: this.bookingId }
        });
      },
      error: (err) => {
        this.error = err.error?.error || 'Payment failed';
        this.loading = false;
      }
    });
  }
}
