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
    // Automatically fetch routines when the user logs in
    effect(() => {
      const userId = this.auth.userId();
      if (userId) {
        this.loadRoutines(userId);
      } else {
        this.routinesSubject.next([]); // clear routines if logged out
      }
    });
  }

  /** Load routines for a given user */
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
            color: '#6366F1',
            icon: '✨',
            completed: false,
            streak: 0,
            createdAt: new Date(r.created_at),
          }))
        );
      }
    });
  }

  /** Add routine */
  async addRoutine(formData: RoutineFormData) {
    const userId = this.auth.userId();
    if (!userId) throw new Error('User not authenticated');

    const newRoutine: Routine = {
      ...formData,
      id: crypto.randomUUID(),
      color: '#6366F1',
      icon: '✨',
      completed: false,
      streak: 0,
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
          active: true,
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

  /** Delete routine */
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
