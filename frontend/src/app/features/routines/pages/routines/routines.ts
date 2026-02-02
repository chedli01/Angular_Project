import { Component, inject, signal, computed, effect } from '@angular/core';
import { RoutineService } from '@app/core/services/routines.service';
import { Routine } from '@app/shared/models/routine.model';
import { AddRoutine } from '../../components/add-routine/add-routine';
import { EditRoutine } from '../../components/edit-routine/edit-routine';
import { RoutineCard } from '../../components/routine-card/routine-card';
import { CommonModule } from '@angular/common';
import { Habit } from '@app/shared/models/habit.model';
import { HabitListComponent } from '../../components/habit-list/habit-list';
import { HabitDataService } from '@app/core/services/habit-data.service';

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [AddRoutine, EditRoutine, RoutineCard, CommonModule, HabitListComponent],
  templateUrl: './routines.html',
  styleUrls: ['./routines.css'],
})
export class Routines {
  private routineService = inject(RoutineService);
  private habitService = inject(HabitDataService);
  routines = signal<Routine[]>([]);
  readonly habitsListId = 'available-habits-list';
  readonly routineDropListIds = computed(() =>
    this.routines().map((routine) => this.getRoutineDropListId(routine.id)),
  );
  showAddDialog = signal(false);
  showEditDialog = signal(false);
  routineToEdit = signal<Routine | null>(null);
  allHabits = this.habitService.getHabits;
  constructor() {
    this.routineService.routines$.subscribe(async (r) => {
      this.routines.set(r);
    });
  }

  openAddDialog() {
    this.showAddDialog.set(true);
  }

  closeAddDialog() {
    this.showAddDialog.set(false);
  }

  openEditDialog(routine: Routine) {
    this.routineToEdit.set(routine);
    this.showEditDialog.set(true);
  }

  closeEditDialog() {
    this.showEditDialog.set(false);
    this.routineToEdit.set(null);
  }

  async deleteRoutine(id: string) {
    await this.routineService.deleteRoutine(id);
  }

  async toggleActiveRoutine(id: string) {
    await this.routineService.toggleActiveRoutine(id);
  }

  editRoutine(routine: Routine) {
    this.openEditDialog(routine);
  }

  getRoutineDropListId(routineId: string) {
    return `routine-drop-${routineId}`;
  }
}
