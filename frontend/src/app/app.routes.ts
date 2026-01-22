// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { LoginComponent } from './features/auth/login/login';
import { SignupComponent } from './features/auth/signup/signup';
import { MainLayoutComponent } from './shared/components/layout/main-layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [NoAuthGuard] },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate:[AuthGuard],
    canActivateChild:[AuthGuard],
    children: [
      { path: '', redirectTo: 'today', pathMatch: 'full' },
      { 
        path: 'today', 
        loadComponent: () => import('./features/today/pages/today/today').then(m => m.Today)
      },
      {
        path:'routines',
        loadComponent:()=> import('./features/routines/pages/routines/routines').then(m=>m.Routines)
      },
      { path: '**', redirectTo: 'today' }
    ]
  }
];
