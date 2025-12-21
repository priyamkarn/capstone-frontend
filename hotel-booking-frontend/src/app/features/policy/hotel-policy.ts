// src/app/features/hotel-policy/hotel-policy.component.ts
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-hotel-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="policy-container">
      <div class="header">
        <h2>🏨 Hotel Policy Management</h2>
        <p class="subtitle">Hotel ID: #{{hotelId}}</p>
      </div>

      <!-- Debug Info (remove after testing) -->
      <div style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; font-size: 12px;">
        <strong>Debug Info:</strong><br>
        Loading: {{ loading }}<br>
        Policy Exists: {{ policyExists }}<br>
        Can Edit: {{ canEdit }}<br>
        Policy Data: {{ policy ? 'Available' : 'None' }}
      </div>

      <!-- Message Display (moved to top for better visibility) -->
      <div class="alert" [ngClass]="isError ? 'alert-error' : 'alert-success'" *ngIf="message">
        <span class="alert-icon">{{ isError ? '❌' : '✅' }}</span>
        <p>{{ message }}</p>
      </div>

      <!-- Loading State -->
      <div class="loading-card" *ngIf="loading && !message">
        <div class="spinner"></div>
        <p>Loading policy...</p>
      </div>

      <!-- Success Card with Policy Details -->
      <div class="success-card" *ngIf="showSuccessCard && !loading">
        <div class="success-header">
          <div class="success-icon">✅</div>
          <h3>Policy Updated Successfully!</h3>
          <p>Your hotel policy has been saved and is now active.</p>
        </div>

        <div class="policy-summary">
          <h4>📋 Policy Summary</h4>
          
          <div class="summary-section">
            <div class="summary-item">
              <span class="summary-label">Check-in Time:</span>
              <span class="summary-value">{{ policy?.checkInStartTime }} - {{ policy?.checkInEndTime }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Check-out Time:</span>
              <span class="summary-value">{{ policy?.checkOutTime }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Minimum Age:</span>
              <span class="summary-value">{{ policy?.minimumCheckInAge }} years</span>
            </div>
          </div>

          <div class="summary-section">
            <h5>Additional Services:</h5>
            <div class="summary-item">
              <span class="summary-label">Early Check-in:</span>
              <span class="summary-value">
                {{ policy?.earlyCheckInAvailable ? '✅ Available (₹' + policy.earlyCheckInFee + ')' : '❌ Not available' }}
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Late Check-out:</span>
              <span class="summary-value">
                {{ policy?.lateCheckOutAvailable ? '✅ Available (₹' + policy.lateCheckOutFee + ')' : '❌ Not available' }}
              </span>
            </div>
          </div>

          <div class="summary-section">
            <h5>House Rules:</h5>
            <div class="summary-grid">
              <div class="summary-badge" [class.active]="policy?.childrenAllowed">
                {{ policy?.childrenAllowed ? '✅' : '❌' }} Children
              </div>
              <div class="summary-badge" [class.active]="policy?.petsAllowed">
                {{ policy?.petsAllowed ? '✅' : '❌' }} Pets
              </div>
              <div class="summary-badge" [class.active]="policy?.smokingAllowed">
                {{ policy?.smokingAllowed ? '✅' : '🚭' }} Smoking
              </div>
              <div class="summary-badge" [class.active]="policy?.partiesAllowed">
                {{ policy?.partiesAllowed ? '✅' : '❌' }} Events
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button (click)="editPolicy()" class="btn-secondary">
            ✏️ Edit Policy
          </button>
          <button (click)="goToHome()" class="btn-primary">
            🏠 Go to Home
          </button>
        </div>
      </div>

      <!-- Policy View (visible when policy exists and not loading and not showing success card) -->
      <div class="policy-view-card" *ngIf="policyExists && !loading && !showSuccessCard">
        <div class="alert alert-warning">
          <span class="alert-icon">⚠️</span>
          <div>
            <strong>View Only Mode</strong>
            <p>Only administrators can edit hotel policies.</p>
          </div>
        </div>

        <h3>📋 Current Hotel Policies</h3>

        <div class="policy-section">
          <h4>⏰ Check-in & Check-out Times</h4>
          <div class="policy-grid">
            <div class="policy-item">
              <span class="label">Check-in From:</span>
              <span class="value">{{ policy?.checkInStartTime || 'Not specified' }}</span>
            </div>
            <div class="policy-item">
              <span class="label">Check-in Until:</span>
              <span class="value">{{ policy?.checkInEndTime || 'Not specified' }}</span>
            </div>
            <div class="policy-item">
              <span class="label">Check-out:</span>
              <span class="value">{{ policy?.checkOutTime || 'Not specified' }}</span>
            </div>
          </div>
        </div>

        <div class="policy-section">
          <h4>💰 Additional Services</h4>
          <div class="policy-grid">
            <div class="policy-item">
              <span class="label">Early Check-in:</span>
              <span class="value">
                {{ policy?.earlyCheckInAvailable ? '✅ Available (₹' + policy.earlyCheckInFee + ')' : '❌ Not available' }}
              </span>
            </div>
            <div class="policy-item">
              <span class="label">Late Check-out:</span>
              <span class="value">
                {{ policy?.lateCheckOutAvailable ? '✅ Available (₹' + policy.lateCheckOutFee + ')' : '❌ Not available' }}
              </span>
            </div>
          </div>
        </div>

        <div class="policy-section">
          <h4>👥 Guest Requirements</h4>
          <div class="policy-grid">
            <div class="policy-item">
              <span class="label">Minimum Age:</span>
              <span class="value">{{ policy?.minimumCheckInAge }} years</span>
            </div>
            <div class="policy-item">
              <span class="label">Children Allowed:</span>
              <span class="value">{{ policy?.childrenAllowed ? '✅ Yes' : '❌ No' }}</span>
            </div>
          </div>
        </div>

        <div class="policy-section">
          <h4>🏠 House Policies</h4>
          <div class="policy-grid">
            <div class="policy-item">
              <span class="label">Pets Allowed:</span>
              <span class="value">{{ policy?.petsAllowed ? '✅ Yes (₹' + policy.petFee + ')' : '❌ No' }}</span>
            </div>
            <div class="policy-item">
              <span class="label">Smoking:</span>
              <span class="value">{{ policy?.smokingAllowed ? '✅ Allowed' : '🚭 Not allowed' }}</span>
            </div>
            <div class="policy-item" *ngIf="policy?.smokingPolicy">
              <span class="label">Smoking Details:</span>
              <span class="value">{{ policy.smokingPolicy }}</span>
            </div>
            <div class="policy-item">
              <span class="label">Parties/Events:</span>
              <span class="value">{{ policy?.partiesAllowed ? '✅ Allowed' : '❌ Not allowed' }}</span>
            </div>
          </div>
        </div>

        <div class="policy-section" *ngIf="policy?.additionalPolicies">
          <h4>📝 Additional Policies</h4>
          <div class="text-content">{{ policy.additionalPolicies }}</div>
        </div>

        <div class="policy-section" *ngIf="policy?.covidPolicies">
          <h4>😷 COVID-19 Policies</h4>
          <div class="text-content">{{ policy.covidPolicies }}</div>
        </div>

        <div class="policy-section" *ngIf="policy?.houseRules">
          <h4>📜 House Rules</h4>
          <div class="text-content">{{ policy.houseRules }}</div>
        </div>
      </div>

      <!-- No Policy State -->
      <div class="no-policy-card" *ngIf="!policyExists && !loading && canEdit">
        <div class="empty-icon">📋</div>
        <h3>No Policy Set</h3>
        <p>This hotel doesn't have any policies configured yet.</p>
        <p class="hint">Fill out the form below to create policies for this hotel.</p>
      </div>

      <!-- Edit Form for Admins -->
      <form *ngIf="canEdit && !loading && !showSuccessCard" [formGroup]="policyForm" (ngSubmit)="submit()" class="policy-form">
        <h3 *ngIf="policyExists">✏️ Edit Hotel Policy</h3>
        <h3 *ngIf="!policyExists">➕ Create Hotel Policy</h3>

        <div class="form-section">
          <h4>⏰ Check-in & Check-out Times</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Check-in Start Time *</label>
              <input type="time" formControlName="checkInStartTime" />
              <span class="hint-text">When guests can start checking in</span>
            </div>
            <div class="form-group">
              <label>Check-in End Time *</label>
              <input type="time" formControlName="checkInEndTime" />
              <span class="hint-text">Last time for check-in</span>
            </div>
          </div>

          <div class="form-group">
            <label>Check-out Time *</label>
            <input type="time" formControlName="checkOutTime" />
            <span class="hint-text">When guests must check out</span>
          </div>
        </div>

        <div class="form-section">
          <h4>💰 Additional Services</h4>
          <div class="form-row">
            <div class="form-group-with-toggle">
              <label class="toggle-label">
                <input type="checkbox" formControlName="earlyCheckInAvailable" />
                <span>Early Check-in Available</span>
              </label>
              <input 
                type="number" 
                formControlName="earlyCheckInFee" 
                placeholder="Fee (₹)" 
                min="0"
              />
            </div>
            <div class="form-group-with-toggle">
              <label class="toggle-label">
                <input type="checkbox" formControlName="lateCheckOutAvailable" />
                <span>Late Check-out Available</span>
              </label>
              <input 
                type="number" 
                formControlName="lateCheckOutFee" 
                placeholder="Fee (₹)" 
                min="0"
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4>👥 Guest Requirements</h4>
          <div class="form-group">
            <label>Minimum Check-in Age *</label>
            <input type="number" formControlName="minimumCheckInAge" min="1" max="100" />
            <span class="hint-text">Minimum age required to check in</span>
          </div>

          <div class="form-row">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="childrenAllowed" />
              <span>Children Allowed</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h4>🏠 House Policies</h4>
          
          <div class="form-group-with-toggle">
            <label class="toggle-label">
              <input type="checkbox" formControlName="petsAllowed" />
              <span>Pets Allowed</span>
            </label>
            <input 
              type="number" 
              formControlName="petFee" 
              placeholder="Pet Fee (₹)" 
              min="0"
            />
          </div>

          <div class="form-group">
            <label class="toggle-label">
              <input type="checkbox" formControlName="smokingAllowed" />
              <span>Smoking Allowed</span>
            </label>
            <textarea 
              formControlName="smokingPolicy" 
              rows="2" 
              placeholder="Specify smoking areas or restrictions..."
            ></textarea>
          </div>

          <label class="checkbox-label">
            <input type="checkbox" formControlName="partiesAllowed" />
            <span>Parties/Events Allowed</span>
          </label>
        </div>

        <div class="form-section">
          <h4>📝 Additional Information</h4>
          
          <div class="form-group">
            <label>Additional Policies</label>
            <textarea 
              formControlName="additionalPolicies" 
              rows="5" 
              placeholder="Enter general policies, rules, and terms..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>COVID-19 Policies</label>
            <textarea 
              formControlName="covidPolicies" 
              rows="4"
              placeholder="Safety measures, sanitization protocols, etc..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>House Rules</label>
            <textarea 
              formControlName="houseRules" 
              rows="5"
              placeholder="Important rules guests must follow..."
            ></textarea>
          </div>
        </div>

        <button type="submit" [disabled]="loading || policyForm.invalid" class="btn-submit">
          {{ loading ? 'Saving...' : (policyExists ? '💾 Update Policy' : '➕ Create Policy') }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .policy-container {
      max-width: 1000px;
      margin: 20px auto;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .header h2 {
      font-size: 32px;
      color: #333;
      margin: 0 0 10px 0;
    }

    .subtitle {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    /* Loading State */
    .loading-card {
      background: white;
      padding: 60px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1976d2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Alert Styles */
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 15px 20px;
      border-radius: 10px;
      margin: 20px 0;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }

    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .alert-warning {
      background: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
    }

    .alert-icon {
      font-size: 24px;
    }

    .alert p {
      margin: 5px 0 0 0;
      font-size: 14px;
    }

    .alert strong {
      display: block;
      margin-bottom: 5px;
      font-size: 16px;
    }

    /* Policy View */
    .policy-view-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .policy-view-card h3 {
      font-size: 24px;
      color: #333;
      margin: 0 0 25px 0;
    }

    .policy-section {
      margin-bottom: 30px;
      padding-bottom: 25px;
      border-bottom: 2px solid #f0f0f0;
    }

    .policy-section:last-child {
      border-bottom: none;
    }

    .policy-section h4 {
      font-size: 18px;
      color: #555;
      margin: 0 0 15px 0;
    }

    .policy-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .policy-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .policy-item .label {
      font-size: 13px;
      color: #777;
      font-weight: 600;
    }

    .policy-item .value {
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }

    .text-content {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      line-height: 1.6;
      white-space: pre-wrap;
      color: #333;
    }

    /* No Policy State */
    .no-policy-card {
      background: white;
      padding: 60px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }

    .no-policy-card h3 {
      font-size: 24px;
      color: #333;
      margin-bottom: 10px;
    }

    .no-policy-card p {
      color: #666;
      font-size: 16px;
      margin: 5px 0;
    }

    .hint {
      color: #1976d2;
      font-weight: 600;
      margin-top: 15px;
    }

    /* Form Styles */
    .policy-form {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-top: 20px;
    }

    .policy-form h3 {
      font-size: 24px;
      color: #333;
      margin: 0 0 25px 0;
    }

    .form-section {
      margin-bottom: 30px;
      padding-bottom: 25px;
      border-bottom: 2px solid #f0f0f0;
    }

    .form-section:last-of-type {
      border-bottom: none;
    }

    .form-section h4 {
      font-size: 18px;
      color: #555;
      margin: 0 0 20px 0;
    }

    .form-row {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .form-group {
      flex: 1;
      min-width: 250px;
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #444;
      font-size: 14px;
    }

    .form-group input[type="time"],
    .form-group input[type="number"],
    .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #1976d2;
    }

    .form-group input:disabled,
    .form-group textarea:disabled {
      background: #f0f0f0;
      cursor: not-allowed;
    }

    .form-group textarea {
      resize: vertical;
      font-family: inherit;
    }

    .hint-text {
      display: block;
      font-size: 12px;
      color: #888;
      margin-top: 5px;
    }

    .form-group-with-toggle {
      flex: 1;
      min-width: 250px;
      margin-bottom: 20px;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      color: #444;
      margin-bottom: 10px;
      cursor: pointer;
    }

    .toggle-label input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      color: #444;
      margin-bottom: 15px;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .btn-submit {
      width: 100%;
      padding: 15px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .btn-submit:hover:not(:disabled) {
      background: #1565c0;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }

    .btn-submit:disabled {
      background: #aaa;
      cursor: not-allowed;
      transform: none;
    }

    /* Success Card Styles */
    .success-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
    }

    .success-header {
      margin-bottom: 30px;
    }

    .success-icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: scaleIn 0.5s ease;
    }

    @keyframes scaleIn {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .success-header h3 {
      font-size: 28px;
      color: #28a745;
      margin: 0 0 10px 0;
    }

    .success-header p {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    .policy-summary {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: left;
    }

    .policy-summary h4 {
      font-size: 20px;
      color: #333;
      margin: 0 0 20px 0;
      text-align: center;
    }

    .policy-summary h5 {
      font-size: 16px;
      color: #555;
      margin: 20px 0 10px 0;
      font-weight: 600;
    }

    .summary-section {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #dee2e6;
    }

    .summary-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
    }

    .summary-label {
      font-weight: 600;
      color: #555;
      font-size: 14px;
    }

    .summary-value {
      color: #333;
      font-size: 14px;
      font-weight: 500;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }

    .summary-badge {
      padding: 10px 15px;
      background: #e9ecef;
      border-radius: 8px;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: #666;
      border: 2px solid #dee2e6;
    }

    .summary-badge.active {
      background: #d4edda;
      color: #155724;
      border-color: #28a745;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-primary,
    .btn-secondary {
      padding: 15px 40px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
    }

    .btn-primary:hover {
      background: #1565c0;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }

      .policy-grid {
        grid-template-columns: 1fr;
      }

      .header h2 {
        font-size: 24px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class HotelPolicyComponent implements OnInit {

  hotelId: number = 1;
  baseUrl = 'http://localhost:8080/api/hotel-policies';

  policyForm!: FormGroup;
  policy: any = null;
  policyExists = false;
  canEdit = true;
  loading = true;
  message = '';
  isError = false;
  showSuccessCard = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Get hotelId from route params if available
    this.route.params.subscribe(params => {
      if (params['hotelId']) {
        this.hotelId = +params['hotelId'];
      }
    });

    this.initializeForm();
    this.setupFormSubscriptions();
    // Skip the exists check and directly try to load the policy
    this.loadPolicy();
  }

  private setupFormSubscriptions(): void {
    // Enable/disable fields based on checkboxes
    this.policyForm.get('earlyCheckInAvailable')?.valueChanges.subscribe(value => {
      const feeControl = this.policyForm.get('earlyCheckInFee');
      if (value) {
        feeControl?.enable();
      } else {
        feeControl?.disable();
      }
    });

    this.policyForm.get('lateCheckOutAvailable')?.valueChanges.subscribe(value => {
      const feeControl = this.policyForm.get('lateCheckOutFee');
      if (value) {
        feeControl?.enable();
      } else {
        feeControl?.disable();
      }
    });

    this.policyForm.get('petsAllowed')?.valueChanges.subscribe(value => {
      const feeControl = this.policyForm.get('petFee');
      if (value) {
        feeControl?.enable();
      } else {
        feeControl?.disable();
      }
    });

    this.policyForm.get('smokingAllowed')?.valueChanges.subscribe(value => {
      const policyControl = this.policyForm.get('smokingPolicy');
      if (value) {
        policyControl?.enable();
      } else {
        policyControl?.disable();
      }
    });
  }

  private initializeForm(): void {
    this.policyForm = this.fb.group({
      checkInStartTime: ['14:00', Validators.required],
      checkInEndTime: ['23:00', Validators.required],
      checkOutTime: ['12:00', Validators.required],
      earlyCheckInAvailable: [false],
      earlyCheckInFee: [{value: 0, disabled: true}],
      lateCheckOutAvailable: [false],
      lateCheckOutFee: [{value: 0, disabled: true}],
      minimumCheckInAge: [18, [Validators.required, Validators.min(1)]],
      childrenAllowed: [true],
      petsAllowed: [false],
      petFee: [{value: 0, disabled: true}],
      smokingAllowed: [false],
      smokingPolicy: [{value: '', disabled: true}],
      partiesAllowed: [false],
      additionalPolicies: [''],
      covidPolicies: [''],
      houseRules: ['']
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  private loadPolicy(): void {
    this.loading = true;
    this.message = '';
    
    console.log('Loading policy for hotel:', this.hotelId);
    
    this.http.get<any>(
      `${this.baseUrl}/hotel/${this.hotelId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error loading policy:', err);
        
        // If 404, policy doesn't exist yet
        if (err.status === 404) {
          this.policyExists = false;
          this.loading = false;
          return of(null);
        }
        
        // For other errors, handle them
        this.handleError(err);
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        console.log('Policy data received:', data);
        
        if (data) {
          this.policyExists = true;
          
          // Store the policy data with formatted times for display
          this.policy = {
            ...data,
            checkInStartTime: this.formatTime(data.checkInStartTime),
            checkInEndTime: this.formatTime(data.checkInEndTime),
            checkOutTime: this.formatTime(data.checkOutTime)
          };

          // Patch form with HH:mm format (required for time inputs)
          const formattedData = {
            ...data,
            checkInStartTime: data.checkInStartTime?.substring(0, 5),
            checkInEndTime: data.checkInEndTime?.substring(0, 5),
            checkOutTime: data.checkOutTime?.substring(0, 5)
          };

          this.policyForm.patchValue(formattedData);
          
          // Enable/disable conditional fields based on loaded data
          if (data.earlyCheckInAvailable) {
            this.policyForm.get('earlyCheckInFee')?.enable();
          }
          if (data.lateCheckOutAvailable) {
            this.policyForm.get('lateCheckOutFee')?.enable();
          }
          if (data.petsAllowed) {
            this.policyForm.get('petFee')?.enable();
          }
          if (data.smokingAllowed) {
            this.policyForm.get('smokingPolicy')?.enable();
          }
          
          console.log('Form patched with:', formattedData);
        } else {
          this.policyExists = false;
        }
        
        // CRITICAL: Always set loading to false
        this.loading = false;
        console.log('Loading set to false, policyExists:', this.policyExists);
        
        // Trigger change detection
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Subscribe error:', err);
        this.loading = false;
      }
    });
  }

  // Helper method to format time for display (HH:mm:ss -> HH:mm)
  formatTime(time: string | undefined): string {
    if (!time) return 'Not specified';
    return time.substring(0, 5);
  }

  submit(): void {
    if (this.policyForm.invalid) {
      this.message = 'Please fill all required fields correctly.';
      this.isError = true;
      return;
    }

    this.loading = true;
    this.message = '';
    this.isError = false;
    this.showSuccessCard = false;

    console.log('Submitting policy:', this.policyForm.value);

    // Get raw value to include disabled fields
    const formData = this.policyForm.getRawValue();

    this.http.post(
      `${this.baseUrl}/hotel/${this.hotelId}`,
      formData,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (saved: any) => {
        console.log('Policy saved:', saved);
        
        this.ngZone.run(() => {
          // Format the saved policy data for display
          this.policy = {
            ...saved,
            checkInStartTime: this.formatTime(saved.checkInStartTime),
            checkInEndTime: this.formatTime(saved.checkInEndTime),
            checkOutTime: this.formatTime(saved.checkOutTime)
          };
          
          this.policyExists = true;
          this.loading = false;
          
          // Use setTimeout to avoid change detection issues
          setTimeout(() => {
            this.showSuccessCard = true;
            this.cdr.detectChanges();
            // Scroll to top to show success card
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        });
      },
      error: (err) => this.handleError(err)
    });
  }

  editPolicy(): void {
    this.ngZone.run(() => {
      this.showSuccessCard = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    });
  }

  goToHome(): void {
    window.location.href = 'http://localhost:4200/';
    // Or use Angular router: this.router.navigate(['/']);
  }

  private handleError(err: HttpErrorResponse): void {
    console.error('HTTP Error:', err);
    
    this.loading = false;
    this.isError = true;

    if (err.status === 403) {
      this.canEdit = false;
      this.policyForm.disable();
      this.message = '🔒 Access Denied: Only administrators can modify hotel policies.';
    } else if (err.status === 401) {
      this.message = '🔐 Unauthorized. Please log in again.';
    } else if (err.status === 404) {
      this.message = '❌ Hotel not found. Please check the hotel ID.';
    } else {
      this.message = err.error?.error || err.error?.message || '❌ Server error. Could not load policy.';
    }
    
    // Scroll to top to show error message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}