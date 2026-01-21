export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  completed: boolean;
  streak: number;
  createdAt: Date;
}

export interface HabitFormData {
  name: string;
  icon: string;
  color: string;
  description?: string;
}
