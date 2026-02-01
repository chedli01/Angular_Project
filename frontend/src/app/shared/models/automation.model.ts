// automation.model.ts

export enum TriggerType {
  HABIT_MISSED = 'habit_missed',
  HABIT_COMPLETED = 'habit_completed'
}

export enum ActionType {
  SHOW_ALERT = 'show_alert',
  DISABLE_ROUTINE = 'disable_routine',
  SEND_NOTIFICATION = 'send_notification'
}

export interface Trigger {
  type: TriggerType;
  habit_id: string;
}

export interface Condition {
  times: number;      // e.g. 3
  in_days: number;    // e.g. 7  → "missed 3 times in 7 days"
}

export interface Action {
  type: ActionType;
  routine_id?: string; // required when type === DISABLE_ROUTINE
  message?: string;    // required when type === SHOW_ALERT or SEND_NOTIFICATION
}

export interface AutomationRule {
  id: string;
  user_id: string;
  name: string;
  enabled: boolean;
  trigger: Trigger;
  condition: Condition;
  action: Action;
  created_at: string;
  updated_at: string;
}