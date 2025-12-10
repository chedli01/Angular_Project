import { Injectable, signal, computed } from '@angular/core';
import { UserSignup } from '../models/user.model';
import { CredentialsDto } from '../../features/auth/login/dto/credentials.dto';
import { LoginResponseDto } from '../../features/auth/login/dto/login-response.dto';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase.config';

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

  readonly user = this._user;
  readonly token = this._token;
  readonly isAuthenticated = computed(() => !!this._token());

  private userKey = 'user';
  private tokenKey = 'token';

  constructor() {
    // Restore session from localStorage
    const savedToken = localStorage.getItem(this.tokenKey);
    const savedUser = localStorage.getItem(this.userKey);

    if (savedToken && savedUser) {
      this._token.set(savedToken);
      this._user.set(JSON.parse(savedUser));
    }
  }

  //////////////////////////////////////////////////////////////
  async signup(user: UserSignup): Promise<void> {
    const cred = await createUserWithEmailAndPassword(auth, user.email, user.password);

    const newUser: ConnectedUser = {
      email: cred.user.email!,
      id: Date.now(),
      name: user.name,
    };

    this._user.set(newUser);

    localStorage.setItem(this.userKey, JSON.stringify(newUser));
  }

  //////////////////////////////////////////////////////////////
  async login(credentials: CredentialsDto): Promise<LoginResponseDto> {
    const cred = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);

    const loggedUser: ConnectedUser = {
      email: cred.user.email!,
      id: Date.now(),
      name: cred.user.displayName ?? '',
    };

    // Generate a fake token (example for now)
    const fakeToken = btoa(JSON.stringify({ email: loggedUser.email, id: loggedUser.id }));

    this._user.set(loggedUser);
    this._token.set(fakeToken);

    localStorage.setItem(this.userKey, JSON.stringify(loggedUser));
    localStorage.setItem(this.tokenKey, fakeToken);

    return {
      access_token: fakeToken,
      email: loggedUser.email,
      id: loggedUser.id,
    };
  }

  //////////////////////////////////////////////////////////////
  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
}
