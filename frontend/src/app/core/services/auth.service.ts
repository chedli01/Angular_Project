import { Injectable } from '@angular/core';
import { UserSignup } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  async signup(data: UserSignup): Promise<void> {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('User registered:', data);
        resolve();
      }, 1000);
    });
  }
}
