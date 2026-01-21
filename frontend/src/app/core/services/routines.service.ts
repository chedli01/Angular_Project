import { Injectable, effect } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { supabase } from '../supabase/supabase.config';
import { Routine, RoutineFormData } from '@app/shared/models/routine.model';
import { AuthService } from './auth.service';
import { IconKey } from '@app/shared/enums/iconKey.enum'; 
import { ICON_MAP } from '@app/shared/constants/iconMap';

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

  /** Get emoji for icon key */
  getIconForKey(iconKey: IconKey): string {
    return ICON_MAP[iconKey] || '✨';
  }

  /** Get all icon options for UI */
  getIconOptions(): { key: IconKey; emoji: string; label: string }[] {
    return Object.entries(IconKey).map(([label, key]) => ({
      key: key as IconKey,
      emoji: this.getIconForKey(key as IconKey),
      label: this.formatLabel(label)
    }));
  }

  private formatLabel(label: string): string {
    return label.replace(/([A-Z])/g, ' $1').trim();
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
            type: r.preferred_time as any,
            iconKey: r.icon_key as IconKey || IconKey.Star,
            icon: this.getIconForKey(r.icon_key as IconKey || IconKey.Star),
            color: r.color || '#6366F1',
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
      iconKey: formData.iconKey || IconKey.Star,
      icon: this.getIconForKey(formData.iconKey || IconKey.Star),
      color: '#6366F1',
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
          icon_key: newRoutine.iconKey,
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