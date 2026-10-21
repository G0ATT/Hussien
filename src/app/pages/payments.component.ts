import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { PaymentDetail, FundSummary, FamilyMember } from '../models/gam3ya.models';
import { PaymentModalComponent } from '../components/payment-modal.component';
import { ConfirmModalComponent, ConfirmDetailItem } from '../components/confirm-modal.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaymentModalComponent, ConfirmModalComponent],
  template: `
    <div class="page-container">
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <span class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg shadow-sm">
              <svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </span>
            <span>سجل الدفعات والإيصالات</span>
          </h1>
          <p class="section-subheading">
            سجل تاريخي كامل لجميع المبالغ المحصلة في جمعيات ومساهمات عائلة بيت حسين
          </p>
        </div>

        <button
          id="add-payment-btn"
          (click)="openCreateModal()"
          class="btn-primary w-full sm:w-auto justify-center"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>تسجيل دفعة جديدة</span>
        </button>
      </div>

      <!-- Filters & Running Total Header Bar -->
      <div class="glass-panel p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          
          <!-- Filter by Fund -->
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">
              تصفية حسب الجمعية:
            </label>
            <select
              [ngModel]="selectedFundId()"
              (ngModelChange)="onFundFilterChange($event)"
              class="input-field"
            >
              <option [ngValue]="null">كل الجمعيات والمساهمات</option>
              <option *ngFor="let fund of funds()" [ngValue]="fund.id">
                {{ fund.name }}
              </option>
            </select>
          </div>

          <!-- Filter by Member -->
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">
              تصفية حسب العضو:
            </label>
            <select
              [ngModel]="selectedMemberId()"
              (ngModelChange)="onMemberFilterChange($event)"
              class="input-field"
            >
              <option [ngValue]="null">كل أفراد العائلة</option>
              <option *ngFor="let member of members()" [ngValue]="member.id">
                {{ member.fullName }}
              </option>
            </select>
          </div>

          <!-- Search Query -->
          <div class="sm:col-span-2 lg:col-span-1">
            <label class="block text-xs font-bold text-slate-600 mb-1">
              بحث في الملاحظات أو طريقة الدفع:
            </label>
            <div class="relative">
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="ابحث..."
                class="input-field pr-9"
              />
              <svg class="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

        </div>

        <!-- Running Total Metrics Strip -->
        <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>عدد الإيصالات: <strong class="text-slate-800 font-bold">{{ payments().length }}</strong></span>
            <span>
              إجمالي المبالغ: 
              <strong class="text-emerald-700 text-sm sm:text-base font-black">{{ runningTotal() | number }} ج.م</strong>
            </span>
          </div>

          <button
            (click)="resetFilters()"
            class="text-xs text-slate-500 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>إعادة تعيين الفلاتر</span>
          </button>
        </div>
      </div>

      <!-- Desktop Table (Hidden on Mobile) -->
      <div class="desktop-table-wrapper glass-panel p-6 shadow-sm">
        <table class="desktop-table">
          <thead>
            <tr>
              <th>رقم الإيصال</th>
              <th>تاريخ الدفع</th>
              <th>اسم العضو (المساهم)</th>
              <th>الجمعية / الحملة</th>
              <th>المبلغ المدفوع</th>
              <th>طريقة الدفع</th>
              <th>سُجلت بواسطة</th>
              <th>ملاحظات</th>
              <th class="text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of payments()" class="hover:bg-slate-50/80 transition-colors">
              <td class="font-mono text-xs text-slate-400">#{{ p.id }}</td>
              <td class="font-mono text-xs text-slate-600">{{ p.paymentDate | date:'yyyy/MM/dd' }}</td>
              <td>
                <a [routerLink]="['/members', p.familyMemberId]" class="font-bold text-slate-800 hover:text-emerald-700 hover:underline">
                  {{ p.memberName }}
                </a>
                <div *ngIf="p.memberPhone" class="text-[11px] text-slate-400">
                  {{ p.memberPhone }}
                </div>
              </td>
              <td class="font-semibold text-slate-700">
                <a [routerLink]="['/funds', p.fundId]" class="hover:text-emerald-700 hover:underline">
                  {{ p.fundName }}
                </a>
              </td>
              <td class="font-black text-emerald-700 text-sm">
                +{{ p.amount | number }} <span class="text-xs font-normal text-slate-500">ج.م</span>
              </td>
              <td>
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                  {{ p.paymentMethod || 'نقدي' }}
                </span>
              </td>
              <td>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold">
                  <span>✍️</span>
                  <span>{{ p.recordedBy || 'مدير الصندوق' }}</span>
                </span>
              </td>
              <td class="text-slate-500 text-xs max-w-xs truncate">
                {{ p.notes || '—' }}
              </td>
              <td class="text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    (click)="openEditModal(p)"
                    title="تعديل الدفعة"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    [id]="'delete-payment-btn-' + p.id"
                    (click)="deletePayment(p)"
                    title="حذف الدفعة"
                    class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr *ngIf="payments().length === 0">
              <td colspan="9" class="text-center py-12 text-slate-400 text-xs">
                <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div class="font-bold text-sm text-slate-600">لا توجد دفعات مسجلة تطابق الفلاتر المحددة</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards List (Visible on Mobile Only) -->
      <div class="mobile-cards-list">
        <div
          *ngFor="let p of payments(); let i = index"
          class="mobile-card animate-slide-up"
          [style.animation-delay.ms]="i * 40"
        >
          <!-- Top Row: Amount & Method Badge -->
          <div class="flex items-center justify-between">
            <div class="flex items-baseline gap-1">
              <span class="text-base font-black text-emerald-700">+{{ p.amount | number }}</span>
              <span class="text-[10px] text-slate-500 font-semibold">ج.م</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                {{ p.paymentMethod || 'نقدي' }}
              </span>
              <span class="font-mono text-[10px] text-slate-400">#{{ p.id }}</span>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="space-y-1.5 text-xs pt-1">
            <div class="mobile-card-row">
              <span class="mobile-card-label">المساهم:</span>
              <a [routerLink]="['/members', p.familyMemberId]" class="mobile-card-value hover:text-emerald-700">
                {{ p.memberName }}
              </a>
            </div>

            <div class="mobile-card-row">
              <span class="mobile-card-label">الجمعية:</span>
              <a [routerLink]="['/funds', p.fundId]" class="mobile-card-value text-emerald-800 hover:underline">
                {{ p.fundName }}
              </a>
            </div>

            <div class="mobile-card-row">
              <span class="mobile-card-label">تاريخ الدفع:</span>
              <span class="font-mono text-slate-600 text-xs">{{ p.paymentDate | date:'yyyy/MM/dd' }}</span>
            </div>

            <div class="mobile-card-row">
              <span class="mobile-card-label">سُجلت بواسطة:</span>
              <span class="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold">
                <span>✍️</span> {{ p.recordedBy || 'مدير الصندوق' }}
              </span>
            </div>

            <div *ngIf="p.notes" class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1">
              📝 {{ p.notes }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              (click)="openEditModal(p)"
              class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>تعديل</span>
            </button>

            <button
              [id]="'mobile-delete-payment-btn-' + p.id"
              (click)="deletePayment(p)"
              class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>حذف</span>
            </button>
          </div>
        </div>

        <div *ngIf="payments().length === 0" class="text-center py-12 glass-panel rounded-2xl p-6 text-slate-400 text-xs">
          <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div class="font-bold text-sm text-slate-600">لا توجد دفعات تطابق الفلاتر</div>
          <p class="text-xs text-slate-400 mt-1">جرب تغيير معايير البحث أو اختيار جمعية أخرى</p>
        </div>
      </div>

    </div>

    <!-- Payment Modal -->
    <app-payment-modal
      *ngIf="showModal()"
      [isEdit]="isEdit()"
      [payment]="selectedPaymentForEdit()"
      [paymentId]="selectedPaymentForEdit()?.id"
      (saved)="onPaymentSaved()"
      (closed)="showModal.set(false)"
    ></app-payment-modal>

    <!-- Delete Confirmation Modal -->
    <app-confirm-modal
      *ngIf="showDeleteConfirm() && paymentToDelete() as p"
      title="تأكيد حذف الدفعة النقدية"
      message="هل أنت متأكد من حذف هذه الدفعة من سجل الجمعية نهائياً؟"
      confirmText="نعم، حذف الدفعة"
      [details]="deletePaymentDetails()"
      (confirm)="executeDeletePayment()"
      (cancel)="cancelDeletePayment()"
    ></app-confirm-modal>
  `
})
export class PaymentsComponent implements OnInit {
  private api = inject(ApiService);

