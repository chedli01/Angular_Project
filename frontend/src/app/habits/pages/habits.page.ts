import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HabitsStore } from '../habits.store';
import { HabitCardComponent } from '../components/habit-card.component';

@Component({
  standalone: true,
  imports: [HabitCardComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      @for (h of habits(); track h.id) {
        <app-habit-card
          [name]="h.name"
          [icon]="h.icon"
          [completionRate]="h.completionRate"
          (click)="open(h.id)"
        />
      }
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
      },
      { allowSignalWrites: true }
    );
  }

  open(id: string) {
    this.router.navigate(['/habits', id]);
  }
}