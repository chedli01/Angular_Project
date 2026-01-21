import { Component, inject, signal, effect, computed } from '@angular/core';
import { RoutineService } from '@app/core/services/routines.service'; 
import { RoutineType } from '@app/shared/enums/routineType.enum';
import { IconKey } from '@app/shared/enums/iconKey.enum';
import { Routine } from '@app/shared/models/routine.model';

@Component({
  selector: 'app-routines',
  templateUrl: './routines.html',
  styleUrls: ['./routines.css'],
})
export class Routines {
  private routineService = inject(RoutineService);

  routines = signal<Routine[]>([]);
  showAddDialog = signal(false);
  
  // Use a computed property for icon options
  iconOptions = this.routineService.getIconOptions();

  // Add a computed property for selected icon label
  selectedIconLabel = computed(() => {
    const selectedIcon = this.iconOptions.find(opt => opt.key === this.form().iconKey);
    return selectedIcon ? selectedIcon.label : 'Star';
  });

  RoutineType = RoutineType;
  IconKey = IconKey;

  form = signal({
    name: '',
    description: '',
    type: RoutineType.Morning,
    iconKey: IconKey.Star,
  });

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
    this.resetForm();
  }

  resetForm() {
    this.form.set({
      name: '',
      description: '',
      type: RoutineType.Morning,
      iconKey: IconKey.Star,
    });
  }

  async createRoutine() {
    if (!this.form().name.trim()) return;

    await this.routineService.addRoutine(this.form());
    this.closeAddDialog();
  }

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
    // Convert string to IconKey enum
    this.form.update((f) => ({ ...f, iconKey: value as IconKey }));
  }

  getSelectedIconEmoji(): string {
    return this.routineService.getIconForKey(this.form().iconKey);
  }

  async deleteRoutine(id: string) {
    await this.routineService.deleteRoutine(id);
  }
}