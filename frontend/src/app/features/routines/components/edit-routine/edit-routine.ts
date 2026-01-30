import { Component, inject, signal, input, output, effect } from '@angular/core';
import { RoutineService } from '@app/core/services/routines.service';
import { Routine } from '@app/shared/models/routine.model';
import { RoutineType } from '@app/shared/enums/routineType.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-routine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-routine.html',
})
export class EditRoutine {
  private routineService = inject(RoutineService);

  routine = input.required<Routine>();

  close = output<void>();

  routineUpdated = output<void>();

  form = signal({
    name: '',
    description: '',
    type: RoutineType.Morning,
    custom_time_text: '',
    active: true,
  });

  RoutineType = RoutineType;

  constructor() {
    effect(() => {
      const r = this.routine();
      this.form.set({
        name: r.name,
        description: r.description || '',
        type: r.type,
        custom_time_text: r.custom_time_text || '',
        active: r.active,
      });
    });
  }

  updateName(value: string) {
    this.form.update((f) => ({ ...f, name: value }));
  }

  updateDescription(value: string) {
    this.form.update((f) => ({ ...f, description: value }));
  }

  updateType(value: RoutineType) {
    this.form.update((f) => ({
      ...f,
      type: value,
      custom_time_text: value === RoutineType.Custom ? f.custom_time_text : '',
    }));
  }

  updateCustomType(value: string) {
    this.form.update((f) => ({ ...f, custom_time_text: value }));
  }

  toggleActive() {
    this.form.update((f) => ({ ...f, active: !f.active }));
  }

  async updateRoutine() {
    if (!this.form().name.trim()) return;
    
    try {
      await this.routineService.updateRoutine(this.routine().id, this.form());
      this.routineUpdated.emit();
      this.close.emit();
    } catch (error) {
      console.error('Failed to update routine', error);
    }
  }

  onCancel() {
    this.close.emit();
  }
}