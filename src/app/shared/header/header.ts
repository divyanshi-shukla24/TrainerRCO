import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  @Input() title: string = 'RCO';
  @Output() backClick = new EventEmitter<void>();

  onBack(): void {
    this.backClick.emit();
  }
}