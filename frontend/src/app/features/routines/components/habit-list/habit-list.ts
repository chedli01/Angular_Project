import { Component, Input, inject } from '@angular/core';
import { Habit } from '@app/shared/models/habit.model';
import { HabitRoutineComponent } from '../habit-routine/habit-routine';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { HabitRoutineService } from '@app/core/services/habit-routine.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-habits-list',
  imports: [HabitRoutineComponent, CdkDropList, FormsModule],
  templateUrl: './habit-list.html',
})
export class HabitListComponent {
  @Input() habits: Habit[] = [];
  @Input() dropListId = 'available-habits-list';
  @Input() connectedDropLists: string[] = [];

  search = '';

  private habitRoutineService = inject(HabitRoutineService);

  filteredHabits() {
    const q = this.search.toLowerCase().trim();
    if (!q) return this.habits;

    return this.habits.filter(
      (habit) =>
        habit.name.toLowerCase().includes(q) || habit.description?.toLowerCase().includes(q),
    );
  }

  async onDrop(event: CdkDragDrop<unknown, unknown, Habit>) {
    const previousId = event.previousContainer.id;
    if (!previousId || previousId === this.dropListId || !previousId.startsWith('routine-drop-')) {
      return;
    }

    const habit = event.item.data as Habit;
    const routineId = previousId.replace('routine-drop-', '');

    try {
      await this.habitRoutineService.delete(habit.id, routineId);
    } catch (err) {
      console.error('Failed to remove habit from routine', err);
    }
  }
}
