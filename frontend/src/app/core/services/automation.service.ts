import { Injectable, inject, resource, signal } from '@angular/core';
import { supabase } from '../supabase/supabase.config';
import { AutomationRule, TriggerType, ActionType } from '@app/shared/models/automation.model';
import { AuthService } from './auth.service';
import { RoutineService } from './routines.service';

export interface Toast {
  id: string;
  message: string;
  type: 'alert' | 'notification';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AutomationService {
  private auth = inject(AuthService);
  private routineService = inject(RoutineService);

  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  rulesResource = resource({
    params: () => ({ userId: this.auth.userId() }),
    loader: async ({ params, abortSignal }) => {
      if (!params.userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('automation_rules')
          .select('*')
          .eq('user_id', params.userId)
          .order('created_at', { ascending: false })
          .abortSignal(abortSignal);
          
        if (error) throw error;
        return (data || []) as AutomationRule[];
      } catch (err) {
        console.error('Failed to load automation rules:', err);
        throw err;
      }
    },
  });

  readonly rules = this.rulesResource.value;
  readonly isLoading = this.rulesResource.isLoading;
  readonly error = this.rulesResource.error;

  async checkAllRules(): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];
    const activeRules = (this.rules() || []).filter(r => r.enabled);

    for (const rule of activeRules) {
      const lastFired = localStorage.getItem(`rule_fired_${rule.id}`);
      if (lastFired === today) continue;

      const conditionMet = await this.checkCondition(rule);
      if (conditionMet) {
        await this.executeAction(rule);
        localStorage.setItem(`rule_fired_${rule.id}`, today);
      }
    }
  }

  async checkHabitEvent(habitId: string, completed: boolean, date: Date = new Date()): Promise<void> {
    const activeRules = (this.rules() || []).filter(r => r.enabled);
    
    for (const rule of activeRules) {
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

  async createRule(rule: Omit<AutomationRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) throw new Error('User not authenticated');
    
    const now = new Date().toISOString();
    const newRule: AutomationRule = {
      ...rule,
      id: crypto.randomUUID(),
      user_id: userId,
      created_at: now,
      updated_at: now,
    };

    const current = this.rulesResource.value() || [];
    this.rulesResource.update(() => [newRule, ...current]);

    try {
      const { error } = await supabase.from('automation_rules').insert([newRule]);
      if (error) throw error;
    } catch (error) {
      this.rulesResource.reload();
      throw error;
    }
  }

  async deleteRule(id: string): Promise<void> {
    const current = this.rulesResource.value();
    if (!current) return;

    const updatedRules = current.filter(r => r.id !== id);
    this.rulesResource.update(() => updatedRules);

    try {
      const { error } = await supabase.from('automation_rules').delete().eq('id', id);
      if (error) throw error;      
      localStorage.removeItem(`rule_fired_${id}`);
    } catch (error) {
      this.rulesResource.reload();
      throw error;
    }
  }

  async toggleRule(id: string, enabled: boolean): Promise<void> {
    const current = this.rulesResource.value();
    if (!current) return;

    const ruleIndex = current.findIndex(r => r.id === id);
    if (ruleIndex === -1) return;

    const now = new Date().toISOString();

    const updatedRules = [...current];
    updatedRules[ruleIndex] = {
      ...updatedRules[ruleIndex],
      enabled,
      updated_at: now,
    };
    this.rulesResource.update(() => updatedRules);

    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ enabled, updated_at: now })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      this.rulesResource.reload();
      throw error;
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

    if (error) return false;

    let count = 0;
    if (trigger.type === TriggerType.HABIT_MISSED) {
      const completedDates = new Set((data || []).filter((c: any) => c.completed).map((c: any) => c.date));
      for (let i = 0; i < in_days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        if (!completedDates.has(checkDate.toISOString().split('T')[0])) count++;
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
        this.showToast(action.message || 'Automation triggered!', 'alert');
        break;
        
      case ActionType.SEND_NOTIFICATION:
        await this.sendBrowserNotification(action.message || 'Automation triggered!');
        this.showToast(action.message || 'Automation triggered!', 'notification');
        break;
        
      case ActionType.DISABLE_ROUTINE:
        if (action.routine_id) {
          await this.disableRoutine(action.routine_id);
          this.showToast(`Routine disabled by automation: ${rule.name}`, 'alert');
        }
        break;
    }
  }

  private async disableRoutine(routineId: string): Promise<void> {
    const routines = this.routineService.routines();
    if (!routines) return;
    
    const routine = routines.find(r => r.id === routineId);
    if (!routine || !routine.active) return;
  
    const { error } = await supabase
      .from('routines')
      .update({ active: false })
      .eq('id', routineId);
      
    if (error) {
      console.error('Failed to disable routine:', error);
      return;
    }
    this.routineService.routinesResource.reload();
  }

  private showToast(message: string, type: 'alert' | 'notification'): void {
    const toast: Toast = { 
      id: crypto.randomUUID(), 
      message, 
      type, 
      createdAt: new Date() 
    };
    
    this._toasts.update(toasts => [...toasts, toast]);
    
    setTimeout(() => this.removeToast(toast.id), 8000);
  }

  removeToast(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private async sendBrowserNotification(message: string): Promise<void> {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    if (Notification.permission === 'granted') {
      new Notification('Habit Automation', { 
        body: message,
        icon: '/favicon.ico'
      });
    }
  }
}