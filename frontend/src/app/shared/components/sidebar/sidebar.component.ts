import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsComponent } from './settings-component/settings-component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SettingsComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = signal(false);
  isMobileOpen = signal(false);
  isSettingsOpen = signal(false);

  // Get current user from auth service
  currentUser = this.authService.user;

  navItems = [
    { path: '/today', icon: 'home', label: 'Today' },
    { path: '/calendar', icon: 'calendar', label: 'Calendar' },
    { path: '/habits', icon: 'habits', label: 'Habits' },
    { path: '/routines', icon: 'routines', label: 'Routines' },
    { path: '/automation', icon: 'automation', label: 'Automation' },
  ];

  toggleSidebar() {
    this.isCollapsed.update((val) => !val);
  }

  toggleMobileSidebar() {
    this.isMobileOpen.update((val) => !val);
  }

  closeMobileSidebar() {
    this.isMobileOpen.set(false);
  }

  toggleSettings() {
    this.isSettingsOpen.update((v) => !v);
  }

  closeSettings() {
    this.isSettingsOpen.set(false);
  }
  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}
