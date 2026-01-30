import { Component, inject, signal, effect } from '@angular/core';
import { RoutineService } from '@app/core/services/routines.service'; 
import { Routine } from '@app/shared/models/routine.model';
import { AddRoutine } from '../../components/add-routine/add-routine'; // Import the new component
import { RoutineCard } from '../../components/routine-card/routine-card'; // Import RoutineCard
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-routines',
  standalone: true,
  imports: [AddRoutine, RoutineCard, CommonModule], // Add RoutineCard to imports
  templateUrl: './routines.html',
  styleUrls: ['./routines.css'],
})
export class Routines {
  private routineService = inject(RoutineService);

  routines = signal<Routine[]>([]);
  showAddDialog = signal(false);

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

  async deleteRoutine(id: string) {
    await this.routineService.deleteRoutine(id);
  }
}