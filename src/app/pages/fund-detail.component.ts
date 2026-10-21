import { Component, Input, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { FundSummary, FundMemberContribution } from '../models/gam3ya.models';
import { PaymentModalComponent } from '../components/payment-modal.component';
import { AssignMemberModalComponent } from '../components/assign-member-modal.component';
import { ConfirmModalComponent, ConfirmDetailItem } from '../components/confirm-modal.component';

@Component({
  selector: 'app-fund-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PaymentModalComponent, AssignMemberModalComponent, ConfirmModalComponent],
  template: `
    <div *ngIf="fund() as f" class="page-container">
      
      <!-- Breadcrumb & Navigation -->
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <a routerLink="/funds" class="hover:text-emerald-700 flex items-center gap-1 font-medium">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>الجمعيات والمساهمات</span>
        </a>
        <span class="text-slate-300">/</span>
        <span class="text-slate-800 font-bold truncate max-w-xs">{{ f.name }}</span>
      </div>

      <!-- Top Header Card -->
      <div class="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm relative overflow-hidden">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <span class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl shadow-sm shrink-0">
                <svg class="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              <div>
                <div class="flex flex-wrap items-center gap-2.5">
                  <h1 class="text-xl sm:text-2xl font-black text-slate-800">{{ f.name }}</h1>
                  <span
                    [ngClass]="f.status === 'نشطة' ? 'badge-success' : 'badge-warning'"
                    class="badge text-[10px] sm:text-xs"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="f.status === 'نشطة' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'"></span>
                    {{ f.status }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                  {{ f.description || 'صندوق مخصص لمشاريع ومساهمات عائلة بيت حسين.' }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              (click)="openPaymentModal()"
              class="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>تسجيل دفعة</span>
            </button>

            <button
              (click)="openAssignModal()"
              class="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>ربط عضو</span>
            </button>

            <button
              (click)="openDeleteFundConfirm()"
              class="px-3 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="حذف الجمعية نهائياً"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span class="hidden sm:inline">حذف الجمعية</span>
            </button>
          </div>
        </div>

        <!-- 4 Stat Badges -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-100">
          <div class="p-3 sm:p-0 rounded-xl sm:rounded-none bg-slate-50 sm:bg-transparent">
            <span class="text-[10px] sm:text-xs text-slate-400 block font-medium">إجمالي المحصل</span>
            <span class="text-base sm:text-xl font-black text-emerald-700 mt-0.5 block">{{ f.totalCollected | number }} ج.م</span>
          </div>
          <div class="p-3 sm:p-0 rounded-xl sm:rounded-none bg-slate-50 sm:bg-transparent">
            <span class="text-[10px] sm:text-xs text-slate-400 block font-medium">المتبقي للهدف</span>
            <span class="text-base sm:text-xl font-black text-amber-600 mt-0.5 block">{{ f.remainingToGoal | number }} ج.م</span>
          </div>
          <div class="p-3 sm:p-0 rounded-xl sm:rounded-none bg-slate-50 sm:bg-transparent">
            <span class="text-[10px] sm:text-xs text-slate-400 block font-medium">المطلوب من كل فرد</span>
            <span class="text-base sm:text-xl font-black text-slate-800 mt-0.5 block">{{ f.defaultTargetPerMember | number }} ج.م</span>
          </div>
          <div class="p-3 sm:p-0 rounded-xl sm:rounded-none bg-slate-50 sm:bg-transparent">
            <span class="text-[10px] sm:text-xs text-slate-400 block font-medium">نسبة الإنجاز</span>
            <span class="text-base sm:text-xl font-black text-emerald-800 mt-0.5 block">{{ f.progressPercentage }}%</span>
          </div>
        </div>
      </div>

      <!-- Member Contributions Tracking Section -->
      <div class="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm">
        
        <!-- Controls: Filters & Search -->
        <div class="flex flex-col gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-100">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 class="text-sm sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>كشف مساهمات ودفعات أفراد العائلة داخل الجمعية</span>
              </h2>
              <p class="section-subheading">
                متابعة دقيقة للمبالغ المطلوبة، المدفوعة، والمتبقي أو الزيادة لكل فرد
              </p>
            </div>
          </div>

          <!-- Status Filters -->
          <div class="flex flex-wrap items-center gap-1.5">
            <button
              *ngFor="let filter of statusFilters"
              (click)="activeStatusFilter.set(filter)"
              [ngClass]="activeStatusFilter() === filter 
                ? 'bg-emerald-700 text-white font-bold shadow-sm' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium'"
              class="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition-colors cursor-pointer"
            >
              {{ filter }}
              <span *ngIf="filter !== 'الكل'" class="text-[9px] sm:text-[10px] opacity-75">
                ({{ getFilterCount(filter) }})
              </span>
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
          <div class="relative w-full sm:w-80">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="ابحث بالاسم أو الهاتف..."
              class="input-field pr-9"
            />
            <svg class="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <span class="text-xs text-slate-500">
            العدد: <strong class="text-slate-800">{{ filteredContributions().length }}</strong> فرد
          </span>
        </div>

        <!-- Desktop Table (Hidden on Mobile) -->
        <div class="desktop-table-wrapper mt-4">
          <table class="desktop-table">
            <thead>
              <tr>
                <th>اسم العضو</th>
                <th>المبلغ المطلوب</th>
                <th>إجمالي المدفوع</th>
                <th>عدد مرات الدفع</th>
                <th>المتبقي عليه</th>
                <th>مساهمة إضافية (زيادة)</th>
                <th>حالة السداد</th>
                <th class="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs sm:text-sm">
              <tr 
                *ngFor="let item of filteredContributions()" 
                class="hover:bg-slate-50/80 transition-colors"
              >
                <!-- Member Name -->
                <td>
                  <div class="font-bold text-slate-800 flex items-center gap-2">
                    <span class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {{ item.memberName.charAt(0) }}
                    </span>
                    <a [routerLink]="['/members', item.memberId]" class="hover:text-emerald-700 hover:underline">
                      {{ item.memberName }}
                    </a>
                  </div>
                  <div *ngIf="item.memberPhone" class="text-[11px] text-slate-400 mt-0.5 mr-9">
                    {{ item.memberPhone }}
                  </div>
                </td>

                <!-- Target Amount -->
                <td class="font-semibold text-slate-700">
                  {{ item.targetAmount | number }} ج.م
                </td>

                <!-- Total Paid -->
                <td class="font-black text-emerald-700">
                  {{ item.totalPaid | number }} ج.م
                </td>

                <!-- Payments Count -->
                <td class="text-slate-600">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium">
                    {{ item.paymentsCount }} مرات
                  </span>
                </td>

                <!-- Remaining Balance -->
                <td>
                  <div *ngIf="item.remainingBalance > 0" class="font-bold text-rose-600">
                    {{ item.remainingBalance | number }} ج.م
                  </div>
                  <div *ngIf="item.remainingBalance === 0" class="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span>✓</span> 0 ج.م (خالص)
                  </div>
                </td>

                <!-- Extra Amount -->
                <td>
                  <div *ngIf="item.extraAmount > 0" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs shadow-sm">
                    <span>⭐ زيادة:</span>
                    <span>{{ item.extraAmount | number }} ج.م</span>
                  </div>
                  <div *ngIf="item.extraAmount === 0" class="text-slate-300 text-xs">
                    —
                  </div>
                </td>

                <!-- Status Badge -->
                <td>
                  <span 
                    [ngClass]="getStatusBadgeClass(item.status)"
                    class="badge"
                  >
                    <span>{{ getStatusIcon(item.status) }}</span>
                    <span>{{ item.status }}</span>
                  </span>
                </td>

                <!-- Actions -->
                <td class="text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      (click)="recordPaymentFor(item)"
                      class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      + دفع
                    </button>

                    <button
                      (click)="promptEditTarget(item)"
                      title="تعديل المبلغ المطلوب لهذا العضو"
                      class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors cursor-pointer"
                    >
                      ✏️ هدف
                    </button>

                    <button
                      *ngIf="item.paymentsCount === 0"
                      (click)="removeMember(item)"
                      title="إلغاء ربط العضو من الجمعية"
                      class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredContributions().length === 0">
                <td colspan="8" class="text-center py-12 text-slate-400 text-xs">
                  <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div class="font-bold text-sm text-slate-600">لا يوجد مساهمين يطابقون خيارات البحث الحالية</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards List (Visible on Mobile Only) -->
        <div class="mobile-cards-list mt-4">
          <div
            *ngFor="let item of filteredContributions(); let i = index"
            class="mobile-card animate-slide-up"
            [style.animation-delay.ms]="i * 40"
          >
            <!-- Header: Avatar + Name + Status -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                  {{ item.memberName.charAt(0) }}
                </span>
                <div class="min-w-0">
                  <a [routerLink]="['/members', item.memberId]" class="font-bold text-sm text-slate-800 hover:text-emerald-700 block truncate">
                    {{ item.memberName }}
                  </a>
                  <div *ngIf="item.memberPhone" class="text-[10px] text-slate-400">{{ item.memberPhone }}</div>
                </div>
              </div>

              <span [ngClass]="getStatusBadgeClass(item.status)" class="badge text-[10px] shrink-0">
                {{ getStatusIcon(item.status) }} {{ item.status }}
              </span>
            </div>

            <!-- Stats Row: 3 columns -->
            <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div>
                <div class="text-[9px] text-slate-400">المطلوب</div>
                <div class="text-xs font-bold text-slate-700">{{ item.targetAmount | number }}</div>
              </div>
              <div class="border-r border-l border-slate-200">
                <div class="text-[9px] text-slate-400">المدفوع</div>
                <div class="text-xs font-black text-emerald-700">{{ item.totalPaid | number }}</div>
              </div>
              <div>
                <div class="text-[9px] text-slate-400">المتبقي</div>
                <div class="text-xs font-bold" [ngClass]="item.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'">
                  {{ item.remainingBalance > 0 ? (item.remainingBalance | number) : '✓ خالص' }}
                </div>
              </div>
            </div>

            <!-- Extra Amount Pill if exists -->
            <div *ngIf="item.extraAmount > 0" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              ⭐ مساهمة إضافية: {{ item.extraAmount | number }} ج.م
            </div>

            <!-- Actions Row -->
            <div class="flex items-center gap-1.5 pt-1 border-t border-slate-100">
              <button
                (click)="recordPaymentFor(item)"
                class="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>تسجيل دفعة</span>
              </button>

              <button
                (click)="promptEditTarget(item)"
                title="تعديل الهدف"
                class="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>✏️ هدف</span>
              </button>

              <a
                [routerLink]="['/members', item.memberId]"
                class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="الملف الشخصي"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </a>

              <button
                *ngIf="item.paymentsCount === 0"
                (click)="removeMember(item)"
                title="إلغاء ربط العضو"
                class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div *ngIf="filteredContributions().length === 0" class="text-center py-12 glass-panel rounded-2xl p-6 text-slate-400 text-xs">
            <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div class="font-bold text-sm text-slate-600">لا يوجد مساهمين يطابقون البحث</div>
          </div>
        </div>

      </div>

    </div>

    <!-- Modals -->
    <app-payment-modal
      *ngIf="showPaymentModal()"
      [initialFundId]="fund()?.id"
      [initialMemberId]="modalMemberId()"
      [initialAmount]="modalAmount()"
      (saved)="onPaymentSaved()"
      (closed)="showPaymentModal.set(false)"
    ></app-payment-modal>

    <app-assign-member-modal
      *ngIf="showAssignModal() && fund() as f"
      [fundId]="f.id"
      [defaultTarget]="f.defaultTargetPerMember"
      [existingMemberIds]="existingMemberIds()"
      (saved)="onMemberAssigned()"
      (closed)="showAssignModal.set(false)"
    ></app-assign-member-modal>

    <!-- Confirm Delete Fund Modal -->
    <app-confirm-modal
      *ngIf="showDeleteFundConfirm()"
      title="تأكيد حذف الجمعية / المساهمة"
      message="هل أنت متأكد من حذف هذه الجمعية نهائياً من سجلات العائلة؟"
      confirmText="نعم، تأكيد حذف الجمعية"
      warningNote="تنبيه هام: سيتم حذف جميع سجلات الدفعات والاشتراكات المرتبطة بهذه الجمعية نهائياً من النظام."
      [details]="deleteFundDetails()"
      (confirm)="executeDeleteFund()"
      (cancel)="showDeleteFundConfirm.set(false)"
    ></app-confirm-modal>
  `
})
export class FundDetailComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  @Input() id!: string;

  fund = signal<FundSummary | null>(null);
  contributions = signal<FundMemberContribution[]>([]);

  statusFilters = ['الكل', 'مكتمل', 'دفع جزئي', 'لم يدفع', 'دفع بزيادة'];
  activeStatusFilter = signal<string>('الكل');
  searchQuery = signal<string>('');

  showPaymentModal = signal<boolean>(false);
  showAssignModal = signal<boolean>(false);
  showDeleteFundConfirm = signal<boolean>(false);
  modalMemberId = signal<number | undefined>(undefined);
  modalAmount = signal<number | undefined>(undefined);

  deleteFundDetails = computed<ConfirmDetailItem[]>(() => {
    const f = this.fund();
    if (!f) return [];
    return [
      { label: 'اسم الجمعية / المساهمة', value: f.name },
      { label: 'المطلوب من كل فرد', value: (f.defaultTargetPerMember || 0).toLocaleString() + ' ج.م' },
      { label: 'إجمالي المحصل', value: (f.totalCollected || 0).toLocaleString() + ' ج.م' },
      { label: 'المتبقي للهدف', value: (f.remainingToGoal || 0).toLocaleString() + ' ج.م' },
      { label: 'نسبة الإنجاز', value: (f.progressPercentage || 0) + '%' },
      { label: 'الحالة', value: f.status }
    ];
  });

  existingMemberIds = computed(() => this.contributions().map(c => c.memberId));

  filteredContributions = computed(() => {
    const list = this.contributions();
    const filter = this.activeStatusFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return list.filter(item => {
      if (filter !== 'الكل' && item.status !== filter) {
        return false;
      }
      if (query) {
        return item.memberName.toLowerCase().includes(query) || (item.memberPhone && item.memberPhone.includes(query));
      }
      return true;
    });
  });

  ngOnInit() {
    this.loadFund();
  }

  loadFund() {
    const fundId = parseInt(this.id, 10);
    if (!fundId) return;

    this.api.getFundById(fundId).subscribe(fund => {
      this.fund.set(fund);
    });

    this.api.getFundContributions(fundId).subscribe(contributions => {
      this.contributions.set(contributions);
    });
  }

  getFilterCount(status: string): number {
    return this.contributions().filter(c => c.status === status).length;
  }

  openPaymentModal() {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.modalMemberId.set(undefined);
    this.modalAmount.set(this.fund()?.defaultTargetPerMember || undefined);
    this.showPaymentModal.set(true);
  }

  openAssignModal() {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.showAssignModal.set(true);
  }

  recordPaymentFor(item: FundMemberContribution) {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.modalMemberId.set(item.memberId);
    this.modalAmount.set(item.remainingBalance > 0 ? item.remainingBalance : item.targetAmount);
    this.showPaymentModal.set(true);
  }

  promptEditTarget(item: FundMemberContribution) {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    const current = item.targetAmount;
    const val = prompt(`المبلغ المطلوب حالياً من "${item.memberName}" هو ${current} ج.م.\nأدخل المبلغ المستهدف الجديد:`, current.toString());
    if (val !== null && val.trim() !== '') {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        this.api.updateMemberTarget(item.fundId, item.memberId, num).subscribe({
          next: () => this.loadFund(),
          error: (err) => alert(err.error?.message || 'تعذر تعديل المبلغ المستهدف')
        });
      }
    }
  }

  removeMember(item: FundMemberContribution) {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    if (confirm(`هل أنت متأكد من إلغاء ربط "${item.memberName}" من هذه الجمعية؟`)) {
      this.api.removeMemberFromFund(item.fundId, item.memberId).subscribe({
        next: () => this.loadFund(),
        error: (err) => alert(err.error?.message || 'تعذر حذف العضو')
      });
    }
  }

  openDeleteFundConfirm() {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.showDeleteFundConfirm.set(true);
  }

  executeDeleteFund() {
    const f = this.fund();
    if (!f) return;

    this.api.deleteFund(f.id).subscribe({
      next: () => {
        this.showDeleteFundConfirm.set(false);
        this.router.navigate(['/funds']);
      },
      error: (err) => {
        this.showDeleteFundConfirm.set(false);
        alert(err.error?.message || 'حدث خطأ أثناء حذف الجمعية');
      }
    });
  }

  onPaymentSaved() {
    this.showPaymentModal.set(false);
    this.loadFund();
  }

  onMemberAssigned() {
    this.showAssignModal.set(false);
    this.loadFund();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'مكتمل': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'دفع بزيادة': return 'bg-emerald-600 text-white shadow-sm font-black';
      case 'دفع جزئي': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'لم يدفع':
      default: return 'bg-rose-100 text-rose-700 border border-rose-200';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'مكتمل': return '✓';
      case 'دفع بزيادة': return '⭐';
      case 'دفع جزئي': return '⏳';
      case 'لم يدفع':
      default: return '⚠️';
    }
  }
}
