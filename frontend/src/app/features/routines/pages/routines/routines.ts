import { Component, inject, signal, effect } from '@angular/core';
import { RoutineService } from '@app/core/services/routines.service'; 
import { Routine } from '@app/shared/models/routine.model';
import { AddRoutine } from '../../components/add-routine/add-routine';
import { EditRoutine } from '../../components/edit-routine/edit-routine';
import { RoutineCard } from '../../components/routine-card/routine-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [AddRoutine, EditRoutine, RoutineCard, CommonModule],
  templateUrl: './routines.html',
  styleUrls: ['./routines.css'],
})
export class Routines {
  private routineService = inject(RoutineService);

  routines = signal<Routine[]>([]);
  showAddDialog = signal(false);
  showEditDialog = signal(false);
  routineToEdit = signal<Routine | null>(null);

  constructor() {
    effect(() => {
      this.routineService.routines$.subscribe((r) => this.routines.set(r));
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
}