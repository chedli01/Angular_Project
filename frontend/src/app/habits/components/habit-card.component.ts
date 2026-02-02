import { Component, computed, input } from '@angular/core';
import { HabitWithStats } from '../habit-with-stats.model';

@Component({
  standalone: true,
  selector: 'app-habit-card',
  template: `
    <div
      class="p-10 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition"
    >
      <div class="flex gap-4 items-center">
        <!-- Icon -->
        <div
          class="h-12 w-12 rounded-xl flex items-center justify-center text-xl" [style.backgroundColor]="config().color"
        >
          {{ config().icon }}
        </div>

        <div class="flex-1">
          <!-- Name -->
          <h3 class="font-semibold text-lg truncate mb-2">{{ config().name }}</h3>

          <!-- Progress bar -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-2 bg-gray-200 rounded">
              <div
                class="h-full rounded "
                [style.width.%]="config().completionRate"
                [style.backgroundColor]="config().color"
              ></div>
            </div>
            <span class="font-semibold text-sm">{{ config().completionRate }}%</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HabitCardComponent {
  readonly config = input.required<HabitWithStats>();
}