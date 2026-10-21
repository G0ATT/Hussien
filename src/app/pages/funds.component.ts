import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { FundSummary } from '../models/gam3ya.models';
import { FundModalComponent } from '../components/fund-modal.component';
import { ConfirmModalComponent, ConfirmDetailItem } from '../components/confirm-modal.component';

@Component({
  selector: 'app-funds',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FundModalComponent, ConfirmModalComponent],
  template: `
    <div class="page-container">
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <span class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg shadow-sm">
              <svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            <span>إدارة الجمعيات وحملات المساهمات</span>
          </h1>
          <p class="section-subheading">
            إنشاء وإدارة الصناديق المستقلة (تجديد المندرة، صندوق التكافل، مساهمات المناسبات)
          </p>
        </div>

        <button
          (click)="openCreateModal()"
          class="btn-primary w-full sm:w-auto justify-center"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>إنشاء جمعية جديدة</span>
        </button>
      </div>

      <!-- Funds Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          *ngFor="let fund of funds(); let i = index"
          class="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between animate-slide-up"
          [style.animation-delay.ms]="i * 50"
        >
          <!-- Top Accent Ribbon -->
          <div 
            [ngClass]="fund.status === 'نشطة' ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700' : 'bg-slate-400'"
            class="absolute top-0 right-0 left-0 h-1.5"
          ></div>

          <div>
            <!-- Status & Date -->
            <div class="flex items-center justify-between gap-2">
              <span
                [ngClass]="fund.status === 'نشطة' ? 'badge-success' : 'badge-warning'"
                class="badge text-[10px] sm:text-xs"
              >
                <span class="w-1.5 h-1.5 rounded-full" [ngClass]="fund.status === 'نشطة' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'"></span>
                {{ fund.status === 'نشطة' ? 'نشطة ومستمرة' : 'مكتملة ومغلقة' }}
              </span>

              <span class="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                {{ fund.createdAt | date:'yyyy/MM/dd' }}
              </span>
            </div>

            <!-- Fund Title & Description -->
            <h2 class="text-lg sm:text-xl font-bold text-slate-800 mt-3 group-hover:text-emerald-700 transition-colors">
              <a [routerLink]="['/funds', fund.id]">
                {{ fund.name }}
              </a>
            </h2>
            <p class="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {{ fund.description || 'لا يوجد وصف مضاف لهذه الحملة.' }}
            </p>

            <!-- Numbers / Targets Grid -->
            <div class="grid grid-cols-2 gap-2.5 mt-4 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div>
                <span class="text-[10px] text-slate-400 block font-medium">المطلوب من كل فرد</span>
                <span class="text-xs sm:text-sm font-black text-slate-800">{{ fund.defaultTargetPerMember | number }} ج.م</span>
              </div>
              <div class="border-r border-slate-200 pr-2.5">
                <span class="text-[10px] text-slate-400 block font-medium">الهدف الإجمالي</span>
                <span class="text-xs sm:text-sm font-black text-slate-800">
                  {{ (fund.overallTargetAmount || fund.totalRequiredTarget) | number }} ج.م
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-4">
              <div class="flex items-center justify-between text-xs mb-1.5">
                <span class="text-slate-500 font-medium">
                  المحصل: <strong class="text-emerald-700 font-black">{{ fund.totalCollected | number }} ج.م</strong>
                </span>
                <span class="font-black text-emerald-700">{{ fund.progressPercentage }}%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  class="bg-gradient-to-l from-emerald-500 to-emerald-700 h-2 rounded-full transition-all duration-500"
                  [style.width.%]="fund.progressPercentage > 100 ? 100 : fund.progressPercentage"
                ></div>
              </div>
              <div class="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                <span>المتبقي: {{ fund.remainingToGoal | number }} ج.م</span>
                <span>{{ fund.totalMembersCount }} مساهمين</span>
              </div>
            </div>
          </div>

          <!-- Card Bottom Actions -->
          <div class="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between gap-2">
            <a
              [routerLink]="['/funds', fund.id]"
              class="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>متابعة الدفعات</span>
            </a>

            <div class="flex items-center gap-1">
              <button
                (click)="openEditModal(fund)"
                title="تعديل بيانات الجمعية"
                class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                (click)="deleteFund(fund)"
                title="حذف الجمعية"
                class="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

        </div>

        <div *ngIf="funds().length === 0" class="col-span-full text-center py-12 glass-panel rounded-3xl p-8 text-slate-400 text-xs">
          <svg class="w-12 h-12 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <div class="font-bold text-sm text-slate-600">لا توجد جمعيات مسجلة حالياً</div>
          <p class="text-xs text-slate-400 mt-1">ابدأ بإنشاء جمعية أو حملة مساهمة جديدة للمشروع العائلي</p>
        </div>
      </div>

    </div>

    <!-- Fund Modal -->
    <app-fund-modal
      *ngIf="showModal()"
      [fund]="selectedFundForEdit()"
      (saved)="onFundSaved()"
      (closed)="showModal.set(false)"
    ></app-fund-modal>

    <!-- Confirm Delete Fund Modal -->
    <app-confirm-modal
      *ngIf="showDeleteConfirm()"
      title="تأكيد حذف الجمعية / المساهمة"
      message="هل أنت متأكد من حذف هذه الجمعية نهائياً من سجلات العائلة؟"
      confirmText="نعم، تأكيد حذف الجمعية"
      warningNote="تنبيه هام: سيتم حذف جميع سجلات الدفعات والاشتراكات المرتبطة بهذه الجمعية نهائياً من النظام."
      [details]="deleteFundDetails()"
      (confirm)="executeDeleteFund()"
      (cancel)="cancelDeleteFund()"
    ></app-confirm-modal>
  `
})
export class FundsComponent implements OnInit {
  private api = inject(ApiService);

