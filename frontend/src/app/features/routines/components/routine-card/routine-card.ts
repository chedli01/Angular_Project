import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routine } from '@app/shared/models/routine.model';
import { ClickOutsideDirective } from '@app/shared/directives/click-outside.directive';

@Component({
  selector: 'app-routine-card',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './routine-card.html',
  styleUrls: ['./routine-card.css'],
})
export class RoutineCard {
  routine = input.required<Routine>();
  delete = output<string>();
  edit = output<Routine>();
  showMenu = signal(false);

  toggleMenu() {
    this.showMenu.set(!this.showMenu());
  }

  onEdit() {
    this.edit.emit(this.routine());
    this.showMenu.set(false);
  }

  onDelete() {
    this.delete.emit(this.routine().id);
    this.showMenu.set(false);
  }
  
  closeMenu() {
    this.showMenu.set(false);
  }
}