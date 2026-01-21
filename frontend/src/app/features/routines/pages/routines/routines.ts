import { Component, inject, signal, effect } from '@angular/core';
import { RoutineService } from '@app/core/services/routines.service'; 
import { RoutineType } from '@app/shared/enums/routineType.enum';
import { Routine } from '@app/shared/models/routine.model';

@Component({
  selector: 'app-routines',
  templateUrl: './routines.html',
  styleUrls: ['./routines.css'],
})
export class Routines {
  private routineService = inject(RoutineService);

  routines = signal<Routine[]>([]);
  showAddDialog = signal(false);

  RoutineType = RoutineType;

  form = signal({
    name: '',
    description: '',
    type: RoutineType.Morning,
  });

  constructor() {
    // auto-update routines signal whenever service emits
    effect(() => {
      this.routineService.routines$.subscribe((r) => this.routines.set(r));
    });
  }

  openAddDialog() {
    this.showAddDialog.set(true);
  }

  closeAddDialog() {
    this.showAddDialog.set(false);
    this.resetForm();
  }

  resetForm() {
    this.form.set({
      name: '',
      description: '',
      type: RoutineType.Morning,
    });
  }

  async createRoutine() {
    if (!this.form().name.trim()) return;

    await this.routineService.addRoutine(this.form());
    this.closeAddDialog();
  }

  updateName(value: string) {
    this.form.update((f) => ({ ...f, name: value }));
  }

  updateDescription(value: string) {
    this.form.update((f) => ({ ...f, description: value }));
  }

  updateType(value: RoutineType) {
    this.form.update((f) => ({ ...f, type: value }));
  }

  async deleteRoutine(id: string) {
    await this.routineService.deleteRoutine(id);
  }
}
