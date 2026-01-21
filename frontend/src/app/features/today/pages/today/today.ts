import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HabitDataService } from '../../../../core/services/habit-data.service';

@Component({
  selector: 'app-today',
  imports: [CommonModule],
  templateUrl: './today.html',
  styleUrl: './today.css'
})
export class Today {
  private habitService = inject(HabitDataService);
  private router = inject(Router);

  habits = this.habitService.getHabits;
  showAddDialog = signal(false);

  completedToday = computed(() => 
    this.habits().filter(h => h.completed).length
  );

  totalHabits = computed(() => this.habits().length);

  totalStreak = computed(() => 
    this.habits().reduce((sum, h) => sum + h.streak, 0)
  );

  longestStreak = computed(() => {
    const streaks = this.habits().map(h => h.streak);
    return streaks.length ? Math.max(...streaks) : 0;
  });

  progressPercent = computed(() => {
    const total = this.totalHabits();
    return total > 0 ? (this.completedToday() / total) * 100 : 0;
  });

  onToggleHabit(id: string) {
    this.habitService.toggleCompletion(id);
    console.log('✅ Habit toggled:', id);
  }

  onDeleteHabit(id: string) {
    if (confirm('Delete this habit?')) {
      this.habitService.deleteHabit(id);
      console.log('🗑️ Habit deleted:', id);
    }
  }

  onHabitClick(id: string) {
  }

  openAddDialog() {
    this.showAddDialog.set(true);
    console.log('➕ Open add dialog');
  }

  closeAddDialog() {
    this.showAddDialog.set(false);
  }

  // For testing purposes
  resetData() {
    this.habitService.resetToMockData();
    console.log('🔄 Data reset to mock');
  }
}
