import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    return this.checkAuth();
  }

  async canActivateChild(): Promise<boolean> {
    return this.checkAuth();
  }

  private async checkAuth(): Promise<boolean> {
    const ok = await this.auth.waitForSession();

    if (!ok) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
