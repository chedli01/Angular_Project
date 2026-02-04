import { Injectable, inject, resource } from '@angular/core';
import { supabase } from '../supabase/supabase.config';
import { Routine, RoutineFormData } from '@app/shared/models/routine.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoutineService {
  private auth = inject(AuthService);

  routinesResource = resource({
    params: () => ({ userId: this.auth.userId() }),
    loader: async ({ params, abortSignal }) => {
      if (!params.userId) return [];

      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', params.userId)
        .order('created_at', { ascending: false })
        .abortSignal(abortSignal);

      if (error) throw error;

      return (data || []).map((r: any): Routine => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        active: r.active,
        type: r.preferred_time as any,
        custom_time_text: r.custom_time_text || '',
        createdAt: new Date(r.created_at),
      }));
    },
  });

  readonly routines = this.routinesResource.value;
  readonly isLoading = this.routinesResource.isLoading;

  async addRoutine(formData: RoutineFormData): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) throw new Error('User not authenticated');

    const newRoutine: Routine = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description || '',
      active: true,
      type: formData.type,
      custom_time_text: formData.custom_time_text || '',
      createdAt: new Date(),
    };

    const current = this.routinesResource.value() || [];
    this.routinesResource.update(() => [newRoutine, ...current]);
    try {
      const { error } = await supabase.from('routines').insert([{
        id: newRoutine.id,
        user_id: userId,
        name: formData.name,
        description: formData.description,
        preferred_time: formData.type,
        custom_time_text: formData.custom_time_text,
        active: true,
        created_at: newRoutine.createdAt.toISOString(),
      }]);

      if (error) throw error;
    } catch (error) {
      this.routinesResource.reload();
      throw error;
    }
  }

  async updateRoutine(id: string, formData: RoutineFormData): Promise<void> {
    const current = this.routinesResource.value();
    if (!current) return;

    const routineIndex = current.findIndex((r) => r.id === id);
    if (routineIndex === -1) return;

    const updatedRoutines = [...current];
    updatedRoutines[routineIndex] = {
      ...updatedRoutines[routineIndex],
      name: formData.name,
      description: formData.description || '',
      type: formData.type,
      custom_time_text: formData.custom_time_text || '',
    };
    this.routinesResource.update(() => updatedRoutines);

    try {
      const { error } = await supabase
        .from('routines')
        .update({
          name: formData.name,
          description: formData.description,
          preferred_time: formData.type,
          custom_time_text: formData.custom_time_text,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      this.routinesResource.reload();
      throw error;
    }
  }

  async toggleActiveRoutine(id: string): Promise<void> {
    const current = this.routinesResource.value();
    if (!current) return;

    const routineIndex = current.findIndex((r) => r.id === id);
    if (routineIndex === -1) return;

    const routine = current[routineIndex];
    const newActiveState = !routine.active;

    const updatedRoutines = [...current];
    updatedRoutines[routineIndex] = {
      ...routine,
      active: newActiveState,
    };
    this.routinesResource.update(() => updatedRoutines);

    try {
      const { error } = await supabase
        .from('routines')
        .update({ active: newActiveState })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      this.routinesResource.reload();
      throw error;
    }
  }

  async deleteRoutine(id: string): Promise<void> {
    const current = this.routinesResource.value();
    if (!current) return;

    const updatedRoutines = current.filter((r) => r.id !== id);
    this.routinesResource.update(() => updatedRoutines);

    try {
      const { error } = await supabase.from('routines').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      this.routinesResource.reload();
      throw error;
    }
  }
}