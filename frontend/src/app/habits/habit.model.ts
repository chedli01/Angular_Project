export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  icon: string;
  color: string;
  createdAt: string;
}
