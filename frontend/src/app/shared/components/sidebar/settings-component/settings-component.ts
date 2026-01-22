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

    localStorage.setItem(
      'theme',
      html.classList.contains('dark') ? 'dark' : 'light'
    );
  }

  async resetRoutines() {
    const confirmed = confirm(
      'This will permanently delete ALL your routines. Continue?'
    );

    if (!confirmed) return;

    this.isProcessing.set(true);

    const { error } = await supabase
      .from('routines')
      .delete()
      .neq('id', 0);

    this.isProcessing.set(false);

    if (error) {
      console.error(error);
      alert('Failed to reset routines');
    } else {
      alert('All routines deleted');
    }
  }

}
