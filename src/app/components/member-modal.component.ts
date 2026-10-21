import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { FamilyMember } from '../models/gam3ya.models';

@Component({
  selector: 'app-member-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div class="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 transform transition-all animate-in fade-in zoom-in duration-200">
        
        <div class="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700"></div>

        <div class="flex items-center justify-between pb-5 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
              👤
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-800">
                {{ member ? 'تعديل بيانات العضو' : 'إضافة فرد جديد للعائلة' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                أبناء وأفراد عائلة بيت حسين
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
              الاسم بالكامل <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="fullName"
              name="fullName"
              required
              placeholder="مثال: الحاج حسين أحمد حسين"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              رقم الهاتف (اختياري)
            </label>
            <input
              type="tel"
              [(ngModel)]="phoneNumber"
              name="phoneNumber"
              placeholder="مثال: 01012345678"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              الرقم القومي (اختياري)
            </label>
            <input
              type="text"
              [(ngModel)]="nationalId"
              name="nationalId"
              placeholder="14 رقم قومي"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ملاحظات أو صلة القرابة (اختياري)
            </label>
            <input
              type="text"
              [(ngModel)]="notes"
              name="notes"
              placeholder="مثال: فرع الحاج أحمد / مهندس / الإسكندرية"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
            />
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
              [disabled]="loading || !fullName.trim()"
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-bold shadow-lg shadow-emerald-700/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span *ngIf="loading" class="animate-spin text-xs">⏳</span>
              <span>{{ member ? 'حفظ التعديلات' : 'إضافة العضو' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class MemberModalComponent implements OnInit {
  private api = inject(ApiService);

  @Input() member?: FamilyMember;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  fullName = '';
  phoneNumber = '';
  nationalId = '';
  notes = '';

  loading = false;
  errorMessage = '';

  ngOnInit() {
    if (this.member) {
      this.fullName = this.member.fullName;
      this.phoneNumber = this.member.phoneNumber || '';
      this.nationalId = this.member.nationalId || '';
      this.notes = this.member.notes || '';
    }
  }

  submit() {
    if (!this.fullName.trim()) {
      this.errorMessage = 'الاسم بالكامل مطلوب';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      fullName: this.fullName.trim(),
      phoneNumber: this.phoneNumber.trim() || undefined,
      nationalId: this.nationalId.trim() || undefined,
      notes: this.notes.trim() || undefined
    };

    if (this.member) {
      this.api.updateMember(this.member.id, payload).subscribe({
        next: () => {
          this.loading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'حدث خطأ أثناء تعديل بيانات العضو';
        }
      });
    } else {
      this.api.createMember(payload).subscribe({
        next: () => {
          this.loading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'حدث خطأ أثناء إضافة العضو';
        }
      });
    }
  }

  close() {
    this.closed.emit();
  }
}
