import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HabitDataService } from '../../../../core/services/habit-data.service';
import { HabitFormData, HabitWithStatus } from '../../../../shared/models/habit.model';
import { AddHabitDialog } from '../../components/add-habit-dialog/add-habit-dialog';
import { RoutineService } from '@app/core/services/routines.service';
import { HabitRoutineService } from '@app/core/services/habit-routine.service';

@Component({
  selector: 'app-today',
  imports: [CommonModule, AddHabitDialog],
  templateUrl: './today.html',
  styleUrl: './today.css',
})
export class Today {
  public habitService = inject(HabitDataService);
  private routineService = inject(RoutineService);
  private habitRoutineService = inject(HabitRoutineService);
  private router = inject(Router);

  loading = this.habitService.getLoading;
  error = this.habitService.getError;
  routines = this.routineService.routines;
  showAddDialog = signal(false);

  selectedRoutineId = signal<string | null>(null);

  habits = signal<HabitWithStatus[]>([]);
  constructor() {
    effect(() => {
      if (!this.selectedRoutineId()) {
        this.habits.set(this.habitService.getHabits() ?? []);
      }
    });
  }

  completedToday = computed(() => this.habits().filter((h) => h.completed).length);

  totalHabits = computed(() => this.habits().length);

  totalStreak = computed(() => this.habits().reduce((sum, h) => sum + h.streak, 0));

  longestStreak = computed(() => {
    const streaks = this.habits().map((h) => h.streak);
    return streaks.length ? Math.max(...streaks) : 0;
  });

  progressPercent = computed(() => {
    const total = this.totalHabits();
    return total > 0 ? (this.completedToday() / total) * 100 : 0;
  });

  onToggleHabit(id: string) {
    this.habitService.toggleCompletion(id);
  }

  onDeleteHabit(id: string) {
    if (confirm('Are you sure you want to delete this habit?')) {
      this.habitService.deleteHabit(id);
    }
  }

  onHabitClick(id: string) {
    this.router.navigate(['/habit', id]);
  }

  openAddDialog() {
    this.showAddDialog.set(true);
  }

  closeAddDialog() {
    this.showAddDialog.set(false);
  }

  async onAddHabit(formData: HabitFormData) {
    await this.habitService.addHabit(formData);
    this.closeAddDialog();
  }
  async loadRoutineHabitsWithStatus(routineId: string) {
    const habits = this.habitRoutineService.getRoutineSignal(routineId)() ?? [];

    const mapped = await Promise.all(habits.map((h) => this.habitService.mapToHabitWithStatus(h)));

    this.habits.set(mapped);
  }

  async selectRoutine(routineId: string | null) {
    this.selectedRoutineId.set(routineId);

    if (!routineId) return;

    await this.habitRoutineService.loadByRoutine(routineId);
    await this.loadRoutineHabitsWithStatus(routineId);
  }
}
