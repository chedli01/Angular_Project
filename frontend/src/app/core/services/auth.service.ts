import { Injectable, signal, computed } from '@angular/core';
import { UserSignup } from '../models/user.model';
import * as bcrypt from 'bcryptjs';
import { CredentialsDto } from '../../features/auth/login/dto/credentials.dto';
import { LoginResponseDto } from '../../features/auth/login/dto/login-response.dto';

export interface ConnectedUser {
  email: string;
  id: number;
  name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //////////////////////////////////////////////////////////////
  private _user = signal<ConnectedUser | null>(null);
  private _token = signal<string | null>(null);
  readonly user = this._user as  typeof this._user;
  readonly token = this._token as  typeof this._token;
  readonly isAuthenticated = computed(() => !!this._token());

  private storageKey = 'users';
  private tokenKey = 'token';

  constructor() {
    // restore from localStorage
    const savedToken = localStorage.getItem(this.tokenKey);
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      this.token.set(savedToken);
      this.user.set(JSON.parse(savedUser));
    }
  }

  //////////////////////////////////////////////////////////////
  async signup(user: UserSignup): Promise<void> {
    const users: UserSignup[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');

    if (users.some(u => u.email === user.email)) {
      return Promise.reject('Email already registered');
    }

    // hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    users.push({ ...user, password: hashedPassword });
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  async login(credentials: CredentialsDto): Promise<LoginResponseDto> {
    const users: UserSignup[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const user = users.find(u => u.email === credentials.email);

    if (!user) return Promise.reject('Invalid email or password');

    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
    if (!passwordMatch) return Promise.reject('Invalid email or password');

    const fakeToken = btoa(JSON.stringify({ email: user.email, id: Date.now() }));
    this.token.set(fakeToken);
    this.user.set({ email: user.email, id: Date.now(), name: user.name });

    localStorage.setItem(this.tokenKey, fakeToken);
    localStorage.setItem('user', JSON.stringify({ email: user.email, id: Date.now(), name: user.name }));

    return {access_token:fakeToken,email:user.email,id:Date.now()}
  }

  logout(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
  }
}
