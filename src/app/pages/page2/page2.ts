import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page2',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 30px; font-family: sans-serif; text-align: center;">
      <h2>Project Page 2</h2>
      <p>Advanced OCR configuration and comparison logs.</p>
      <button (click)="goToOcr()" style="padding: 10px 20px; background: #7F77DD; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 15px;">
        Go to OCR Verification
      </button>
    </div>
  `
})
export class Page2 {
  constructor(private router: Router) {}
  goToOcr(): void { this.router.navigate(['/ocr']); }
}