import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { FundSummary } from '../models/gam3ya.models';

@Component({
  selector: 'app-fund-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div class="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 transform transition-all animate-in fade-in zoom-in duration-200">
        
        <div class="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700"></div>

        <div class="flex items-center justify-between pb-5 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shadow-inner">
              🏛️
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-800">
                {{ fund ? 'تعديل بيانات الجمعية / المساهمة' : 'إنشاء جمعية أو حملة مساهمة جديدة' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                مشاريع وتكافل عائلة بيت حسين
              </p>
            </div>
          </div>
          <button (click)="close()" class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        <form (ngSubmit)="submit()" class="mt-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              اسم الجمعية أو الحملة <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              placeholder="مثال: تجديد المندرة / صندوق تكافل العائلة الشهري"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              وصف الجمعية والهدف منها (اختياري)
            </label>
            <textarea
              [(ngModel)]="description"
              name="description"
              rows="3"
              placeholder="اكتب نبذة عن أهداف هذا الصندوق أو المشروع..."
              class="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                المبلغ المطلوب من كل فرد <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  type="number"
                  [(ngModel)]="defaultTargetPerMember"
                  name="defaultTargetPerMember"
                  required
                  min="0"
                  placeholder="6000"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-800 transition-all outline-none pl-12"
                />
                <span class="absolute left-3 top-2.5 text-xs text-slate-400">ج.م</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                المبلغ الإجمالي المستهدف للجمعية (اختياري)
              </label>
              <div class="relative">
                <input
                  type="number"
                  [(ngModel)]="overallTargetAmount"
                  name="overallTargetAmount"
                  min="0"
                  placeholder="مثال: 60000"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-800 transition-all outline-none pl-12"
                />
                <span class="absolute left-3 top-2.5 text-xs text-slate-400">ج.م</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              حالة الجمعية
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                <input
                  type="radio"
                  [(ngModel)]="status"
                  name="status"
                  value="نشطة"
                  class="text-emerald-600 focus:ring-emerald-500"
                />
                <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">نشطة ومستمرة</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                <input
                  type="radio"
                  [(ngModel)]="status"
                  name="status"
                  value="مكتملة"
                  class="text-slate-600 focus:ring-slate-500"
                />
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">مكتملة ومغلقة</span>
              </label>
            </div>
          </div>

          <div *ngIf="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {{ errorMessage }}
          </div>

          <div class="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-slate-100">
            <button
              type="button"
              (click)="close()"
              class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors text-center cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              [disabled]="loading || !name.trim()"
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-bold shadow-lg shadow-emerald-700/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span *ngIf="loading" class="animate-spin text-xs">⏳</span>
              <span>{{ fund ? 'حفظ التعديلات' : 'إنشاء الجمعية' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class FundModalComponent implements OnInit {
  private api = inject(ApiService);

  @Input() fund?: FundSummary;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  name = '';
  description = '';
  defaultTargetPerMember = 6000;
  overallTargetAmount: number | null = null;
  status = 'نشطة';

  loading = false;
  errorMessage = '';

  ngOnInit() {
    if (this.fund) {
      this.name = this.fund.name;
      this.description = this.fund.description || '';
      this.defaultTargetPerMember = this.fund.defaultTargetPerMember;
      this.overallTargetAmount = this.fund.overallTargetAmount || null;
      this.status = this.fund.status;
    }
  }

  submit() {
    if (!this.name.trim()) {
      this.errorMessage = 'اسم الجمعية أو المساهمة مطلوب';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      name: this.name.trim(),
      description: this.description.trim() || undefined,
      defaultTargetPerMember: this.defaultTargetPerMember,
      overallTargetAmount: this.overallTargetAmount || undefined,
      status: this.status
    };

    if (this.fund) {
      this.api.updateFund(this.fund.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'حدث خطأ أثناء تعديل الجمعية';
        }
      });
    } else {
      this.api.createFund(payload).subscribe({
        next: () => {
          this.loading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'حدث خطأ أثناء إنشاء الجمعية';
        }
      });
    }
  }

  close() {
    this.closed.emit();
  }
}
