import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login to Your Account</h2>
        <div *ngIf="error" class="alert-error">{{error}}</div>
        <div *ngIf="successMessage" class="alert-success">{{successMessage}}</div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required 
                   class="form-control" placeholder="Enter your email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required 
                   class="form-control" placeholder="Enter your password">
          </div>
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{loading ? 'Logging in...' : 'Login'}}
          </button>
        </form>
        <p class="text-center">Don't have an account? <a routerLink="/register">Register here</a></p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }
    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #555;
    }
    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      transition: border 0.3s;
    }
    .form-control:focus {
      outline: none;
      border-color: #007bff;
    }
    .btn-primary {
      width: 100%;
      padding: 14px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
      transform: translateY(-2px);
    }
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }
    .alert-error {
      background: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #f5c6cb;
    }
    .alert-success {
      background: #d4edda;
      color: #155724;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #c3e6cb;
    }
    .text-center {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }
    .text-center a {
      color: #007bff;
      text-decoration: none;
      font-weight: 600;
    }
    .text-center a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  successMessage = '';
  returnUrl: string = '/dashboard';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password';
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.successMessage = 'Login successful! Redirecting...';
   
        // Small delay to show success message
        setTimeout(() => {
          this.router.navigate([this.returnUrl]).then(() => {
            console.log('Navigated to:', this.returnUrl);
          });
        }, 500);
      },
      error: (err:any) => {
        console.error('Login error:', err);
        this.error = err.error?.error || err.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}