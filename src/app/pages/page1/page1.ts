import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 30px; font-family: sans-serif; text-align: center;">
      <h2>Project Page 1</h2>
      <p>Manuscript management and initial review section.</p>
      <button (click)="goToOcr()" style="padding: 10px 20px; background: #7F77DD; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 15px;">
        Go to OCR Verification
      </button>
    </div>
  `
})
export class Page1 {
  constructor(private router: Router) {}
  goToOcr(): void { this.router.navigate(['/ocr']); }
}