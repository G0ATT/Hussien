import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { FamilyMember, FundSummary, PaymentDetail } from '../models/gam3ya.models';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div class="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 transform transition-all animate-in fade-in zoom-in duration-200">
        
        <!-- Header Ribbon Accent -->
        <div class="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-700"></div>

        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-5 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
              💳
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-800">
                {{ isEdit ? 'تعديل دفعة مالية' + (paymentId ? ' (#' + paymentId + ')' : '') : 'تسجيل دفعة مساهمة جديدة' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ isEdit ? 'تعديل بيانات المبلغ وتاريخ وطريقة السداد أو تحويلها' : 'إيداع لحساب صندوق ومساهمات عائلة بيت حسين' }}
              </p>
            </div>
          </div>
          <button (click)="close()" class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form (ngSubmit)="submit()" #paymentForm="ngForm" class="mt-6 space-y-4">
          
          <!-- Fund Selection -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              الجمعية / المساهمة <span class="text-rose-500">*</span>
            </label>
            <select
              id="payment-fund-select"
              [(ngModel)]="fundId"
              name="fundId"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
            >
              <option [ngValue]="null" disabled>اختر الجمعية أو الحملة...</option>
              <option *ngFor="let fund of funds" [ngValue]="fund.id">
                {{ fund.name }} (المطلوب: {{ fund.defaultTargetPerMember | number }} ج.م)
              </option>
            </select>
          </div>

          <!-- Family Member Selection -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              فرد العائلة (المساهم) <span class="text-rose-500">*</span>
            </label>
            <select
              id="payment-member-select"
              [(ngModel)]="familyMemberId"
              name="familyMemberId"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
            >
              <option [ngValue]="null" disabled>اختر العضو المسدد...</option>
              <option *ngFor="let member of members" [ngValue]="member.id">
                {{ member.fullName }} {{ member.phoneNumber ? '(' + member.phoneNumber + ')' : '' }}
              </option>
            </select>
          </div>

          <!-- Amount Input & Quick Chips -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              المبلغ المدفوع (جنيه مصري) <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                id="payment-amount-input"
                type="number"
                [(ngModel)]="amount"
                name="amount"
                required
                min="1"
                placeholder="مثال: 6000"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-base font-bold text-emerald-700 transition-all outline-none pl-14"
              />
              <span class="absolute left-3 top-2.5 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                ج.م
              </span>
            </div>

            <!-- Quick Amount Chips -->
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                *ngFor="let preset of [500, 1000, 1500, 2000, 3000, 6000]"
                (click)="amount = preset"
                class="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
              >
                +{{ preset | number }}
              </button>
            </div>
          </div>

          <!-- Payment Date & Method (Two Columns) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                تاريخ الدفع <span class="text-rose-500">*</span>
              </label>
              <input
                type="date"
                [(ngModel)]="paymentDate"
                name="paymentDate"
                required
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                طريقة الدفع
              </label>
              <select
                [(ngModel)]="paymentMethod"
                name="paymentMethod"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
              >
                <option value="نقدي">نقدي (كاش)</option>
                <option value="إنستاباي InstaPay">إنستاباي InstaPay</option>
                <option value="فودافون كاش">فودافون كاش</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="فوري">فوري</option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              ملاحظات أو رقم الإيصال (اختياري)
            </label>
            <input
              type="text"
              [(ngModel)]="notes"
              name="notes"
              placeholder="مثال: استلام يدوي بالمندرة / تم التحويل عبر فودافون كاش"
              class="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 transition-all outline-none"
            />
          </div>

          <!-- Recorded By Notice -->
          <div class="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between text-xs">
            <span class="text-slate-600 font-medium flex items-center gap-1.5">
              <span>✍️</span>
              <span>المسؤول عن تسجيل الدفعة:</span>
            </span>
            <span class="font-black text-emerald-800">
              {{ recordedBy || (api.currentUser()?.fullName ?? 'مدير الصندوق') }}
            </span>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {{ errorMessage }}
          </div>

          <!-- Modal Actions -->
          <div class="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-slate-100">
            <button
              type="button"
              (click)="close()"
              class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors text-center cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="payment-submit-btn"
              type="submit"
              [disabled]="loading || !fundId || !familyMemberId || !amount || amount <= 0"
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-bold shadow-lg shadow-emerald-700/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span *ngIf="loading" class="animate-spin text-xs">⏳</span>
              <span>{{ isEdit ? 'حفظ التعديلات' : 'تسجيل الدفعة الآن' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  `
})
export class PaymentModalComponent implements OnInit, OnChanges {
  public api = inject(ApiService);

  @Input() initialFundId?: number;
  @Input() initialMemberId?: number;
  @Input() initialAmount?: number;
  @Input() paymentId?: number;
  @Input() payment?: PaymentDetail;
  @Input() isEdit = false;

  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  funds: FundSummary[] = [];
  members: FamilyMember[] = [];

  fundId: number | null = null;
  familyMemberId: number | null = null;
  amount: number | null = null;
  paymentDate: string = new Date().toISOString().split('T')[0];
  paymentMethod: string = 'نقدي';
  recordedBy: string = '';
  notes: string = '';

  loading = false;
  errorMessage = '';

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['payment'] && this.payment) {
      this.populateFromPayment(this.payment);
    } else if (changes['initialFundId'] || changes['initialMemberId'] || changes['initialAmount']) {
      this.applyInitialValues();
    }
  }

  private initData() {
    // 1. Immediately read cached data from ApiService (Available instantly!)
    const preloadedFunds = this.api.funds();
    const preloadedMembers = this.api.members();

    if (preloadedFunds.length > 0) {
      this.funds = [...preloadedFunds];
    }
    if (preloadedMembers.length > 0) {
      this.members = [...preloadedMembers];
    }

    // 2. Apply initial values
    this.applyInitialValues();

    // 3. Handle payment edit if provided
    if (this.payment) {
      this.populateFromPayment(this.payment);
    } else if (this.paymentId && this.isEdit) {
      this.api.getPaymentById(this.paymentId).subscribe(p => {
        if (p) {
          this.populateFromPayment(p);
        }
      });
    }

    // 4. Background refresh to ensure fresh data and fill if cache was loading
    this.api.getFunds().subscribe(funds => {
      this.funds = funds;
      if (!this.fundId && funds.length > 0 && !this.isEdit) {
        this.fundId = this.initialFundId != null ? Number(this.initialFundId) : funds[0].id;
      }
    });

    this.api.getFamilyMembers().subscribe(members => {
      this.members = members;
      if (!this.familyMemberId && members.length > 0 && !this.isEdit) {
        this.familyMemberId = this.initialMemberId != null ? Number(this.initialMemberId) : members[0].id;
      }
    });
  }

  private applyInitialValues() {
    if (this.initialFundId != null) {
      this.fundId = Number(this.initialFundId);
    } else if (!this.fundId && this.funds.length > 0 && !this.isEdit) {
      this.fundId = this.funds[0].id;
    }

    if (this.initialMemberId != null) {
      this.familyMemberId = Number(this.initialMemberId);
    } else if (!this.familyMemberId && this.members.length > 0 && !this.isEdit) {
      this.familyMemberId = this.members[0].id;
    }

    if (this.initialAmount != null && !this.amount) {
      this.amount = Number(this.initialAmount);
    }
  }

  private populateFromPayment(p: PaymentDetail) {
    this.isEdit = true;
    this.paymentId = p.id;
    this.fundId = p.fundId;
    this.familyMemberId = p.familyMemberId;
    this.amount = p.amount;
    this.paymentDate = p.paymentDate ? p.paymentDate.substring(0, 10) : new Date().toISOString().split('T')[0];
    this.paymentMethod = p.paymentMethod || 'نقدي';
    this.recordedBy = p.recordedBy || '';
    this.notes = p.notes || '';
  }

  submit() {
    if (!this.fundId || !this.familyMemberId || !this.amount || this.amount <= 0) {
      this.errorMessage = 'يرجى استكمال جميع الحقول المطلوبة والمبلغ بشكل صحيح';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const finalRecorder = this.recordedBy || this.api.currentUser()?.fullName || 'مدير الصندوق';

    if (this.isEdit && this.paymentId) {
      this.api.updatePayment(this.paymentId, {
        fundId: this.fundId,
        familyMemberId: this.familyMemberId,
        amount: this.amount,
        paymentDate: this.paymentDate,
        paymentMethod: this.paymentMethod,
        recordedBy: finalRecorder,
        notes: this.notes
      }).subscribe({
        next: () => {
          this.loading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'حدث خطأ أثناء تعديل الدفعة';
        }
      });
    } else {
      this.api.createPayment({
        fundId: this.fundId,
        familyMemberId: this.familyMemberId,
        amount: this.amount,
        paymentDate: this.paymentDate,
        paymentMethod: this.paymentMethod,
        recordedBy: finalRecorder,
        notes: this.notes
      }).subscribe({
        next: () => {
          this.loading = false;
          this.saved.emit();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'حدث خطأ أثناء تسجيل الدفعة';
        }
      });
    }
  }

  close() {
    this.closed.emit();
  }
}
