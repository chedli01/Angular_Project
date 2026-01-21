import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RoutineService } from '@app/core/services/routines.service';
import { RoutineType } from '@app/shared/enums/routineType.enum';

@Component({
  selector: 'app-routines',
  imports: [CommonModule],
  templateUrl: './routines.html',
  styleUrl: './routines.css',
})
export class Routines {
  private routineService = inject(RoutineService);

  routines = this.routineService.getRoutines;
  showAddDialog = signal(false);

  // expose enum to template
  RoutineType = RoutineType;

  // simple form state
  form = signal({
    name: '',
    description: '',
    type: RoutineType.Morning
  });

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
      type: RoutineType.Morning
    });
  }

  createRoutine() {
    if (!this.form().name.trim()) return;

    this.routineService.addRoutine(this.form());
    console.log('✅ Routine created');

    this.closeAddDialog();
  }
  // routines.ts
updateName(value: string) {
  this.form.update(f => ({ ...f, name: value }));
}

updateDescription(value: string) {
  this.form.update(f => ({ ...f, description: value }));
}

updateType(value: RoutineType) {
  this.form.update(f => ({ ...f, type: value }));
}

}
