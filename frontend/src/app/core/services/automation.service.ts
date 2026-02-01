// automation.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { supabase } from '../supabase/supabase.config';
import { AutomationRule, TriggerType, ActionType } from '@app/shared/models/automation.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AutomationService {

  private rulesSubject = new BehaviorSubject<AutomationRule[]>([]);
  rules$ = this.rulesSubject.asObservable();

  constructor(private auth: AuthService) {
    this.loadRules();
  }

  // ─── CRUD ────────────────────────────────────────────────────────────

  async loadRules() {
    const userId = this.auth.userId();
    if (!userId) {
      this.rulesSubject.next([]);
      return;
    }

    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase load automation rules failed', error);
      return;
    }

    this.rulesSubject.next(data || []);
  }

  async createRule(rule: Omit<AutomationRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const userId = this.auth.userId();
    if (!userId) throw new Error('User not authenticated');

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('automation_rules')
      .insert([{
        ...rule,
        user_id: userId,
        created_at: now,
        updated_at: now
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase create automation rule failed', error);
      throw error;
    }

    this.rulesSubject.next([data, ...this.rulesSubject.value]);
    return data;
  }

  async deleteRule(id: string) {
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase delete automation rule failed', error);
      throw error;
    }

    this.rulesSubject.next(this.rulesSubject.value.filter(r => r.id !== id));
  }

  async toggleRule(id: string, enabled: boolean) {
    const { error } = await supabase
      .from('automation_rules')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase toggle rule failed', error);
      throw error;
    }

    this.rulesSubject.next(
      this.rulesSubject.value.map(r => r.id === id ? { ...r, enabled } : r)
    );
  }

  // ─── EVALUATION ENGINE ───────────────────────────────────────────────

  /**
   * Call this whenever a habit is completed or missed.
   * It checks all enabled rules and fires actions if conditions are met.
   */
  async checkHabitEvent(habitId: string, completed: boolean, date: Date) {
    const rules = this.rulesSubject.getValue().filter(r => r.enabled);

    for (const rule of rules) {
      const triggerMatches =
        (rule.trigger.type === TriggerType.HABIT_MISSED && rule.trigger.habit_id === habitId && !completed) ||
        (rule.trigger.type === TriggerType.HABIT_COMPLETED && rule.trigger.habit_id === habitId && completed);

      if (!triggerMatches) continue;

      const conditionMet = await this.checkCondition(rule, habitId, date);
      if (conditionMet) {
        await this.executeAction(rule);
      }
    }
  }

  /**
   * Checks: "has this habit been missed/completed X times in Y days?"
   */
  private async checkCondition(rule: AutomationRule, habitId: string, date: Date): Promise<boolean> {
    const { times, in_days } = rule.condition;

    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - in_days);

    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', date.toISOString().split('T')[0]);

    if (error) {
      console.error('❌ Supabase check condition failed', error);
      return false;
    }

    // Count based on trigger type
    const isMissedTrigger = rule.trigger.type === TriggerType.HABIT_MISSED;
    const count = isMissedTrigger
      ? (data?.filter(d => !d.completed).length || 0)
      : (data?.filter(d => d.completed).length || 0);

    return count >= times;
  }

  private async executeAction(rule: AutomationRule) {
    const { action } = rule;

    switch (action.type) {
      case ActionType.SHOW_ALERT:
        alert(action.message || 'Automation rule triggered!');
        break;

      case ActionType.SEND_NOTIFICATION:
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Habit Automation', {
            body: action.message || 'A rule has been triggered!',
            icon: '/favicon.ico'
          });
        }
        break;

      case ActionType.DISABLE_ROUTINE:
        if (action.routine_id) {
          const { error } = await supabase
            .from('routines')
            .update({ active: false })
            .eq('id', action.routine_id);

          if (error) {
            console.error('❌ Supabase disable routine failed', error);
          }
        }
        break;
    }
  }
}