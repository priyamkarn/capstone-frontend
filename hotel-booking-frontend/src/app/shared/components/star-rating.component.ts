import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  template: `
    <div class="star-rating">
      <span *ngFor="let star of stars" class="star" [class.filled]="star <= rating">⭐</span>
      <span class="rating-text" *ngIf="showNumber">({{rating}})</span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .star {
      font-size: 18px;
      filter: grayscale(100%);
    }
    .star.filled {
      filter: grayscale(0%);
    }
    .rating-text {
      margin-left: 8px;
      font-weight: 600;
      color: #666;
    }
  `]
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() showNumber: boolean = true;
  stars = [1, 2, 3, 4, 5];
}
