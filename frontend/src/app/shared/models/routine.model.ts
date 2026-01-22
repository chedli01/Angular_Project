import { IconKey } from "../enums/iconKey.enum";
import { RoutineType } from "../enums/routineType.enum";

export interface Routine {
  id: string;
  name: string;
  icon: string;
  iconKey:IconKey
  color: string;
  description?: string;
  createdAt: Date;
  type:RoutineType
}

export interface RoutineFormData {
  name: string;
  description?: string;
  type:RoutineType;
  iconKey: IconKey;
}
