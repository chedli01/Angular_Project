import { Routes } from '@angular/router';
import { SignupComponent } from './features/auth/signup/signup';
import { LoginComponent } from './features/auth/login/login';

export const routes: Routes = [
      { path: 'signup', component: SignupComponent },
      { path: 'login', component: LoginComponent },


];
