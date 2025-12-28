import { Component, Input, Output, EventEmitter, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitListSectionComponent } from './habit-list/habit-list-section.component';
import { HabitsRepository, Habit } from '../../../core/data/habits/habits.repository';

@Component({
  selector: 'app-day-summary',
  standalone: true,
  imports: [CommonModule, HabitListSectionComponent],
  templateUrl: './day-summary.component.html',
  styleUrls: ['./day-summary.component.scss'],
})
export class DaySummaryComponent {
  // input → signal
  private selectedDaySig = signal<Date | null>(null);

  @Input()
  set selectedDay(value: Date | null) {
    this.selectedDaySig.set(value);
  }

  get selectedDay() {
    return this.selectedDaySig();
  }

  @Output() clearRequested = new EventEmitter<void>();

  loading = signal(false);
  completedHabits = signal<Habit[]>([]);
  notCompletedHabits = signal<Habit[]>([]);

  constructor(private habitsRepo: HabitsRepository) {
    effect(() => {
      const day = this.selectedDaySig();

      // reset immediately
      this.completedHabits.set([]);
      this.notCompletedHabits.set([]);

      if (!day) return;

      this.loadDay(day);
    });
  }

  clear() {
    this.clearRequested.emit();
  }

  private async loadDay(day: Date) {
    this.loading.set(true);

    const dateKey = this.formatDate(day);

    const [completed, notCompleted] = await Promise.all([
      this.habitsRepo.getCompletedHabitsForDay(dateKey),
      this.habitsRepo.getNotCompletedHabitsForDay(dateKey),
    ]);

    // safe: effect re-runs automatically if day changes
    this.completedHabits.set(completed);
    this.notCompletedHabits.set(notCompleted);

    this.loading.set(false);
  }

  private formatDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
