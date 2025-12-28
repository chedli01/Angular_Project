import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase/supabase.config';
import { ConnectedUser, UserSignup } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly user = signal<ConnectedUser | null>(null);
  readonly isAuthenticated = signal(false);

  private initialized = false;

  constructor() {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.user.set({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.['name'] ?? '',
        });
        this.isAuthenticated.set(true);
      } else {
        this.user.set(null);
        this.isAuthenticated.set(false);
      }
      this.initialized = true;
    });
  }

  async waitForSession(): Promise<boolean> {
    if (this.initialized) {
      return this.isAuthenticated();
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      this.user.set({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.['name'] ?? '',
      });
      this.isAuthenticated.set(true);
    }

    this.initialized = true;
    return this.isAuthenticated();
  }

  async signup(data: UserSignup): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          full_name: data.name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }
}
