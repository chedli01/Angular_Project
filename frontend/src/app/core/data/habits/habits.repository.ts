import { Injectable } from '@angular/core';
import { supabase } from '../../supabase/supabase.config';

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
}
