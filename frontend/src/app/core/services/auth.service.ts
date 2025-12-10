import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private storageKey = 'users';
  private tokenKey = 'token';

  constructor(private router: Router) {}

  // SIGNUP: save user in localStorage
  signup(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      const users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      if (users.some(u => u.email === user.email)) {
        reject('Email already registered');
        return;
      }

      users.push(user);
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      resolve();
    });
  }

  // LOGIN: check credentials and generate fake JWT
  login(email: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const users: User[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        reject('Invalid email or password');
        return;
      }

      // fake JWT
      const token = btoa(JSON.stringify({ email, name: user.name, exp: Date.now() + 3600_000 }));
      localStorage.setItem(this.tokenKey, token);
      resolve(token);
    });
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  // GET CURRENT USER
  getCurrentUser(): User | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token));
      return { name: payload.name, email: payload.email, password: '' };
    } catch {
      return null;
    }
  }

  // CHECK IF LOGGED IN
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
