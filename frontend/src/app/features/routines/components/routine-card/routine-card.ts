import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routine } from '@app/shared/models/routine.model';
import { ClickOutsideDirective } from '@app/shared/directives/click-outside.directive';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Habit } from '@app/shared/models/habit.model';
import { HabitRoutineComponent } from '../habit-routine/habit-routine';
import { HabitRoutineService } from '@app/core/services/habit-routine.service';

@Component({
  selector: 'app-routine-card',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective, CdkDropList, HabitRoutineComponent],
  templateUrl: './routine-card.html',
  styleUrls: ['./routine-card.css'],
})
export class RoutineCard {
  routine = input.required<Routine>();
  delete = output<string>();
  edit = output<Routine>();
  toggleActive = output<string>();
  showMenu = signal(false);
  dropListId = input.required<string>();
  connectedDropLists = input<string[]>([]);

  private habitRoutineService = inject(HabitRoutineService);

  habits = input<Habit[]>([]);

  toggleMenu() {
    this.showMenu.set(!this.showMenu());
  }

  onEdit() {
    this.edit.emit(this.routine());
    this.showMenu.set(false);
  }

  onDelete() {
    this.delete.emit(this.routine().id);
    this.showMenu.set(false);
  }

  onToggleActive() {
    this.toggleActive.emit(this.routine().id);
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  async onHabitDrop(event: CdkDragDrop<Habit[]>) {
    const habit = event.item.data as Habit;
    const routineId = this.routine().id;

    if (this.habitRoutineService.exists(habit.id, routineId)) {
      return;
    }
    try {
      await this.habitRoutineService.add(habit.id, routineId);
    } catch (error) {
      console.error('Failed to add habit to routine:', error);
      throw error;
    }
  }
}
