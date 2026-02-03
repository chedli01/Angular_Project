import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CalendarComponent } from './calendar/calendar.component';
import { DaySummaryComponent } from './day-summary/day-summary.component';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CalendarComponent, DaySummaryComponent],
  templateUrl: './calendar-page.component.html',
  styleUrls: ['./calendar-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPageComponent {
  selectedDay = signal<Date | null>(null);

  onDaySelected(day: Date) {
    this.selectedDay.set(day);
  }
}
