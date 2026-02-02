import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutomationService } from './core/services/automation.service';
import { ToastContainer } from './shared/components/toast/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ToastContainer],
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  private automationService = inject(AutomationService);

   ngOnInit() {
    this.automationService.checkAllRules();
  }

}
