import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { FamilyMember } from '../models/gam3ya.models';

@Component({
  selector: 'app-assign-member-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div class="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 transform transition-all animate-in fade-in zoom-in duration-200">
        
        <div class="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700"></div>

        <div class="flex items-center justify-between pb-5 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
              ➕
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-800">
                ربط عضو بالجمعية
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                تحديد المبلغ المطلوب والمساهمة
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
              اختر فرد العائلة <span class="text-rose-500">*</span>
            </label>
            <select
              [(ngModel)]="memberId"
              name="memberId"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
            >
              <option [ngValue]="null" disabled>اختر العضو...</option>
              <option *ngFor="let member of availableMembers" [ngValue]="member.id">
                {{ member.fullName }} {{ member.phoneNumber ? '(' + member.phoneNumber + ')' : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              المبلغ المطلوب من هذا العضو (جنيه مصري)
            </label>
            <div class="relative">
              <input
                type="number"
                [(ngModel)]="customTarget"
                name="customTarget"
                min="0"
                [placeholder]="defaultTarget.toString()"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-slate-800 transition-all outline-none pl-12"
              />
              <span class="absolute left-3 top-2.5 text-xs text-slate-400">ج.م</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">
              المبلغ الافتراضي للجمعية هو: <strong class="text-emerald-700">{{ defaultTarget | number }} ج.م</strong>. يمكنك تركه كما هو أو تغييره لهذا العضو.
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ملاحظات (اختياري)
            </label>
            <input
              type="text"
              [(ngModel)]="notes"
              name="notes"
              placeholder="مثال: خصم خاص / سداد على 3 دفعات"
              class="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
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
              [disabled]="loading || !memberId"
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-bold shadow-lg shadow-emerald-700/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span *ngIf="loading" class="animate-spin text-xs">⏳</span>
              <span>ربط العضو بالجمعية</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AssignMemberModalComponent implements OnInit {
  private api = inject(ApiService);

  @Input() fundId!: number;
  @Input() defaultTarget: number = 6000;
  @Input() existingMemberIds: number[] = [];

  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  availableMembers: FamilyMember[] = [];
  memberId: number | null = null;
  customTarget: number | null = null;
  notes = '';

  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.customTarget = this.defaultTarget;

    // Immediately read from pre-fetched signal
    const preloaded = this.api.members();
    if (preloaded.length > 0) {
      this.availableMembers = preloaded.filter(m => !this.existingMemberIds.includes(m.id));
      if (this.availableMembers.length > 0) {
        this.memberId = this.availableMembers[0].id;
      }
    }

    // Refresh in background
    this.api.getFamilyMembers().subscribe(members => {
      this.availableMembers = members.filter(m => !this.existingMemberIds.includes(m.id));
      if (!this.memberId && this.availableMembers.length > 0) {
        this.memberId = this.availableMembers[0].id;
      }
    });
  }

  submit() {
    if (!this.memberId) {
      this.errorMessage = 'يرجى اختيار العضو';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const target = this.customTarget !== null && this.customTarget >= 0 ? this.customTarget : this.defaultTarget;

    this.api.assignMemberToFund(this.fundId, this.memberId, target, this.notes).subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'حدث خطأ أثناء ربط العضو بالجمعية';
      }
    });
  }

  close() {
    this.closed.emit();
  }
}
