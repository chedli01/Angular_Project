import { Injectable, signal } from '@angular/core';
import { Habit, HabitFormData } from '../../shared/models/habit.model';
import { MOCK_HABITS } from '../../shared/data/mock-habits';

@Injectable({
  providedIn: 'root'
})
export class HabitDataService {
  private habits = signal<Habit[]>(MOCK_HABITS);

  getHabits = this.habits.asReadonly();

  addHabit(data: HabitFormData): Habit {
    const newHabit: Habit = {
      ...data,
      id: crypto.randomUUID(),
      completed: false,
      streak: 0,
      createdAt: new Date()
    };
    
    this.habits.update(habits => [...habits, newHabit]);
    return newHabit;
  }

  toggleCompletion(id: string) {
    this.habits.update(habits =>
      habits.map(h => h.id === id 
        ? { 
            ...h, 
            completed: !h.completed,
            streak: !h.completed ? h.streak + 1 : h.streak
          }
        : h
      )
    );
  }

  deleteHabit(id: string) {
    this.habits.update(habits => habits.filter(h => h.id !== id));
  }

  getHabitById(id: string): Habit | undefined {
    return this.habits().find(h => h.id === id);
  }

  // testing purpose
  resetToMockData() {
    this.habits.set([...MOCK_HABITS]);
  }
}
