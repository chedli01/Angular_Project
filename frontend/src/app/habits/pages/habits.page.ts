import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HabitsStore } from '../habits.store';
import { HabitCardComponent } from '../components/habit-card.component';

@Component({
  standalone: true,
  imports: [HabitCardComponent],
  template: `
    <div class="container mx-auto p-8 max-w-7xl">
  <header class="mb-8 flex justify-between items-start">
    <div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Habits</h1>
      <p class="text-gray-600">An overview of your habits and routines.</p>
    </div>
  </header>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      @for (h of habits(); track h.id) {
        <app-habit-card
          [config]="h"
          (click)="open(h.id)"
        />
      }
    </div>
    </div>
  `
})
export class HabitsPage {

  private readonly store = inject(HabitsStore);
  private readonly router = inject(Router);

  readonly habits = computed(() =>
    this.store.habitsWithStats()
  );

  constructor() {
    effect(
      () => {
        this.store.load();
      }
    );
  }

  open(id: string) {
    this.router.navigate(['/habits', id]);
  }
}