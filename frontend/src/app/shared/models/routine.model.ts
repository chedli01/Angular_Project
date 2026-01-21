export interface Routine {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  completed: boolean;
  streak: number;
  createdAt: Date;
}

export interface RoutineFormData {
  name: string;
  icon: string;
  color: string;
  description?: string;
}
