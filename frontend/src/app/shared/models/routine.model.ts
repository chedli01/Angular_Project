import { RoutineType } from "../enums/routineType.enum";

export interface Routine {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  completed: boolean;
  streak: number;
  createdAt: Date;
  type:RoutineType
}

export interface RoutineFormData {
  name: string;
  description?: string;
  type:RoutineType
}
