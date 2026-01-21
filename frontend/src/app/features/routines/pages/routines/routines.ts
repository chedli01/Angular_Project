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

  openAddDialog() {
    this.showAddDialog.set(true);
  }

  closeAddDialog() {
    this.showAddDialog.set(false);
  }

  createRoutine() {
    this.routineService.addRoutine({
      name: 'New Routine',
      description: 'My new routine',
      type:RoutineType.Morning
    });

    console.log('✅ Habit created from Routines');
    this.closeAddDialog();
  }


}
