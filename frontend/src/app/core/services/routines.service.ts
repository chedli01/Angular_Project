import { Injectable, effect } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { supabase } from '../supabase/supabase.config';
import { Routine, RoutineFormData } from '@app/shared/models/routine.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoutineService {
  private routinesSubject = new BehaviorSubject<Routine[]>([]);
  routines$ = this.routinesSubject.asObservable();

  
  constructor(private auth: AuthService) {
    effect(() => {
      const userId = this.auth.userId();
      if (userId) {
        this.loadRoutines(userId);
      } else {
        this.routinesSubject.next([]);
      }
    });
  }

  private loadRoutines(userId: string) {
    from(
      supabase
        .from('routines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ).subscribe(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase get routines failed', error);
        return;
      }
      if (data) {
        this.routinesSubject.next(
          data.map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            active: r.active,
            type: r.preferred_time as any,
            custom_time_text: r.custom_time_text,
            createdAt: new Date(r.created_at),
          }))
        );
      }
    });
  }

  async addRoutine(formData: RoutineFormData) {
    const userId = this.auth.userId();
    if (!userId) throw new Error('User not authenticated');

    const newRoutine: Routine = {
      ...formData,
      id: crypto.randomUUID(),
      active: true,
      createdAt: new Date(),
    };

    const { data, error } = await supabase
      .from('routines')
      .insert([
        {
          id: newRoutine.id,
          user_id: userId,
          name: newRoutine.name,
          description: newRoutine.description,
          preferred_time: newRoutine.type,
          custom_time_text: newRoutine.custom_time_text,
          active: newRoutine.active,
          created_at: newRoutine.createdAt,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert failed', error);
      throw error;
    }

    this.routinesSubject.next([...this.routinesSubject.value, newRoutine]);
    return newRoutine;
  }

  async updateRoutine(id: string, formData: RoutineFormData) {
    const userId = this.auth.userId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('routines')
      .update({
        name: formData.name,
        description: formData.description,
        preferred_time: formData.type,
        custom_time_text: formData.custom_time_text,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase update failed', error);
      throw error;
    }

    // Update local state
    const updatedRoutines = this.routinesSubject.value.map((routine) =>
      routine.id === id
        ? {
            ...routine,
            name: formData.name,
            description: formData.description,
            type: formData.type,
            custom_time_text: formData.custom_time_text,
          }
        : routine
    );

    this.routinesSubject.next(updatedRoutines);
    return data;
  }

  async toggleActiveRoutine(id: string) {
    const userId = this.auth.userId();
    if (!userId) throw new Error('User not authenticated');

    const routine = this.routinesSubject.value.find((r) => r.id === id);
    if (!routine) throw new Error('Routine not found');

    const newActiveState = !routine.active;

    const { error } = await supabase
      .from('routines')
      .update({ active: newActiveState })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Supabase toggle active failed', error);
      throw error;
    }

    // Update local state
    const updatedRoutines = this.routinesSubject.value.map((r) =>
      r.id === id ? { ...r, active: newActiveState } : r
    );

    this.routinesSubject.next(updatedRoutines);
  }

  async deleteRoutine(id: string) {
    const { error } = await supabase.from('routines').delete().eq('id', id);

    if (error) {
      console.error('❌ Supabase delete failed', error);
      throw error;
    }

    this.routinesSubject.next(
      this.routinesSubject.value.filter((r) => r.id !== id)
    );
  }

  getRoutineById(id: string): Routine | undefined {
    return this.routinesSubject.value.find((r) => r.id === id);
  }
}