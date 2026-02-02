import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AutomationService } from '@app/core/services/automation.service';
import { RoutineService } from '@app/core/services/routines.service';
import { HabitDataService } from '@app/core/services/habit-data.service';
import { AuthService } from '@app/core/services/auth.service';
import { AutomationRule, TriggerType, ActionType } from '@app/shared/models/automation.model';
import { Routine } from '@app/shared/models/routine.model';

@Component({
  selector: 'app-automation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './automation.html',
  styleUrls: ['./automation.css']
})
export class AutomationComponent {
  private automationService = inject(AutomationService);
  private routineService = inject(RoutineService);
  private habitService = inject(HabitDataService);
  private auth = inject(AuthService);

  // Expose enums to template
  readonly TriggerType = TriggerType;
  readonly ActionType = ActionType;

  rules = this.automationService.rules;
  habits = this.habitService.getHabits;
  routines = toSignal(this.routineService.routines$, { initialValue: [] as Routine[] });

  showCreateDialog = signal(false);

  form = signal({
    name: '',
    trigger_type: TriggerType.HABIT_MISSED as TriggerType,
    trigger_habit_id: '',
    condition_times: 1,
    condition_in_days: 7,
    action_type: ActionType.SHOW_ALERT as ActionType,
    action_routine_id: '',
    action_message: ''
  });

  constructor() {
    effect(() => {
      const userId = this.auth.userId();
      if (userId) {
        console.log('🔄 User authenticated, loading automation rules...');
        this.automationService.loadRules();
      }
    });
  }

  updateForm(field: keyof ReturnType<typeof this.form>, value: any) {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  actionNeedsRoutine(): boolean {
    return this.form().action_type === ActionType.DISABLE_ROUTINE;
  }

  actionNeedsMessage(): boolean {
    return this.form().action_type === ActionType.SHOW_ALERT ||
           this.form().action_type === ActionType.SEND_NOTIFICATION;
  }

  isFormValid(): boolean {
    const f = this.form();
    if (!f.name.trim()) return false;
    if (!f.trigger_habit_id) return false;
    if (f.condition_times < 1 || f.condition_in_days < 1) return false;
    if (this.actionNeedsRoutine() && !f.action_routine_id) return false;
    if (this.actionNeedsMessage() && !f.action_message.trim()) return false;
    return true;
  }

  openCreateDialog() {
    this.showCreateDialog.set(true);
  }

  closeCreateDialog() {
    this.showCreateDialog.set(false);
    this.form.set({
      name: '',
      trigger_type: TriggerType.HABIT_MISSED,
      trigger_habit_id: '',
      condition_times: 1,
      condition_in_days: 7,
      action_type: ActionType.SHOW_ALERT,
      action_routine_id: '',
      action_message: ''
    });
  }

  async createRule() {
    if (!this.isFormValid()) return;

    const f = this.form();

    try {
      await this.automationService.createRule({
        name: f.name,
        enabled: true,
        trigger: {
          type: f.trigger_type,
          habit_id: f.trigger_habit_id
        },
        condition: {
          times: f.condition_times,
          in_days: f.condition_in_days
        },
        action: {
          type: f.action_type,
          ...(f.action_routine_id && { routine_id: f.action_routine_id }),
          ...(f.action_message && { message: f.action_message })
        }
      });

      this.closeCreateDialog();
    } catch (error) {
      console.error('Failed to create rule', error);
    }
  }

  async deleteRule(id: string) {
    await this.automationService.deleteRule(id);
  }

  async toggleRule(id: string, enabled: boolean) {
    await this.automationService.toggleRule(id, enabled);
  }

  getHabitName(id?: string): string {
    return this.habits().find(h => h.id === id)?.name || 'Unknown';
  }

  getRoutineName(id?: string): string {
    const routines = this.routines();
    return (routines || []).find(r => r.id === id)?.name || 'Unknown';
  }

  getRuleDescription(rule: AutomationRule): string {
    const triggerVerb = rule.trigger.type === TriggerType.HABIT_MISSED ? 'missed' : 'completed';
    const habitName = this.getHabitName(rule.trigger.habit_id);
    const { times, in_days } = rule.condition;

    let actionText = '';
    switch (rule.action.type) {
      case ActionType.SHOW_ALERT:
        actionText = `show alert: "${rule.action.message}"`;
        break;
      case ActionType.SEND_NOTIFICATION:
        actionText = `send notification: "${rule.action.message}"`;
        break;
      case ActionType.DISABLE_ROUTINE:
        actionText = `disable routine "${this.getRoutineName(rule.action.routine_id)}"`;
        break;
    }

    return `IF "${habitName}" is ${triggerVerb} ${times} time${times > 1 ? 's' : ''} in ${in_days} days → ${actionText}`;
  }
}
