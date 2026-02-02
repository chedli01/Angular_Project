import { inject, Injectable, signal } from '@angular/core';
import {
  Habit,
  HabitFormData,
  HabitCompletion,
  HabitWithStatus,
} from '../../shared/models/habit.model';
import { supabase } from '../supabase/supabase.config';
import { AutomationService } from './automation.service';

@Injectable({
  providedIn: 'root',
})
export class HabitDataService {
  private habits = signal<HabitWithStatus[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  private automationService = inject(AutomationService)

  getHabits = this.habits.asReadonly();
  getLoading = this.loading.asReadonly();
  getError = this.error.asReadonly();

  constructor() {
    this.loadHabits();
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private calculateStreak(completions: HabitCompletion[]): number {
    if (completions.length === 0) return 0;

    const sortedCompletions = completions
      .filter((c) => c.completed)
      .sort((a, b) => b.date.localeCompare(a.date));

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i].date + 'T00:00:00');
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (completionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async mapToHabitWithStatus(habit: Habit): Promise<HabitWithStatus> {
    const todayDate = this.getTodayDate();

    const { data: completions, error } = await supabase
      .from('habit_completions')
      .select('habit_id, date, completed')
      .eq('habit_id', habit.id);

    if (error) {
      console.error('Error fetching completions:', error);
      return {
        ...habit,
        completed: false,
        streak: 0,
      };
    }

    const todayCompletion = (completions || []).find((c) => c.date === todayDate);
    const isCompletedToday = todayCompletion?.completed ?? false;

    const streak = this.calculateStreak(completions || []);

    return {
      ...habit,
      completed: isCompletedToday,
      streak,
    };
  }

  async loadHabits() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data: habits, error } = await supabase
        .from('habits')
        .select('id, name, icon, color, description, user_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const habitsWithStatus = await Promise.all(
        (habits || []).map((habit) => this.mapToHabitWithStatus(habit)),
      );

      this.habits.set(habitsWithStatus);
    } catch (err) {
      console.error('Error loading habits:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to load habits');
    } finally {
      this.loading.set(false);
    }
  }

  async addHabit(data: HabitFormData): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase.from('habits').insert({
        name: data.name,
        icon: data.icon,
        color: data.color,
        description: data.description,
        user_id: user.id,
      });

      if (error) throw error;

      await this.loadHabits();
    } catch (err) {
      console.error('Error adding habit:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to add habit');
    }
  }

  async toggleCompletion(id: string) {
    const todayDate = this.getTodayDate();
    const habit = this.habits().find((h) => h.id === id);

    if (!habit) return;

    const newCompletedState = !habit.completed;

    this.habits.update((habits) =>
      habits.map((h) =>
        h.id === id
          ? {
              ...h,
              completed: newCompletedState,
              streak: newCompletedState ? h.streak + 1 : Math.max(0, h.streak - 1),
            }
          : h,
      ),
    );

    try {
      const { error } = await supabase.from('habit_completions').upsert({
        habit_id: id,
        date: todayDate,
        completed: newCompletedState,
      });

      if (error) throw error;
      await this.automationService.checkHabitEvent(id,newCompletedState,new Date())
    } catch (err) {
      console.error('Error toggling completion:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to toggle completion');

      this.habits.update((habits) =>
        habits.map((h) =>
          h.id === id ? { ...h, completed: !newCompletedState, streak: habit.streak } : h,
        ),
      );
    }
  }

  async deleteHabit(id: string) {
    try {
      const { error: completionsError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', id);

      if (completionsError) throw completionsError;

      const { error: habitError } = await supabase.from('habits').delete().eq('id', id);

      if (habitError) throw habitError;

      this.habits.update((habits) => habits.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
      this.error.set(err instanceof Error ? err.message : 'Failed to delete habit');
    }
  }

  getHabitById(id: string): HabitWithStatus | undefined {
    return this.habits().find((h) => h.id === id);
  }
}
