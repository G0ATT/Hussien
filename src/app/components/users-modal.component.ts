import { Component, OnInit, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { UserDetail, CreateUserRequest } from '../models/gam3ya.models';

@Component({
  selector: 'app-users-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      
      <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] transform animate-in zoom-in-95 duration-200">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white relative shrink-0 overflow-hidden">
          <div class="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl"></div>
          
          <div class="flex items-center justify-between relative z-10">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-2xl shadow-inner">
                👥
              </div>
              <div>
                <h2 class="text-lg font-black tracking-tight">إدارة المستخدمين والمشرفين</h2>
                <p class="text-xs text-emerald-200/80 mt-0.5">
                  إضافة مستخدمين جدد وتحديد صلاحيات الدخول والإدارة للنظام
                </p>
              </div>
            </div>

            <button
              id="close-users-modal-btn"
              (click)="closed.emit()"
              type="button"
              class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Scrollable Body Content -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">

          <!-- Section 1: Add New User Form Card -->
          <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-xs font-black text-slate-800 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>إضافة مستخدم أو مشرف جديد للنظام</span>
              </h3>
              <span class="text-[11px] text-slate-400 font-medium">
                متاح فقط لمدير النظام
              </span>
            </div>

            <!-- Error message if any -->
            <div *ngIf="errorMessage()" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ errorMessage() }}</span>
            </div>

            <!-- Success message -->
            <div *ngIf="successMessage()" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <span>✅</span>
              <span>{{ successMessage() }}</span>
            </div>

            <form (ngSubmit)="onCreateUser()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <!-- Username -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1 text-right">
                    اسم المستخدم (للإنجليزي) <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="new-user-username"
                    type="text"
                    [(ngModel)]="newUsername"
                    name="newUsername"
                    required
                    dir="ltr"
                    placeholder="e.g. omar_ali"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 text-xs text-slate-800 transition-all outline-none font-mono"
                  />
                </div>

                <!-- Full Name -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1 text-right">
                    الاسم بالكامل <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="new-user-fullname"
                    type="text"
                    [(ngModel)]="newFullName"
                    name="newFullName"
                    required
                    placeholder="مثال: عمر علي حسين"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 text-xs text-slate-800 transition-all outline-none"
                  />
                </div>

                <!-- Password -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1 text-right">
                    كلمة المرور <span class="text-rose-500">*</span>
                  </label>
                  <input
                    id="new-user-password"
                    type="password"
                    [(ngModel)]="newPassword"
                    name="newPassword"
                    required
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 text-xs text-slate-800 transition-all outline-none font-mono"
                  />
                </div>

                <!-- Role -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1 text-right">
                    الدور / الصلاحية <span class="text-rose-500">*</span>
                  </label>
                  <select
                    id="new-user-role"
                    [(ngModel)]="newRole"
                    name="newRole"
                    required
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 text-xs text-slate-800 transition-all outline-none"
                  >
                    <option value="محاسب ومسجل دفعات">محاسب ومسجل دفعات (إدارة وتسجيل الدفعات)</option>
                    <option value="مشرف">مشرف (متابعة وإدارة الجمعيات)</option>
                    <option value="مدير النظام">مدير النظام (صلاحيات كاملة + إدارة المستخدمين)</option>
                  </select>
                </div>

              </div>

              <div class="flex items-center justify-end pt-1">
                <button
                  id="submit-create-user-btn"
                  type="submit"
                  [disabled]="loading() || !newUsername || !newFullName || !newPassword"
                  class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span *ngIf="loading()" class="animate-spin text-xs">⏳</span>
                  <span>{{ loading() ? 'جاري الحفظ...' : '➕ حفظ وإضافة المستخدم' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Section 2: Current Users List -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-black text-slate-800 flex items-center gap-2">
                <span>📋</span>
                <span>المستخدمون المسجلون حالياً ({{ users().length }})</span>
              </h3>
              <button
                (click)="loadUsers()"
                class="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold transition-colors cursor-pointer"
              >
                🔄 تحديث
              </button>
            </div>

            <!-- Users List Table / Cards -->
            <div class="grid grid-cols-1 gap-2.5">
              <div
                *ngFor="let u of users()"
                class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-200 transition-all flex items-center justify-between gap-4"
              >
                <div class="flex items-center gap-3">
                  <!-- Avatar -->
                  <div
                    [ngClass]="u.role === 'مدير النظام' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'"
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                  >
                    {{ u.role === 'مدير النظام' ? '👑' : '👤' }}
                  </div>

                  <!-- Details -->
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-black text-slate-900">{{ u.fullName }}</span>
                      <span
                        [ngClass]="u.role === 'مدير النظام' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'"
                        class="px-2 py-0.5 rounded-full border text-[10px] font-bold"
                      >
                        {{ u.role }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                      <span dir="ltr">&#64;{{ u.username }}</span>
                      <span>•</span>
                      <span>تاريخ الإنشاء: {{ u.createdAt | date:'yyyy/MM/dd' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Delete Action -->
                <div>
                  <button
                    *ngIf="u.username.toLowerCase() !== currentUsername().toLowerCase()"
                    (click)="onDeleteUser(u)"
                    [disabled]="deletingId() === u.id"
                    title="حذف المستخدم"
                    class="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <span>🗑️</span>
                  </button>
                  <span
                    *ngIf="u.username.toLowerCase() === currentUsername().toLowerCase()"
                    class="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    حسابك الحالي
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-400">
            يمكن لمدير النظام إضافة المشرفين وتحديد صلاحياتهم في أي وقت
          </span>

          <button
            (click)="closed.emit()"
            class="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>

    </div>
  `
})
export class UsersModalComponent implements OnInit {
  private api = inject(ApiService);

  @Output() closed = new EventEmitter<void>();

  users = this.api.users;
  currentUsername = computed(() => this.api.currentUser()?.username || '');

  newUsername = '';
  newFullName = '';
  newPassword = '';
  newRole = 'محاسب ومسجل دفعات';

  loading = signal<boolean>(false);
  deletingId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.api.getUsers().subscribe();
  }

  onCreateUser() {
    if (!this.newUsername || !this.newFullName || !this.newPassword) {
      this.errorMessage.set('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const req: CreateUserRequest = {
      username: this.newUsername.trim(),
      fullName: this.newFullName.trim(),
      password: this.newPassword,
      role: this.newRole
    };

    this.api.createUser(req).subscribe({
      next: (created) => {
        this.loading.set(false);
        this.successMessage.set(`تمت إضافة المستخدم '${created.fullName}' بنجاح.`);
        this.newUsername = '';
        this.newFullName = '';
        this.newPassword = '';
        this.newRole = 'محاسب ومسجل دفعات';
        setTimeout(() => this.successMessage.set(null), 4000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'تعذر إضافة المستخدم، يرجى التحقق من صحة البيانات.');
      }
    });
  }

  onDeleteUser(user: UserDetail) {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف المستخدم '${user.fullName}' (${user.username}) نهائياً؟`)) {
      return;
    }

    this.deletingId.set(user.id);
    this.api.deleteUser(user.id).subscribe({
      next: () => {
        this.deletingId.set(null);
      },
      error: (err) => {
        this.deletingId.set(null);
        alert(err.error?.message || 'تعذر حذف المستخدم.');
      }
    });
  }
}
