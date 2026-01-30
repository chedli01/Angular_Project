import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routine } from '@app/shared/models/routine.model';
import { RoutineService } from '@app/core/services/routines.service';

@Component({
  selector: 'app-routine-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './routine-card.html',
  styleUrls: ['./routine-card.css'],
})
export class RoutineCard {
  // Input signal for the routine
  routine = input.required<Routine>();

  private routineService = inject(RoutineService);

  deleteRoutine() {
    this.routineService.deleteRoutine(this.routine().id);
  }
}