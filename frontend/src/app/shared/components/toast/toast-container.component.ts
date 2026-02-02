import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomationService } from '@app/core/services/automation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 bg-white border rounded-xl p-4 shadow-xl animate-slide-in pointer-events-auto"
          [class.border-amber-400]="toast.type === 'alert'"
          [class.bg-amber-50]="toast.type === 'alert'"
          [class.border-indigo-400]="toast.type === 'notification'"
          [class.bg-indigo-50]="toast.type === 'notification'"
        >
          <span class="text-2xl flex-shrink-0">
            {{ toast.type === 'alert' ? '⚠️' : '🔔' }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900">
              {{ toast.type === 'alert' ? 'Automation Alert' : 'Automation Notification' }}
            </p>
            <p class="text-sm text-gray-700 mt-1">{{ toast.message }}</p>
          </div>
          <button
            (click)="dismiss(toast.id)"
            class="text-gray-400 hover:text-gray-700 flex-shrink-0 text-xl leading-none"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(120%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastContainer implements OnInit, OnDestroy {
  private automationService = inject(AutomationService);
  private sub?: Subscription;

  toasts = signal<any[]>([]);

  ngOnInit() {
    this.sub = this.automationService.toasts$.subscribe(t => this.toasts.set(t));
  }

  dismiss(id: string) {
    this.automationService.removeToast(id);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}