  payments = signal<PaymentDetail[]>([]);
  funds = signal<FundSummary[]>([]);
  members = signal<FamilyMember[]>([]);

  selectedFundId = signal<number | null>(null);
  selectedMemberId = signal<number | null>(null);
  searchQuery = signal<string>('');

  showModal = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  selectedPaymentForEdit = signal<PaymentDetail | undefined>(undefined);

  showDeleteConfirm = signal<boolean>(false);
  paymentToDelete = signal<PaymentDetail | null>(null);

  deletePaymentDetails = computed<ConfirmDetailItem[]>(() => {
    const p = this.paymentToDelete();
    if (!p) return [];
    return [
      { label: 'رقم الإيصال', value: '#' + p.id },
      { label: 'اسم العضو', value: p.memberName },
      { label: 'الجمعية / المساهمة', value: p.fundName },
      { label: 'المبلغ المسدد', value: p.amount.toLocaleString() + ' ج.م' },
      { label: 'طريقة السداد', value: p.paymentMethod || 'نقدي' }
    ];
  });

  runningTotal = computed(() =>
    this.payments().reduce((acc, p) => acc + (p.amount || 0), 0)
  );

  ngOnInit() {
    this.api.getFunds().subscribe(f => this.funds.set(f));
    this.api.getFamilyMembers().subscribe(m => this.members.set(m));
    this.loadPayments();
  }

