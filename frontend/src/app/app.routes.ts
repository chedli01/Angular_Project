// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { LoginComponent } from './features/auth/login/login';
import { SignupComponent } from './features/auth/signup/signup';
import { HabitsPage } from './habits/pages/habits.page';
import { HabitDetailPage } from './habits/pages/habit-detail.page';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [NoAuthGuard] },
  { path: 'habits', component: HabitsPage},
  { path: 'habits/:id', component: HabitDetailPage},
  { path: '**', redirectTo: '' },
];
