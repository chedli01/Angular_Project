import { Component, inject, input, output, signal } from '@angular/core';
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
  habits = input<Habit[]>([]);
  private habitRoutineService = inject(HabitRoutineService);
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

    const alreadyExists = this.habits().some((habitt) => habitt.id === habit.id);

    if (alreadyExists) return;

    await this.habitRoutineService.add(habit.id, this.routine().id);
  }
}
