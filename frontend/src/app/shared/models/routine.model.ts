import { RoutineType } from "../enums/routineType.enum";

export interface Routine {
  id: string;
  name: string;
  description?: string;
  type:RoutineType;
  custom_time_text? : string;
  active:boolean
  createdAt: Date;
}

export interface RoutineFormData {
  name: string;
  description?: string;
  type:RoutineType;
  custom_time_text? : string;

}
