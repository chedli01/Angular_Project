import { Injectable, signal } from '@angular/core';
import { Habit } from '../../shared/models/habit.model';
import { HabitRoutine } from '../../shared/models/habit-routine.model';
import { supabase } from '../supabase/supabase.config';

@Injectable({
  providedIn: 'root',
})
export class HabitRoutineService {
  private routineHabits = signal<Record<string, Habit[]>>({});
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  getRoutineHabits = this.routineHabits.asReadonly();
  getLoading = this.loading.asReadonly();
  getError = this.error.asReadonly();

  /**
   * Load habits for a specific routine
   */
  async loadByRoutine(routineId: string): Promise<Habit[]> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await supabase
        .from('routine_habits')
        .select('*, habits(*)') // join habits table to get full habit info
        .eq('routine_id', routineId);

      if (error) throw error;

      const habits: Habit[] = (data || []).map((hr: any) => hr.habits); // adjust to your join structure
      this.routineHabits.update((map) => ({ ...map, [routineId]: habits }));
      return habits;
    } catch (err) {
      console.error('Error loading habit routines:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to load habit routines');
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Add a habit to a routine
   */
  async add(habitId: string, routineId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('routine_habits')
        .insert({ habit_id: habitId, routine_id: routineId })
        .select('*, habits(*)')
        .single();

      if (error) throw error;

      const habit: Habit = data.habits; // again adjust based on join
      this.routineHabits.update((map) => ({
        ...map,
        [routineId]: [...(map[routineId] || []), habit],
      }));
    } catch (err) {
      console.error('Error adding habit routine:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to add habit routine');
    }
  }

  /**
   * Delete a habit from a routine
   */
  async delete(id: string, routineId: string): Promise<void> {
    try {
      const { error } = await supabase.from('routine_habits').delete().eq('id', id);
      if (error) throw error;

      this.routineHabits.update((map) => ({
        ...map,
        [routineId]: (map[routineId] || []).filter((h) => h.id !== id),
      }));
    } catch (err) {
      console.error('Error deleting habit routine:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to delete habit routine');
    }
  }

  /**
   * Check if a habit exists in a routine
   */
  exists(habitId: string, routineId: string): boolean {
    return (this.routineHabits()[routineId] || []).some((h) => h.id === habitId);
  }
}
