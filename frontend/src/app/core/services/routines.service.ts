import { Injectable, signal } from '@angular/core';
import { MOCK_ROUTINES } from '@app/shared/data/mock-routines';
import { Routine, RoutineFormData } from '@app/shared/models/routine.model';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private routines = signal<Routine[]>(MOCK_ROUTINES);

  getRoutines = this.routines.asReadonly();

  addRoutine(data: RoutineFormData): Routine {
    const newRoutine: Routine = {
      ...data,
      id: crypto.randomUUID(),
      color: '#6366F1',
      icon:'✨',
      completed: false,
      streak: 0,
      createdAt: new Date()
    };
    
    this.routines.update(routines => [...routines, newRoutine]);
    return newRoutine;
  }

  toggleCompletion(id: string) {
    this.routines.update(routines =>
      routines.map(h => h.id === id 
        ? { 
            ...h, 
            completed: !h.completed,
            streak: !h.completed ? h.streak + 1 : h.streak
          }
        : h
      )
    );
  }

  deleteRoutine(id: string) {
    this.routines.update(routines => routines.filter(r => r.id !== id));
  }

  getRoutineById(id: string): Routine | undefined {
    return this.routines().find(r => r.id === id);
  }

  // testing purpose
  resetToMockData() {
    this.routines.set([...MOCK_ROUTINES]);
  }
}
