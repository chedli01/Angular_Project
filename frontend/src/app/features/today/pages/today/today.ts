import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HabitDataService } from '../../../../core/services/habit-data.service';
import { HabitFormData } from '../../../../shared/models/habit.model';

@Component({
  selector: 'app-today',
  imports: [CommonModule],
  templateUrl: './today.html',
  styleUrl: './today.css',
})
export class Today {
  public habitService = inject(HabitDataService);
  private router = inject(Router);

  habits = this.habitService.getHabits;
  loading = this.habitService.getLoading;
  error = this.habitService.getError;
  showAddDialog = signal(false);

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
}
