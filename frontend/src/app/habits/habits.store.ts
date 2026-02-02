import { Injectable, signal, computed } from '@angular/core';
import { supabase } from '../core/supabase/supabase.config';
import { Habit } from './habit.model';
import { HabitCompletion } from './habit-completion.model';
import { computeHabitStats } from './habit.selectors';
import { HabitWithStats } from './habit-with-stats.model';

@Injectable({ providedIn: 'root' })
export class HabitsStore {



  private readonly _habits = signal<Habit[]>([]);
  private readonly _completions = signal<HabitCompletion[]>([]);

  readonly habits = this._habits.asReadonly();
  readonly completions = this._completions.asReadonly();


  readonly habitsWithStats = computed<HabitWithStats[]>(() =>
    this._habits().map(habit => {
      const completionDates = this._completions()
        .filter(c => c.habitId === habit.id && c.completed)
        .map(c => c.date);

      return computeHabitStats(habit, completionDates);
    })
  );

  habitById(id: string) {
    return computed(() =>
      this.habitsWithStats().find(h => h.id === id)
    );
  }

  async load() {
    const [{ data: habits, error: habitsError },
           { data: completions, error: completionsError }] =
      await Promise.all([
        supabase.from('habits').select('*'),
        supabase.from('habit_completions').select('*')
      ]);

    if (habitsError) throw habitsError;
    if (completionsError) throw completionsError;

    this._habits.set(
      habits.map(h => ({
        id: h.id,
        userId: h.user_id,
        name: h.name,
        description: h.description,
        icon: h.icon,
        color: h.color,
        createdAt: h.created_at
      }))
    );

    this._completions.set(
      completions.map(c => ({
        habitId: c.habit_id,
        date: c.date,
        completed: c.completed
      }))
    );
  }
}