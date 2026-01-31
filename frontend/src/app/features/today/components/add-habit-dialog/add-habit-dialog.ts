import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HabitFormData } from '@app/shared/models/habit.model';

@Component({
  selector: 'app-add-habit-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-habit-dialog.html',
  styleUrl: './add-habit-dialog.css',
})
export class AddHabitDialog {
  close = output<void>();
  submit = output<HabitFormData>();
  name = signal('');
  description = signal('');
  selectedIcon = signal('📝');
  selectedColor = signal('#3B82F6');
  icons = ['📝', '💪', '📚', '🏃', '🧘', '💧', '🎯', '✍️', '🎨', '🎵', '🌱', '☀️'];
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

  onSubmit() {
    if (this.name().trim()) {
      this.submit.emit({
        name: this.name(),
        icon: this.selectedIcon(),
        color: this.selectedColor(),
        description: this.description() || undefined,
      });
    }
  }

  onClose() {
    this.close.emit();
  }
}
