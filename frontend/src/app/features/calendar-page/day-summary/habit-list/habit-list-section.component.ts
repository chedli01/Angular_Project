import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

@Component({
  selector: 'app-habit-list-section',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './habit-list-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitListSectionComponent {
  @Input() title!: string;
  @Input() habits: Habit[] = [];
  @Input() emptyText = 'No habits';
  @Input() completed = false;
}