  loadPayments() {
    this.api.getPayments(
      this.selectedFundId() || undefined,
      this.selectedMemberId() || undefined,
      this.searchQuery() || undefined
    ).subscribe(payments => {
      this.payments.set(payments);
    });
  }

  onFundFilterChange(fundId: number | null) {
    this.selectedFundId.set(fundId);
    this.loadPayments();
  }

  onMemberFilterChange(memberId: number | null) {
    this.selectedMemberId.set(memberId);
    this.loadPayments();
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.loadPayments();
  }

  resetFilters() {
    this.selectedFundId.set(null);
    this.selectedMemberId.set(null);
    this.searchQuery.set('');
    this.loadPayments();
  }

  openCreateModal() {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.isEdit.set(false);
    this.selectedPaymentForEdit.set(undefined);
    this.showModal.set(true);
  }

  openEditModal(p: PaymentDetail) {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.isEdit.set(true);
    this.selectedPaymentForEdit.set(p);
    this.showModal.set(true);
  }

  deletePayment(p: PaymentDetail) {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.paymentToDelete.set(p);
    this.showDeleteConfirm.set(true);
  }

  executeDeletePayment() {
    const p = this.paymentToDelete();
    if (!p) return;

    this.api.deletePayment(p.id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.paymentToDelete.set(null);
        this.loadPayments();
      },
      error: (err) => {
        this.showDeleteConfirm.set(false);
        alert(err.error?.message || 'حدث خطأ أثناء حذف الدفعة');
      }
    });
  }

  cancelDeletePayment() {
    this.showDeleteConfirm.set(false);
    this.paymentToDelete.set(null);
  }

  onPaymentSaved() {
    this.showModal.set(false);
    this.loadPayments();
  }
}
