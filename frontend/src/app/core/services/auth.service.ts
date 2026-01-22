import { Injectable, signal, computed } from '@angular/core';
import { supabase } from '../supabase/supabase.config';
import { ConnectedUser, UserSignup } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Signals to hold the user and authentication state */
  readonly user = signal<ConnectedUser | null>(null);
  readonly isAuthenticated = signal(false);

  /** Computed signal for easy access to user ID */
  readonly userId = computed(() => this.user()?.id ?? null);

  /** Internal flag to track if service is initialized */
  private initialized = false;

  constructor() {
    // Listen to Supabase auth changes (login/logout/refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      this.updateUserFromSession(session?.user ?? null);
      this.initialized = true;
    });

    // Initialize immediately in case user is already logged in (page reload)
    this.initialize();
  }

  /** Load existing session from Supabase if available */
  private async initialize() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Supabase getSession error:', error);
    }

    this.updateUserFromSession(session?.user ?? null);
    this.initialized = true;
  }

  /** Update signals based on Supabase user */
  private updateUserFromSession(user: any | null) {
    if (user) {
      this.user.set({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.['name'] ?? '',
      });
      this.isAuthenticated.set(true);
    } else {
      this.user.set(null);
      this.isAuthenticated.set(false);
    }
  }

  /** Wait for initialization and return auth state */
  async waitForSession(): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.isAuthenticated();
  }

  /** Signup user with email/password */
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

    if (error) throw new Error(error.message);
  }

  /** Login user */
  async login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    // Force update of user signal after login
    const {
      data: { user },
    } = await supabase.auth.getUser();
    this.updateUserFromSession(user);
  }

  /** Logout user */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);

    // Reset signals
    this.user.set(null);
    this.isAuthenticated.set(false);
  }
}
