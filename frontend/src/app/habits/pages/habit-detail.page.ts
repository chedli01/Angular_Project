import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { HabitsStore } from '../habits.store';
import { getHabitColors } from '../habit.colors';
import { HabitHeatmapComponent } from '../components/habit-heatmap.component';
import { HabitMonthCalendarComponent } from '../components/habit-month-calendar.component';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
  templateUrl: './habit-detail.page.html',
  imports: [HabitHeatmapComponent, HabitMonthCalendarComponent, NgClass],
})
export class HabitDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(HabitsStore);
  private readonly router = inject(Router);

  private readonly habitId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), {
    initialValue: null,
  });

  readonly habit = computed(() => {
    const id = this.habitId();
    return id ? this.store.habitById(id)() : undefined;
  });

  back() {
    this.router.navigate(['/habits']);
  }
}
