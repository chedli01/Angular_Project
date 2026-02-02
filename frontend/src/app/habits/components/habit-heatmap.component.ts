import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { format, subDays, isToday } from 'date-fns';

@Component({
  standalone: true,
  imports: [NgClass],
  selector: 'app-habit-heatmap',
  template: `
    <div class="bg-gray-100 rounded-xl p-4 mb-6">
      <div class="mb-3 text-sm font-medium">Last 30 days</div>

      <div class="grid grid-cols-10 gap-2 mb-4">
        @for (day of days; track day.toISOString()) {
          <div
            class="aspect-square rounded-lg bg-gray-200"
            [style.backgroundColor]="
              isCompleted(day) ? color() : null
            "
            [class.ring-2]="isToday(day)"
            [class.ring-gray-400]="isToday(day)"
            [title]="format(day, 'EEEE, MMM d')"
          ></div>
        }
      </div>

      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        <div class="flex items-center gap-1">
          <span
            class="h-3 w-3 rounded-sm"
            [style.backgroundColor]="color()"
          ></span>
          Completed
        </div>
        <div class="flex items-center gap-1">
          <span class="h-3 w-3 rounded-sm bg-gray-200"></span>
          Missed
        </div>
      </div>
    </div>
  `
})
export class HabitHeatmapComponent {
  readonly completionDates = input.required<string[]>();
  readonly color = input.required<string>();

  protected readonly format = format;
  protected readonly isToday = isToday;

  private readonly today = new Date();

  readonly days = Array.from({ length: 30 }, (_, i) =>
    subDays(this.today, 29 - i)
  );

  isCompleted(day: Date): boolean {
    return this.completionDates().includes(format(day, 'yyyy-MM-dd'));
  }
}