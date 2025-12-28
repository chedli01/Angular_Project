import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

@Component({
  selector: 'app-habit-list-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-list-section.component.html',
})
export class HabitListSectionComponent {
  @Input() title!: string;
  @Input() habits: Habit[] = [];
  @Input() emptyText = 'No habits';
  @Input() completed = false;
}
