import { Component, Input } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Habit } from '@app/shared/models/habit.model';
@Component({
  selector: 'app-habit-routine',
  imports: [CdkDrag],
  templateUrl: './habit-routine.html',
  styleUrl: './habit-routine.css',
})
export class HabitRoutineComponent {
  @Input() habit!: Habit;
}
