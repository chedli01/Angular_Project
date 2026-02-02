import { Habit } from './habit.model';

export function computeHabitStats(
  habit: Habit,
  completionDates: string[]
) {
  const today = new Date();
  const created = new Date(habit.createdAt);

  const daysTracked = Math.min(
    Math.max(
      Math.ceil((today.getTime() - created.getTime()) / 86400000),
      1
    ),
    30
  );

  const completionRate = Math.round(
    (completionDates.length / daysTracked) * 100
  );

  return {
    ...habit,
    completionDates,
    completionRate,
    daysTracked
  };
}
