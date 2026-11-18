import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 30px; font-family: sans-serif; text-align: center;">
      <h2>TrainerRCO Dashboard</h2>
      <p>Welcome to the manuscript processing and OCR management portal.</p>
      <button (click)="goToOcr()" style="padding: 10px 20px; background: #7F77DD; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 15px;">
        Go to OCR Verification
      </button>
    </div>
  `
})
export class DashboardPage {
  constructor(private router: Router) {}

  goToOcr(): void {
    this.router.navigate(['/ocr']);
  }
}