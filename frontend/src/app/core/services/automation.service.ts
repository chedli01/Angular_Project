import { Injectable, inject, signal, computed } from '@angular/core';
import { supabase } from '../supabase/supabase.config';
import { AutomationRule, TriggerType, ActionType } from '@app/shared/models/automation.model';
import { AuthService } from './auth.service';
import { RoutineService } from './routines.service';

interface Toast {
  id: string;
  message: string;
  type: 'alert' | 'notification';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AutomationService {
  private auth = inject(AuthService);
  private routineService = inject(RoutineService);

  private _rules = signal<AutomationRule[]>([]);
  private _toasts = signal<Toast[]>([]);
  private _isLoading = signal<boolean>(false);

  readonly rules = this._rules.asReadonly();
  readonly toasts = this._toasts.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly activeRules = computed(() => 
    this._rules().filter(r => r.enabled)
  );
  
  readonly rulesCount = computed(() => this._rules().length);
  readonly activeRulesCount = computed(() => this.activeRules().length);

  constructor() {
    this.loadRules();
  }

  async loadRules(): Promise<void> {
    const userId = this.auth.userId();
    
    if (!userId) {
      console.warn('⚠️ No userId found during loadRules');
      this._rules.set([]);
      return;
    }

    this._isLoading.set(true);

    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this._rules.set(data || []);
    } catch (error) {
      console.error('❌ Failed to load automation rules', error);
      this._rules.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  async createRule(rule: Omit<AutomationRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<AutomationRule> {
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
      console.error('❌ Failed to create automation rule', error);
      throw error;
    }

    this._rules.update(rules => [data, ...rules]);
    return data;
  }

  async deleteRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Failed to delete automation rule', error);
      throw error;
    }

    // ✅ IMMUTABLE UPDATE
    this._rules.update(rules => rules.filter(r => r.id !== id));
  }

  async toggleRule(id: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('automation_rules')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('❌ Failed to toggle rule', error);
      throw error;
    }

    this._rules.update(rules =>
      rules.map(r => r.id === id ? { ...r, enabled } : r)
    );
  }

  async checkAllRules(): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];

    for (const rule of this.activeRules()) {
      const lastFired = this.getLastFiredDate(rule.id);
      if (lastFired === today) continue;

      const conditionMet = await this.checkCondition(rule);
      if (conditionMet) {
        await this.executeAction(rule);
        this.markRuleFired(rule.id, today);
      }
    }
  }

  async checkHabitEvent(habitId: string, completed: boolean, date: Date): Promise<void> {
    for (const rule of this.activeRules()) {
      const triggerMatches =
        (rule.trigger.type === TriggerType.HABIT_MISSED && rule.trigger.habit_id === habitId && !completed) ||
        (rule.trigger.type === TriggerType.HABIT_COMPLETED && rule.trigger.habit_id === habitId && completed);

      if (!triggerMatches) continue;

      const conditionMet = await this.checkCondition(rule);
      if (conditionMet) {
        await this.executeAction(rule);
      }
    }
  }

  removeToast(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private async checkCondition(rule: AutomationRule): Promise<boolean> {
    const { trigger, condition } = rule;
    const { times, in_days } = condition;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - in_days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', trigger.habit_id)
      .gte('date', startDateStr)
      .lte('date', todayStr);

    if (error) {
      console.error('❌ Failed to check condition', error);
      return false;
    }

    let count = 0;
    
    if (trigger.type === TriggerType.HABIT_MISSED) {
      const completedDates = new Set(
        (data || []).filter((c: any) => c.completed).map((c: any) => c.date)
      );

      for (let i = 0; i < in_days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (!completedDates.has(checkDateStr)) {
          count++;
        }
      }
    } else {
      count = (data || []).filter((c: any) => c.completed).length;
    }

    return count >= times;
  }

  private async executeAction(rule: AutomationRule): Promise<void> {
    const { action } = rule;

    switch (action.type) {
      case ActionType.SHOW_ALERT:
        this.showToast(action.message || 'Automation rule triggered!', 'alert');
        break;

      case ActionType.SEND_NOTIFICATION:
        this.sendBrowserNotification(action.message || 'Automation rule triggered!');
        this.showToast(action.message || 'Automation rule triggered!', 'notification');
        break;

      case ActionType.DISABLE_ROUTINE:
        if (action.routine_id) {
          await this.routineService.toggleActiveRoutine(action.routine_id);
          this.showToast(`Routine disabled by automation rule: ${rule.name}`, 'alert');
        }
        break;
    }
  }

  private showToast(message: string, type: 'alert' | 'notification'): void {
    const toast: Toast = {
      id: crypto.randomUUID(),
      message,
      type,
      createdAt: new Date()
    };

    this._toasts.update(toasts => [...toasts, toast]);
    
    // Auto-remove after 8 seconds
    setTimeout(() => this.removeToast(toast.id), 8000);
  }

  private sendBrowserNotification(message: string): void {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification('Habit Automation', {
        body: message,
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Habit Automation', {
            body: message,
            icon: '/favicon.ico'
          });
        }
      });
    }
  }

  private getLastFiredDate(ruleId: string): string | null {
    return localStorage.getItem(`rule_fired_${ruleId}`);
  }

  private markRuleFired(ruleId: string, date: string): void {
    localStorage.setItem(`rule_fired_${ruleId}`, date);
  }
}