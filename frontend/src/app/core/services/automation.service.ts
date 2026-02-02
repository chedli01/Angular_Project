import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { supabase } from '../supabase/supabase.config';
import { AutomationRule, TriggerType, ActionType } from '@app/shared/models/automation.model';
import { AuthService } from './auth.service';
import { RoutineService } from './routines.service';

@Injectable({
  providedIn: 'root'
})
export class AutomationService {
  private auth = inject(AuthService);
  private routineService = inject(RoutineService);

  private rulesSubject = new BehaviorSubject<AutomationRule[]>([]);
  rules$ = this.rulesSubject.asObservable();
  
  rules = toSignal(this.rules$, { initialValue: [] as AutomationRule[] });

  private toastsSubject = new BehaviorSubject<any[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  toasts = toSignal(this.toasts$, { initialValue: [] as any[] });

  constructor() {
    this.loadRules();
  }

  async loadRules() {
    const userId = typeof this.auth.userId === 'function' ? this.auth.userId() : (this.auth as any).userId;
    
    if (!userId) {
      console.warn('⚠️ No userId found during loadRules. If this is on refresh, AuthService might still be initializing.');
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
    const userId = typeof this.auth.userId === 'function' ? this.auth.userId() : (this.auth as any).userId;
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

  async checkAllRules() {
    const userId = typeof this.auth.userId === 'function' ? this.auth.userId() : (this.auth as any).userId;
    if (!userId) return;

    const rules = this.rulesSubject.getValue().filter(r => r.enabled);
    const today = new Date().toISOString().split('T')[0];

    for (const rule of rules) {
      const lastFired = this.getLastFiredDate(rule.id);
      if (lastFired === today) {
        continue;
      }

      const conditionMet = await this.checkCondition(rule);
      if (conditionMet) {
        await this.executeAction(rule);
        this.markRuleFired(rule.id, today);
      }
    }
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
      console.error('❌ Supabase check condition failed', error);
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

  private async executeAction(rule: AutomationRule) {
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

  async checkHabitEvent(habitId: string, completed: boolean, date: Date) {
    const rules = this.rulesSubject.getValue().filter(r => r.enabled);

    for (const rule of rules) {
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

  private showToast(message: string, type: 'alert' | 'notification') {
    const toast = {
      id: crypto.randomUUID(),
      message,
      type,
      createdAt: new Date()
    };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => this.removeToast(toast.id), 8000);
  }

  removeToast(id: string) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }

  private sendBrowserNotification(message: string) {
    if ('Notification' in window) {
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
  }

  private getLastFiredDate(ruleId: string): string | null {
    return localStorage.getItem(`rule_fired_${ruleId}`);
  }

  private markRuleFired(ruleId: string, date: string) {
    localStorage.setItem(`rule_fired_${ruleId}`, date);
  }
}
