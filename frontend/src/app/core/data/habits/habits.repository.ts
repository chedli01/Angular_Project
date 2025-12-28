import { Injectable } from '@angular/core';
import { supabase } from '../../supabase/supabase.config';

export type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  created_at: string;
};

@Injectable({ providedIn: 'root' })
export class HabitsRepository {
  async getCompletedHabitsCountForMonth(
    year: number,
    month: number
  ): Promise<Record<string, number>> {
    const from = new Date(year, month, 1).toISOString().slice(0, 10);
    const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('habit_completions')
      .select('date')
      .eq('completed', true)
      .gte('date', from)
      .lte('date', to);

    console.log('Supabase rows:', data, 'error:', error);
    if (error) throw error;

    const map: Record<string, number> = {};

    for (const row of data ?? []) {
      map[row.date] = (map[row.date] ?? 0) + 1;
    }

    return map;
  }

  async getCompletedHabitsForDay(date: string): Promise<Habit[]> {
    // relies on FK relationship habit_completions.habit_id -> habits.id
    // and uses Supabase nested select
    const { data, error } = await supabase
      .from('habit_completions')
      .select(
        `
        habits:habit_id (
          id,
          name,
          description,
          icon,
          color,
          created_at
        )
      `
      )
      .eq('date', date)
      .eq('completed', true);

    if (error) throw error;

    // data is array of { habits: Habit | null }
    console.log('Supabase rows:', data, 'error:', error);
    return (data ?? [])
      .map((row: any) => row.habits as Habit | null)
      .filter((h: Habit | null): h is Habit => !!h);
  }

  async getNotCompletedHabitsForDay(date: string): Promise<Habit[]> {
    // Fetch completed habit ids for that date
    const { data: completedRows, error: completedErr } = await supabase
      .from('habit_completions')
      .select('habit_id')
      .eq('date', date)
      .eq('completed', true);

    if (completedErr) throw completedErr;

    const completedIds = (completedRows ?? []).map((r: any) => r.habit_id);

    // Fetch all habits, excluding completed ones
    // If completedIds is empty, just return all habits
    let query = supabase.from('habits').select('id, name, description, icon, color, created_at');

    if (completedIds.length > 0) {
      query = query.not('id', 'in', `(${completedIds.join(',')})`);
    }

    const { data: notCompleted, error: habitsErr } = await query;

    if (habitsErr) throw habitsErr;
    console.log('Supabase rows:', notCompleted, 'error:', habitsErr);

    return (notCompleted ?? []) as Habit[];
  }
}
