import { Habit } from "./habit.model";

export interface HabitWithStats extends Habit {
  completionDates: string[];
  completionRate: number;
}
