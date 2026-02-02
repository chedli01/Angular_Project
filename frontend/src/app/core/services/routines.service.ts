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
    loader: async ({ params }) => {
      if (!params.userId) return [];

      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', params.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        active: r.active,
        type: r.preferred_time as any,
        custom_time_text: r.custom_time_text,
        createdAt: new Date(r.created_at),
      }));
    },
  });

  readonly routines = this.routinesResource.value;
  readonly isLoading = this.routinesResource.isLoading;

  async addRoutine(formData: RoutineFormData): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) throw new Error('User not authenticated');

    const newRoutine = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: formData.name,
      description: formData.description,
      preferred_time: formData.type,
      custom_time_text: formData.custom_time_text,
      active: true,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('routines').insert([newRoutine]);
    if (error) throw error;
    this.routinesResource.reload();
  }

  async updateRoutine(id: string, formData: RoutineFormData): Promise<void> {
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
    this.routinesResource.reload();
  }

  async toggleActiveRoutine(id: string): Promise<void> {
    const currentRoutines = this.routinesResource.value();
    const routine = currentRoutines?.find((r) => r.id === id);
    if (!routine) return;

    const { error } = await supabase
      .from('routines')
      .update({ active: !routine.active })
      .eq('id', id);

    if (error) throw error;
    this.routinesResource.reload();
  }

  async deleteRoutine(id: string): Promise<void> {
    const { error } = await supabase.from('routines').delete().eq('id', id);
    if (error) throw error;
    this.routinesResource.reload();
  }
}
