import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AutomationService } from '@app/core/services/automation.service';
import { RoutineService } from '@app/core/services/routines.service';
import { HabitDataService } from '@app/core/services/habit-data.service';
import { AuthService } from '@app/core/services/auth.service';
import { AutomationRule, TriggerType, ActionType } from '@app/shared/models/automation.model';
import { Routine } from '@app/shared/models/routine.model';

interface AutomationForm {
  name: string;
  trigger_type: TriggerType;
  trigger_habit_id: string;
  condition_times: number;
  condition_in_days: number;
  action_type: ActionType;
  action_routine_id: string;
  action_message: string;
}

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

  // ✅ EXPOSE ENUMS TO TEMPLATE
  readonly TriggerType = TriggerType;
  readonly ActionType = ActionType;

  // ✅ READONLY SIGNALS FROM SERVICES (Single source of truth)
  readonly rules = this.automationService.rules;
  readonly habits = this.habitService.getHabits;
  readonly routines = toSignal(this.routineService.routines$, { initialValue: [] as Routine[] });
  readonly isLoading = this.automationService.isLoading;

  // ✅ COMPONENT-LOCAL STATE
  readonly showCreateDialog = signal(false);
  
  private readonly defaultForm: AutomationForm = {
    name: '',
    trigger_type: TriggerType.HABIT_MISSED,
    trigger_habit_id: '',
    condition_times: 1,
    condition_in_days: 7,
    action_type: ActionType.SHOW_ALERT,
    action_routine_id: '',
    action_message: ''
  };
  
  readonly form = signal<AutomationForm>({ ...this.defaultForm });

  // ✅ COMPUTED SIGNALS: Derived UI state
  readonly actionNeedsRoutine = computed(() => 
    this.form().action_type === ActionType.DISABLE_ROUTINE
  );

  readonly actionNeedsMessage = computed(() => {
    const actionType = this.form().action_type;
    return actionType === ActionType.SHOW_ALERT || 
           actionType === ActionType.SEND_NOTIFICATION;
  });

  readonly isFormValid = computed(() => {
    const f = this.form();
    
    if (!f.name.trim()) return false;
    if (!f.trigger_habit_id) return false;
    if (f.condition_times < 1 || f.condition_in_days < 1) return false;
    if (this.actionNeedsRoutine() && !f.action_routine_id) return false;
    if (this.actionNeedsMessage() && !f.action_message.trim()) return false;
    
    return true;
  });

  constructor() {
    effect(() => {
      const userId = this.auth.userId();
      if (userId) {
        this.automationService.loadRules();
      }
    }, { allowSignalWrites: true });
  }

  updateForm(field: keyof AutomationForm, value: any): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  openCreateDialog(): void {
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
    this.form.set({ ...this.defaultForm });
  }

  async createRule(): Promise<void> {
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
      // TODO: Show error toast to user
    }
  }

  async deleteRule(id: string): Promise<void> {
    try {
      await this.automationService.deleteRule(id);
    } catch (error) {
      console.error('Failed to delete rule', error);
    }
  }

  async toggleRule(id: string, enabled: boolean): Promise<void> {
    try {
      await this.automationService.toggleRule(id, enabled);
    } catch (error) {
      console.error('Failed to toggle rule', error);
    }
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