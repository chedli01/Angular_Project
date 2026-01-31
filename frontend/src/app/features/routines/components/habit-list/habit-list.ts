import { Component, Input } from '@angular/core';
import { Habit } from '@app/shared/models/habit.model';
import { HabitRoutineComponent } from '../habit-routine/habit-routine';
import { CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-habits-list',
  imports: [HabitRoutineComponent, CdkDropList],
  templateUrl: './habit-list.html',
})
export class HabitListComponent {
  @Input() habits: Habit[] = [];
}
