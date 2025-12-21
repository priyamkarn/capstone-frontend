import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>Hotel Booking</h4>
            <p>Find and book the perfect hotel for your next trip</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <a routerLink="/">Home</a>
            <a routerLink="/hotels">Hotels</a>
            <a routerLink="/bookings">My Bookings</a>
          </div>
          <div class="footer-section">
            <h4>Legal</h4>
            <a href="#">Terms & Conditions</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 Hotel Booking. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #343a40;
      color: white;
      padding: 40px 0 20px;
      margin-top: 60px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    }
    .footer-section h4 {
      margin-bottom: 15px;
      color: white;
    }
    .footer-section a {
      display: block;
      color: #ccc;
      text-decoration: none;
      margin-bottom: 8px;
    }
    .footer-section a:hover {
      color: white;
    }
    .footer-bottom {
      border-top: 1px solid #555;
      padding-top: 20px;
      text-align: center;
      color: #ccc;
    }
  `]
})
export class FooterComponent {}