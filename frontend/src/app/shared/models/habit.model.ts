export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  created_at: string;
}

export interface HabitCompletion {
  habit_id: string;
  date: string;
  completed: boolean;
}

export interface HabitFormData {
  name: string;
  icon: string;
  color: string;
  description?: string;
}

// for UI
export interface HabitWithStatus extends Habit {
  completed: boolean;
  streak: number;
}
