import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-day-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './day-summary.component.html',
  styleUrls: ['./day-summary.component.scss'],
})
export class DaySummaryComponent {
  @Input() selectedDay: Date | null = null;
}
