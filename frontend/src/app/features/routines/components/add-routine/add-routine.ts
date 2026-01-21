import { Component, inject, signal, computed, output } from '@angular/core';
import { RoutineService } from '@app/core/services/routines.service';
import { RoutineType } from '@app/shared/enums/routineType.enum';
import { IconKey } from '@app/shared/enums/iconKey.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-routine',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './add-routine.html',
})
export class AddRoutine {
  private routineService = inject(RoutineService);

  // Outputs to communicate with parent
  close = output<void>();
  routineCreated = output<void>();

  // Form state
  form = signal({
    name: '',
    description: '',
    type: RoutineType.Morning,
    iconKey: IconKey.Star,
  });

  // Constants and Helpers
  RoutineType = RoutineType;
  iconOptions = this.routineService.getIconOptions();

  selectedIconLabel = computed(() => {
    const selectedIcon = this.iconOptions.find(opt => opt.key === this.form().iconKey);
    return selectedIcon ? selectedIcon.label : 'Star';
  });

  updateName(value: string) {
    this.form.update((f) => ({ ...f, name: value }));
  }

  updateDescription(value: string) {
    this.form.update((f) => ({ ...f, description: value }));
  }

  updateType(value: RoutineType) {
    this.form.update((f) => ({ ...f, type: value }));
  }

  updateIconKey(value: string) {
    this.form.update((f) => ({ ...f, iconKey: value as IconKey }));
  }

  getSelectedIconEmoji(): string {
    return this.routineService.getIconForKey(this.form().iconKey);
  }

  async createRoutine() {
    if (!this.form().name.trim()) return;
    try {
      await this.routineService.addRoutine(this.form());
      this.routineCreated.emit();
      this.close.emit();
    } catch (error) {
      console.error('Failed to create routine', error);
    }
  }

  onCancel() {
    this.close.emit();
  }
}