  funds = signal<FundSummary[]>([]);
  showModal = signal<boolean>(false);
  selectedFundForEdit = signal<FundSummary | undefined>(undefined);

  showDeleteConfirm = signal<boolean>(false);
  fundToDelete = signal<FundSummary | null>(null);

  deleteFundDetails = computed<ConfirmDetailItem[]>(() => {
    const f = this.fundToDelete();
    if (!f) return [];
    return [
      { label: 'اسم الجمعية / المساهمة', value: f.name },
      { label: 'المطلوب من كل فرد', value: (f.defaultTargetPerMember || 0).toLocaleString() + ' ج.م' },
      { label: 'إجمالي المحصل', value: (f.totalCollected || 0).toLocaleString() + ' ج.م' },
      { label: 'المتبقي للهدف', value: (f.remainingToGoal || 0).toLocaleString() + ' ج.م' },
      { label: 'عدد المشتركين', value: (f.totalMembersCount || 0) + ' عضو' },
      { label: 'نسبة الإنجاز', value: (f.progressPercentage || 0) + '%' },
      { label: 'الحالة', value: f.status }
    ];
  });

  ngOnInit() {
    this.loadFunds();
  }

  loadFunds() {
    this.api.getFunds().subscribe(funds => {
      this.funds.set(funds);
    });
  }

  openCreateModal() {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.selectedFundForEdit.set(undefined);
    this.showModal.set(true);
  }

  openEditModal(fund: FundSummary) {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.selectedFundForEdit.set(fund);
    this.showModal.set(true);
  }

  deleteFund(fund: FundSummary) {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.fundToDelete.set(fund);
    this.showDeleteConfirm.set(true);
  }

  executeDeleteFund() {
    const f = this.fundToDelete();
    if (!f) return;

    this.api.deleteFund(f.id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.fundToDelete.set(null);
        this.loadFunds();
      },
      error: (err) => {
        this.showDeleteConfirm.set(false);
        alert(err.error?.message || 'حدث خطأ أثناء حذف الجمعية');
      }
    });
  }

  cancelDeleteFund() {
    this.showDeleteConfirm.set(false);
    this.fundToDelete.set(null);
  }

  onFundSaved() {
    this.showModal.set(false);
    this.loadFunds();
  }
}
