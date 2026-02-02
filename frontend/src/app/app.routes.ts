import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { LoginComponent } from './features/auth/login/login';
import { SignupComponent } from './features/auth/signup/signup';
import { MainLayoutComponent } from './shared/components/layout/main-layout.component';
import { HabitsPage } from './habits/pages/habits.page';
import { HabitDetailPage } from './habits/pages/habit-detail.page';
import { AutomationComponent } from './features/automation/page/automation/automation';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [NoAuthGuard] },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'today', pathMatch: 'full' },

      {
        path: 'today',
        loadComponent: () =>
          import('./features/today/pages/today/today').then((m) => m.Today),
      },

      {
        path: 'routines',
        loadComponent: () =>
          import('./features/routines/pages/routines/routines').then((m) => m.Routines),
      },
        { path: 'automation', component: AutomationComponent },

      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar-page/calendar-page.component').then(
            (m) => m.CalendarPageComponent,
          ),
      },
      {
        path: 'habits',
        component: HabitsPage,
      },
      {
        path: 'habits/:id',
        component: HabitDetailPage,
      },

      { path: '**', redirectTo: 'today' },
    ],
  },
];
