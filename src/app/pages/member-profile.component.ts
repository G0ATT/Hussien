import { Component, Input, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { MemberProfile, FamilyMember, PaymentDetail } from '../models/gam3ya.models';
import { PaymentModalComponent } from '../components/payment-modal.component';
import { MemberModalComponent } from '../components/member-modal.component';
import { ConfirmModalComponent, ConfirmDetailItem } from '../components/confirm-modal.component';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, PaymentModalComponent, MemberModalComponent, ConfirmModalComponent],
  template: `
    <div *ngIf="profile() as p" class="page-container">
      
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <a routerLink="/members" class="hover:text-emerald-700 flex items-center gap-1 font-medium">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>أفراد العائلة</span>
        </a>
        <span class="text-slate-300">/</span>
        <span class="text-slate-800 font-bold truncate max-w-xs">{{ p.fullName }}</span>
      </div>

      <!-- Member Header Profile Card -->
      <div class="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm relative overflow-hidden">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div class="flex items-center gap-3.5 sm:gap-4">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-700 to-teal-800 text-white flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg shadow-emerald-800/20 shrink-0">
              {{ p.fullName.charAt(0) }}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2.5">
                <h1 class="text-xl sm:text-2xl font-black text-slate-800">{{ p.fullName }}</h1>
                <span class="badge-success badge text-[10px] sm:text-xs">
                  عضو معتمد
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 mt-1.5">
                <a *ngIf="p.phoneNumber" [href]="'tel:' + p.phoneNumber" class="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-800 font-mono">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{{ p.phoneNumber }}</span>
                </a>
                <span *ngIf="p.nationalId" class="inline-flex items-center gap-1">
                  <span>🪪</span> {{ p.nationalId }}
                </span>
                <span *ngIf="p.notes" class="inline-flex items-center gap-1 text-slate-400">
                  <span>📝</span> {{ p.notes }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <button
              (click)="openRecordPayment()"
              class="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>تسجيل دفعة</span>
            </button>

            <button
              (click)="openEditMemberModal()"
              title="تعديل بيانات العضو"
              class="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>تعديل</span>
            </button>

            <button
              (click)="promptDeleteMember()"
              title="حذف العضو نهائياً"
              class="px-3.5 py-2.5 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>حذف</span>
            </button>
          </div>
        </div>

        <!-- 3 Big Stat Badges -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-100">
          <div class="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span class="text-[10px] sm:text-xs text-emerald-800 font-bold block">إجمالي ما دفعه في كل الجمعيات</span>
            <span class="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
              {{ p.totalPaidAcrossAllFunds | number }} <span class="text-xs font-normal text-slate-500">ج.م</span>
            </span>
          </div>

          <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] sm:text-xs text-slate-500 font-bold block">الجمعيات المشارك بها</span>
            <span class="text-xl sm:text-2xl font-black text-slate-800 mt-1 block">
              {{ p.participations.length }} <span class="text-xs font-normal text-slate-400">جمعية</span>
            </span>
          </div>

          <div class="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span class="text-[10px] sm:text-xs text-amber-800 font-bold block">إجمالي عدد الدفعات المسجلة</span>
            <span class="text-xl sm:text-2xl font-black text-amber-700 mt-1 block">
              {{ p.paymentHistory.length }} <span class="text-xs font-normal text-slate-500">دفعة</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Section 1: Funds Member is Participating In -->
      <div class="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm">
        <h2 class="text-sm sm:text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>الجمعيات والمساهمات المشارك بها</span>
        </h2>

        <!-- Desktop Table (Hidden on Mobile) -->
        <div class="desktop-table-wrapper">
          <table class="desktop-table">
            <thead>
              <tr>
                <th>اسم الجمعية</th>
                <th>المبلغ المستهدف</th>
                <th>إجمالي ما دفعه</th>
                <th>المتبقي عليه</th>
                <th>الزيادة (مساهمة إضافية)</th>
                <th>عدد الدفعات</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let part of p.participations" class="hover:bg-slate-50/80">
                <td class="font-bold text-slate-800">
                  <a [routerLink]="['/funds', part.fundId]" class="hover:text-emerald-700 hover:underline">
                    {{ part.fundName }}
                  </a>
                </td>
                <td class="font-semibold text-slate-700">{{ part.targetAmount | number }} ج.م</td>
                <td class="font-bold text-emerald-700">{{ part.totalPaid | number }} ج.م</td>
                <td>
                  <span *ngIf="part.remainingBalance > 0" class="font-bold text-rose-600">
                    {{ part.remainingBalance | number }} ج.م
                  </span>
                  <span *ngIf="part.remainingBalance === 0" class="text-xs font-bold text-emerald-600">
                    0 ج.م (خالص)
                  </span>
                </td>
                <td>
                  <span *ngIf="part.extraAmount > 0" class="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                    +{{ part.extraAmount | number }} ج.م
                  </span>
                  <span *ngIf="part.extraAmount === 0" class="text-slate-300">—</span>
                </td>
                <td class="text-slate-600">{{ part.paymentsCount }} مرات</td>
                <td>
                  <span 
                    [ngClass]="getStatusBadgeClass(part.status)"
                    class="badge"
                  >
                    {{ part.status }}
                  </span>
                </td>
              </tr>

              <tr *ngIf="p.participations.length === 0">
                <td colspan="7" class="text-center py-8 text-slate-400 text-xs">
                  هذا العضو غير مسجل في أي جمعية حتى الآن.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards List (Visible on Mobile Only) -->
        <div class="mobile-cards-list">
          <div *ngFor="let part of p.participations; let i = index" class="mobile-card animate-slide-up" [style.animation-delay.ms]="i * 40">
            <div class="flex items-center justify-between gap-2">
              <a [routerLink]="['/funds', part.fundId]" class="font-bold text-sm text-slate-800 hover:text-emerald-700 truncate">
                {{ part.fundName }}
              </a>
              <span [ngClass]="getStatusBadgeClass(part.status)" class="badge text-[10px] shrink-0">
                {{ part.status }}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div>
                <div class="text-[9px] text-slate-400">المستهدف</div>
                <div class="text-xs font-bold text-slate-700">{{ part.targetAmount | number }}</div>
              </div>
              <div class="border-r border-l border-slate-200">
                <div class="text-[9px] text-slate-400">المدفوع</div>
                <div class="text-xs font-black text-emerald-700">{{ part.totalPaid | number }}</div>
              </div>
              <div>
                <div class="text-[9px] text-slate-400">المتبقي</div>
                <div class="text-xs font-bold" [ngClass]="part.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'">
                  {{ part.remainingBalance > 0 ? (part.remainingBalance | number) : '✓ خالص' }}
                </div>
              </div>
            </div>

            <div *ngIf="part.extraAmount > 0" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              ⭐ مساهمة إضافية: {{ part.extraAmount | number }} ج.م
            </div>

            <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
              <span>عدد الدفعات: <strong class="text-slate-700">{{ part.paymentsCount }}</strong></span>
              <a [routerLink]="['/funds', part.fundId]" class="text-emerald-700 font-bold hover:underline">
                عرض الجمعية ←
              </a>
            </div>
          </div>

          <div *ngIf="p.participations.length === 0" class="text-center py-8 text-slate-400 text-xs">
            هذا العضو غير مسجل في أي جمعية حتى الآن.
          </div>
        </div>
      </div>

      <!-- Section 2: Complete Payment History Log for this Member -->
      <div class="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm">
        <h2 class="text-sm sm:text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>سجل التاريخ الكامل لدفعات العضو</span>
        </h2>

        <!-- Desktop Table (Hidden on Mobile) -->
        <div class="desktop-table-wrapper">
          <table class="desktop-table">
            <thead>
              <tr>
                <th>رقم الإيصال</th>
                <th>تاريخ الدفع</th>
                <th>الجمعية</th>
                <th>المبلغ المسدد</th>
                <th>طريقة الدفع</th>
                <th>ملاحظات</th>
                <th class="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let pay of p.paymentHistory" class="hover:bg-slate-50/80">
                <td class="font-mono text-xs text-slate-400">#{{ pay.id }}</td>
                <td class="font-mono text-xs text-slate-600">{{ pay.paymentDate | date:'yyyy/MM/dd' }}</td>
                <td class="font-bold text-slate-800">{{ pay.fundName }}</td>
                <td class="font-black text-emerald-700 text-sm">+{{ pay.amount | number }} ج.م</td>
                <td class="text-slate-600">
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 text-xs">{{ pay.paymentMethod || 'نقدي' }}</span>
                </td>
                <td class="text-slate-500 text-xs">{{ pay.notes || '—' }}</td>
                <td class="text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      (click)="openEditPayment(pay)"
                      title="تعديل الدفعة"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      (click)="promptDeletePayment(pay)"
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

              <tr *ngIf="p.paymentHistory.length === 0">
                <td colspan="7" class="text-center py-8 text-slate-400 text-xs">
                  لا توجد دفعات مسجلة لهذا العضو بعد.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards List (Visible on Mobile Only) -->
        <div class="mobile-cards-list">
          <div *ngFor="let pay of p.paymentHistory; let i = index" class="mobile-card animate-slide-up" [style.animation-delay.ms]="i * 40">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-base font-black text-emerald-700">+{{ pay.amount | number }}</span>
                <span class="text-[10px] text-slate-500 font-semibold mr-1">ج.م</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                  {{ pay.paymentMethod || 'نقدي' }}
                </span>
                <span class="font-mono text-[10px] text-slate-400">#{{ pay.id }}</span>
              </div>
            </div>

            <div class="space-y-1 text-xs pt-1">
              <div class="mobile-card-row">
                <span class="mobile-card-label">الجمعية:</span>
                <span class="mobile-card-value text-slate-800">{{ pay.fundName }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="mobile-card-label">تاريخ الدفع:</span>
                <span class="font-mono text-slate-600 text-xs">{{ pay.paymentDate | date:'yyyy/MM/dd' }}</span>
              </div>
              <div *ngIf="pay.notes" class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1">
                📝 {{ pay.notes }}
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                (click)="openEditPayment(pay)"
                class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>تعديل</span>
              </button>

              <button
                (click)="promptDeletePayment(pay)"
                class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>حذف</span>
              </button>
            </div>
          </div>

          <div *ngIf="p.paymentHistory.length === 0" class="text-center py-8 text-slate-400 text-xs">
            لا توجد دفعات مسجلة لهذا العضو بعد.
          </div>
        </div>
      </div>

    </div>

    <!-- Payment Modal -->
    <app-payment-modal
      *ngIf="showPaymentModal()"
      [initialMemberId]="profile()?.id"
      [isEdit]="isEditPayment()"
      [payment]="selectedPaymentForEdit()"
      [paymentId]="selectedPaymentForEdit()?.id"
      (saved)="onPaymentSaved()"
      (closed)="showPaymentModal.set(false)"
    ></app-payment-modal>

    <!-- Member Modal (Edit Member) -->
    <app-member-modal
      *ngIf="showMemberModal()"
      [member]="memberForEdit()"
      (saved)="onMemberSaved()"
      (closed)="showMemberModal.set(false)"
    ></app-member-modal>

    <!-- Delete Member Confirmation Modal -->
    <app-confirm-modal
      *ngIf="showDeleteMemberConfirm() && profile() as p"
      title="تأكيد حذف فرد من العائلة"
      message="هل أنت متأكد من حذف هذا العضو من سجل عائلة بيت حسين نهائياً؟"
      confirmText="نعم، تأكيد حذف العضو"
      warningNote="تنبيه: سيتم حذف جميع مساهمات ودفعات هذا العضو نهائياً"
      [details]="deleteMemberDetails()"
      (confirm)="executeDeleteMember()"
      (cancel)="showDeleteMemberConfirm.set(false)"
    ></app-confirm-modal>

    <!-- Delete Payment Confirmation Modal -->
    <app-confirm-modal
      *ngIf="showDeletePaymentConfirm() && paymentToDelete() as pay"
      title="تأكيد حذف الدفعة"
      message="هل أنت متأكد من حذف هذه الدفعة من سجل العضو نهائياً؟"
      confirmText="نعم، حذف الدفعة"
      [details]="deletePaymentDetails()"
      (confirm)="executeDeletePayment()"
      (cancel)="cancelDeletePayment()"
    ></app-confirm-modal>
  `
})
export class MemberProfileComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  @Input() id!: string;

  profile = signal<MemberProfile | null>(null);
  showPaymentModal = signal<boolean>(false);
  isEditPayment = signal<boolean>(false);
  selectedPaymentForEdit = signal<PaymentDetail | undefined>(undefined);

  showMemberModal = signal<boolean>(false);
  memberForEdit = signal<FamilyMember | undefined>(undefined);

  showDeleteMemberConfirm = signal<boolean>(false);
  showDeletePaymentConfirm = signal<boolean>(false);
  paymentToDelete = signal<PaymentDetail | null>(null);

  deleteMemberDetails = computed<ConfirmDetailItem[]>(() => {
    const p = this.profile();
    if (!p) return [];
    return [
      { label: 'الاسم بالكامل', value: p.fullName },
      { label: 'رقم الهاتف', value: p.phoneNumber || 'غير مسجل' },
      { label: 'إجمالي ما دفعه', value: p.totalPaidAcrossAllFunds.toLocaleString() + ' ج.م' },
      { label: 'الجمعيات المشارك بها', value: p.participations.length + ' جمعية' },
      { label: 'عدد الدفعات', value: p.paymentHistory.length + ' دفعة' }
    ];
  });

  deletePaymentDetails = computed<ConfirmDetailItem[]>(() => {
    const pay = this.paymentToDelete();
    if (!pay) return [];
    return [
      { label: 'رقم الإيصال', value: '#' + pay.id },
      { label: 'الجمعية', value: pay.fundName },
      { label: 'المبلغ المسدد', value: pay.amount.toLocaleString() + ' ج.م' },
      { label: 'طريقة السداد', value: pay.paymentMethod || 'نقدي' }
    ];
  });

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const memberId = parseInt(this.id, 10);
    if (!memberId) return;

    this.api.getMemberProfile(memberId).subscribe(profile => {
      this.profile.set(profile);
    });
  }

  openRecordPayment() {
    this.isEditPayment.set(false);
    this.selectedPaymentForEdit.set(undefined);
    this.showPaymentModal.set(true);
  }

  openEditPayment(pay: PaymentDetail) {
    this.isEditPayment.set(true);
    this.selectedPaymentForEdit.set(pay);
    this.showPaymentModal.set(true);
  }

  promptDeletePayment(pay: PaymentDetail) {
    this.paymentToDelete.set(pay);
    this.showDeletePaymentConfirm.set(true);
  }

  executeDeletePayment() {
    const pay = this.paymentToDelete();
    if (!pay) return;

    this.api.deletePayment(pay.id).subscribe({
      next: () => {
        this.showDeletePaymentConfirm.set(false);
        this.paymentToDelete.set(null);
        this.loadProfile();
      },
      error: (err) => {
        this.showDeletePaymentConfirm.set(false);
        alert(err.error?.message || 'حدث خطأ أثناء حذف الدفعة');
      }
    });
  }

  cancelDeletePayment() {
    this.showDeletePaymentConfirm.set(false);
    this.paymentToDelete.set(null);
  }

  openEditMemberModal() {
    const p = this.profile();
    if (!p) return;
    this.memberForEdit.set({
      id: p.id,
      fullName: p.fullName,
      phoneNumber: p.phoneNumber,
      nationalId: p.nationalId,
      notes: p.notes,
      createdAt: '',
      totalPaidAllFunds: p.totalPaidAcrossAllFunds,
      enrolledFundsCount: p.participations.length,
      paymentsCount: p.paymentHistory.length
    });
    this.showMemberModal.set(true);
  }

  promptDeleteMember() {
    this.showDeleteMemberConfirm.set(true);
  }

  executeDeleteMember() {
    const p = this.profile();
    if (!p) return;

    this.api.deleteMember(p.id).subscribe({
      next: () => {
        this.showDeleteMemberConfirm.set(false);
        this.router.navigate(['/members']);
      },
      error: (err) => {
        this.showDeleteMemberConfirm.set(false);
        alert(err.error?.message || 'حدث خطأ أثناء حذف العضو');
      }
    });
  }

  onPaymentSaved() {
    this.showPaymentModal.set(false);
    this.loadProfile();
  }

  onMemberSaved() {
    this.showMemberModal.set(false);
    this.loadProfile();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'مكتمل': return 'bg-emerald-100 text-emerald-800';
      case 'دفع بزيادة': return 'bg-emerald-600 text-white font-black';
      case 'دفع جزئي': return 'bg-amber-100 text-amber-800';
      case 'لم يدفع':
      default: return 'bg-rose-100 text-rose-700';
    }
  }
}
