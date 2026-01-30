import { Component, inject, signal } from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';
import { supabase } from '@app/core/supabase/supabase.config';

@Component({
  selector: 'app-settings-component',
  imports: [],
  templateUrl: './settings-component.html',
  styleUrl: './settings-component.css',
})
export class SettingsComponent {
  private authService = inject(AuthService);

  isProcessing = signal(false);

  logout() {
    this.authService.logout();
  }

  toggleDarkMode() {
    const html = document.documentElement;
    html.classList.toggle('dark');

    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
  }

  async resetRoutines() {
    const confirmed = confirm('This will permanently delete ALL your routines. Continue?');
    if (!confirmed) return;

    this.isProcessing.set(true);

    try {
      // 1. Get the current user first
      const userId = this.authService.userId();

      if (!userId) {
        alert('You must be logged in to reset routines');
        return;
      }

      // 2. Delete routines belonging to THIS user
      const { error, count } = await supabase
        .from('routines')
        .delete({ count: 'exact' })
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase Delete Error:', error.message, error.details, error.hint);
        alert(`Failed to reset routines: ${error.message}`);
      } else {
        console.log(`Successfully deleted ${count} routines`);
        alert(count && count > 0 ? 'All routines deleted' : 'No routines found to delete');
        window.location.reload();
      }
    } catch (err) {
      console.error('Unexpected Error:', err);
      alert('An unexpected error occurred');
    } finally {
      this.isProcessing.set(false);
    }
  }
}
