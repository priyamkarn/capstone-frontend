import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true, // <-- make it standalone
  imports: [
    NgIf,            // for *ngIf
    AsyncPipe,       // for async pipe
    NgTemplateOutlet, // for <ng-template>
    RouterLink       // for [routerLink]
  ],
  template: `
    <nav class="navbar">
      <div class="container">
        <a routerLink="/" class="logo">🏨 Hotel Booking</a>
        <div class="nav-links">
          <a routerLink="/">Home</a>
          <a routerLink="/hotels">Hotels</a>

          <ng-container *ngIf="authService.currentUser$ | async as user; else notLoggedIn">
            <a routerLink="/bookings">My Bookings</a>
            <a routerLink="/profile">Profile</a>
            <button (click)="logout()" class="btn-logout">Logout</button>
          </ng-container>

          <ng-template #notLoggedIn>
            <a routerLink="/login" class="btn-login">Login</a>
            <a routerLink="/register" class="btn-register">Register</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #007bff;
      padding: 1rem 0;
      color: white;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      text-decoration: none;
    }
    .nav-links {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .nav-links a, .btn-logout {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    .nav-links a:hover, .btn-logout:hover {
      background: rgba(255,255,255,0.1);
    }
    .btn-login, .btn-register {
      background: white;
      color: #007bff;
      font-weight: 600;
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
