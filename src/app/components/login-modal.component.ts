import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      <div class="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100 transform animate-in zoom-in-95 duration-200">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white text-center relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <span class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm text-3xl mb-3 shadow-inner">
              🔐
            </span>
            <h2 class="text-xl font-black">تسجيل الدخول للنظام</h2>
            <p class="text-xs text-emerald-100/80 mt-1">
              مخصص للمشرفين والمحاسبين المعتمدين لإدارة الصندوق وتعديل وحذف السجلات
            </p>
          </div>

          <button
            (click)="closeModal()"
            type="button"
            class="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <div class="p-6 sm:p-8 space-y-6">

          <!-- Error Alert -->
          <div *ngIf="errorMessage()" class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
            <span>⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>

          <!-- Standard Credentials Form -->
          <form id="login-form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                اسم المستخدم
              </label>
              <input
                id="login-username-input"
                type="text"
                [(ngModel)]="username"
                name="username"
                required
                autocomplete="username"
                placeholder="أدخل اسم المستخدم..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 text-xs text-slate-800 transition-all outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                كلمة المرور
              </label>
              <input
                id="login-password-input"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="أدخل كلمة المرور..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 text-xs text-slate-800 transition-all outline-none"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              [disabled]="loading() || !username || !password"
              class="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span *ngIf="loading()" class="animate-spin text-sm">⏳</span>
              <span>{{ loading() ? 'جاري التحقق...' : 'تسجيل الدخول' }}</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  `
})
export class LoginModalComponent {
  private api = inject(ApiService);

  @Output() loggedIn = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  username = '';
  password = '';
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (!this.username || !this.password) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.api.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.loggedIn.emit();
        this.closed.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    });
  }

  closeModal() {
    this.closed.emit();
  }
}
