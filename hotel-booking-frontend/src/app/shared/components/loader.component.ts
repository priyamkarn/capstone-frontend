import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `
    <div class="loader-container">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  `,
  styles: [`
    .loader-container {
      text-align: center;
      padding: 40px;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoaderComponent {}