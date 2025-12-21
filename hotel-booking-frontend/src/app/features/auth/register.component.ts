import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Create Account</h2>
        <div *ngIf="error" class="alert-error">{{error}}</div>
        <div *ngIf="successMessage" class="alert-success">{{successMessage}}</div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" [(ngModel)]="formData.firstName" name="firstName" 
                     required class="form-control" placeholder="First name">
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" [(ngModel)]="formData.lastName" name="lastName" 
                     required class="form-control" placeholder="Last name">
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="formData.email" name="email" 
                   required class="form-control" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" [(ngModel)]="formData.phone" name="phone" 
                   required class="form-control" placeholder="1234567890">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="formData.password" name="password" 
                   required class="form-control" placeholder="Create a password">
          </div>
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{loading ? 'Creating Account...' : 'Register'}}
          </button>
        </form>
        <p class="text-center">Already have an account? <a routerLink="/login">Login here</a></p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .register-card {
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 500px;
    }
    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
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
export class RegisterComponent implements OnInit {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  };
  loading = false;
  error = '';
  successMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    // Validation
    if (!this.formData.firstName || !this.formData.lastName || 
        !this.formData.email || !this.formData.phone || !this.formData.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.successMessage = 'Registration successful! Redirecting...';
        
        // Small delay to show success message
        setTimeout(() => {
          this.router.navigate(['/dashboard']).then(() => {
            console.log('Navigated to dashboard');
          });
        }, 500);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.error = err.error?.error || err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
