import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { HabitsRepository } from '../../core/data/habits/habits.repository';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [MatCalendar],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  @Output() daySelected = new EventEmitter<Date>();

  private completedByDay: Record<string, number> = {};

  constructor(private habitsRepo: HabitsRepository) {}

  async ngOnInit() {
    const today = new Date();
    await this.loadMonth(today);
  }

  async loadMonth(value: unknown) {
    if (!(value instanceof Date)) {
      return;
    }

    this.completedByDay = await this.habitsRepo.getCompletedHabitsCountForMonth(
      value.getFullYear(),
      value.getMonth()
    );
  }

  onDaySelected(date: Date | null) {
    if (!date) return;
    this.daySelected.emit(date);
  }

  dateClass = (date: Date): string => {
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');

    const count = this.completedByDay[key] ?? 0;
    console.log(this.completedByDay);
    if (count === 0) return '';
    if (count === 1) return 'heat-1';
    if (count === 2) return 'heat-2';
    if (count === 3) return 'heat-3';
    return 'heat-4';
  };
}
