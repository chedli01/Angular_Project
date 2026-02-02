import { Component, input } from '@angular/core';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isToday
} from 'date-fns';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-habit-month-calendar',
  imports: [NgClass],
  template: `
    <div class="bg-gray-100 rounded-xl p-4">
      <div class="mb-3 text-sm font-medium">This month</div>

      <!-- Weekday headers -->
      <div class="grid grid-cols-7 gap-1 text-xs mb-2 text-muted-foreground">
        @for (d of weekdays; track d) {
          <div class="text-center">{{ d }}</div>
        }
      </div>

      <!-- Calendar days -->
      <div class="grid grid-cols-7 gap-1">
        @for (i of leadingEmpty; track i) {
          <div></div>
        }

        @for (day of days; track day.toISOString()) {
          <div
            class="aspect-square rounded-lg flex items-center justify-center text-sm text-gray-500"
            [style.backgroundColor]="
              isCompleted(day) ? color() : null
            "
            [style.opacity]="isCompleted(day) ? '0.15' : null"
            [class.ring-2]="isToday(day)"
            [class.ring-gray-400]="isToday(day)"
          >
            {{ format(day, 'd') }}
          </div>
        }
      </div>
    </div>
  `
})
export class HabitMonthCalendarComponent {
  readonly completionDates = input.required<string[]>();
  readonly color = input.required<string>();

  private readonly today = new Date();

  readonly days = eachDayOfInterval({
    start: startOfMonth(this.today),
    end: endOfMonth(this.today)
  });

  readonly weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly leadingEmpty = Array.from({
    length: getDay(startOfMonth(this.today))
  });

  isCompleted(day: Date): boolean {
    return this.completionDates().includes(format(day, 'yyyy-MM-dd'));
  }

  protected readonly format = format;
  protected readonly isToday = isToday;
}