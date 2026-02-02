import { Injectable, signal, WritableSignal } from '@angular/core';
import { Habit } from '../../shared/models/habit.model';
import { supabase } from '../supabase/supabase.config';

@Injectable({
  providedIn: 'root',
})
export class HabitRoutineService {
  private routineHabitsMap: Record<string, WritableSignal<Habit[]>> = {};

  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  getLoading = this.loading.asReadonly();
  getError = this.error.asReadonly();

  getRoutineSignal(routineId: string): WritableSignal<Habit[]> {
    if (!this.routineHabitsMap[routineId]) {
      this.routineHabitsMap[routineId] = signal<Habit[]>([]);
    }
    return this.routineHabitsMap[routineId];
  }

  async loadByRoutine(routineId: string): Promise<Habit[]> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await supabase
        .from('routine_habits')
        .select('*, habits(*)')
        .eq('routine_id', routineId);

      if (error) throw error;

      const habits: Habit[] = (data || []).map((hr: any) => hr.habits);

      this.getRoutineSignal(routineId).set(habits); // ✅ writable now
      return habits;
    } catch (err: any) {
      console.error(err);
      this.error.set(err.message || 'Failed to load habits');
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async add(habitId: string, routineId: string) {
    const signal = this.getRoutineSignal(routineId);

    try {
      const { data, error } = await supabase
        .from('routine_habits')
        .insert({ habit_id: habitId, routine_id: routineId })
        .select('*, habits(*)')
        .single();

      if (error) throw error;

      const habit = data.habits;
      signal.set([...signal(), habit]);
    } catch (err: any) {
      console.error(err);
      signal.set(signal().filter((h) => h.id !== habitId)); // rollback
    }
  }

  async delete(habitId: string, routineId: string) {
    const signal = this.getRoutineSignal(routineId);
    const previous = signal();
    signal.set(previous.filter((h) => h.id !== habitId)); // optimistic update

    try {
      const { error } = await supabase
        .from('routine_habits')
        .delete()
        .eq('routine_id', routineId)
        .eq('habit_id', habitId);

      if (error) throw error;
    } catch (err: any) {
      signal.set(previous); // rollback on failure
      console.error(err);
    }
  }

  exists(habitId: string, routineId: string): boolean {
    return this.getRoutineSignal(routineId)().some((h) => h.id === habitId);
  }
}
