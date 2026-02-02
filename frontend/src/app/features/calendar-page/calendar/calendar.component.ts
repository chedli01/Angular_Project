import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  ViewChild,
  AfterViewInit,
  Input,
  signal,
  input,
} from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { HabitsRepository } from '../../../core/data/habits/habits.repository';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [MatCalendar],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements AfterViewInit {
  selectedDay = input<Date | null>(null);
  @Output() daySelected = new EventEmitter<Date>();
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;
  private _sub!: Subscription;
  private completedByDay: Record<string, number> = {};

  constructor(private habitsRepo: HabitsRepository) {}

  async ngAfterViewInit() {
    this._sub = this.calendar.stateChanges.subscribe(() => {
      this.loadMonth(this.calendar.activeDate);
    });
    await this.loadMonth(new Date());
  }

  async loadMonth(value: unknown) {
    if (!(value instanceof Date)) {
      return;
    }
    this.completedByDay = await this.habitsRepo.getCompletedHabitsCountForMonth(
      value.getFullYear(),
      value.getMonth(),
    );

    this.calendar?.updateTodaysDate();
  }

  onDaySelected(date: Date | null) {
    if (!date) return;
    if (date.getTime() === this.selectedDay()?.getTime()) return;
    this.daySelected.emit(date);
  }

  dateClass = (date: Date): string => {
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');

    const count = this.completedByDay[key] ?? 0;

    if (count === 0) return '';
    if (count === 1) return 'heat-1';
    if (count === 2) return 'heat-2';
    if (count === 3) return 'heat-3';
    return 'heat-4';
  };

  ngOnDestroy() {
    this._sub?.unsubscribe();
  }
}
