import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { FamilyMember } from '../models/gam3ya.models';
import { MemberModalComponent } from '../components/member-modal.component';
import { PaymentModalComponent } from '../components/payment-modal.component';
import { ConfirmModalComponent, ConfirmDetailItem } from '../components/confirm-modal.component';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MemberModalComponent, PaymentModalComponent, ConfirmModalComponent],
  template: `
    <div class="page-container">
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <span class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg shadow-sm">
              <svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            <span>إدارة أفراد العائلة</span>
          </h1>
          <p class="section-subheading">
            سجل أبناء عائلة بيت حسين، كشوف الحسابات ومتابعة المساهمات الشخصية
          </p>
        </div>

        <button
          (click)="openCreateModal()"
          class="btn-primary w-full sm:w-auto justify-center"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>إضافة فرد جديد</span>
        </button>
      </div>

      <!-- Search & Stats Bar -->
      <div class="glass-panel p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
        <div class="relative w-full sm:w-96">
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="ابحث بالاسم بالكامل أو رقم الهاتف..."
            class="input-field pr-9"
          />
          <svg class="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="flex flex-wrap items-center justify-between sm:justify-end gap-3 text-xs text-slate-600 bg-slate-50/80 px-3.5 py-2 rounded-xl border border-slate-100">
          <div>
            <span class="text-slate-400">عدد الأفراد: </span>
            <strong class="text-emerald-800 font-black">{{ members().length }}</strong>
          </div>
          <span class="text-slate-300 hidden sm:inline">•</span>
          <div>
            <span class="text-slate-400">إجمالي المسدد: </span>
            <strong class="text-amber-700 font-black">{{ totalPaidSum() | number }} ج.م</strong>
          </div>
        </div>
      </div>

      <!-- Desktop Table (Hidden on Mobile) -->
      <div class="desktop-table-wrapper glass-panel p-6 shadow-sm">
        <table class="desktop-table">
          <thead>
            <tr>
              <th>الاسم بالكامل</th>
              <th>رقم الهاتف</th>
              <th>الجمعيات المشارك بها</th>
              <th>إجمالي ما دفعه</th>
              <th>عدد الدفعات</th>
              <th class="text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              *ngFor="let member of filteredMembers()" 
              class="hover:bg-slate-50/80 transition-colors group"
            >
              <!-- Full Name -->
              <td>
                <div class="font-bold text-slate-800 flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
                    {{ member.fullName.charAt(0) }}
                  </div>
                  <div>
                    <a [routerLink]="['/members', member.id]" class="hover:text-emerald-700 hover:underline">
                      {{ member.fullName }}
                    </a>
                    <div *ngIf="member.notes" class="text-[11px] text-slate-400 font-normal">
                      {{ member.notes }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Phone Number -->
              <td class="text-slate-600">
                <a *ngIf="member.phoneNumber" [href]="'tel:' + member.phoneNumber" class="font-mono text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg text-slate-700 transition-colors inline-flex items-center gap-1">
                  <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{{ member.phoneNumber }}</span>
                </a>
                <span *ngIf="!member.phoneNumber" class="text-slate-300 text-xs">
                  غير مسجل
                </span>
              </td>

              <!-- Enrolled Funds -->
              <td>
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
                  <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{{ member.enrolledFundsCount }} جمعيات</span>
                </span>
              </td>

              <!-- Total Paid -->
              <td class="font-black text-emerald-700 text-base">
                {{ member.totalPaidAllFunds | number }} <span class="text-xs font-normal text-slate-500">ج.م</span>
              </td>

              <!-- Payments Count -->
              <td class="text-slate-600">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium">
                  {{ member.paymentsCount }} دفعة
                </span>
              </td>

              <!-- Actions -->
              <td class="text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <a
                    [routerLink]="['/members', member.id]"
                    class="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>الملف</span>
                  </a>

                  <button
                    (click)="openQuickPay(member)"
                    title="تسجيل دفعة لهذا الفرد"
                    class="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </button>

                  <button
                    (click)="openEditModal(member)"
                    title="تعديل بيانات العضو"
                    class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    (click)="deleteMember(member)"
                    title="حذف العضو"
                    class="p-1.5 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr *ngIf="filteredMembers().length === 0">
              <td colspan="6" class="text-center py-12 text-slate-400 text-xs">
                <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div class="font-bold text-sm text-slate-600">لا توجد نتائج تطابق بحثك</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards List (Visible on Mobile Only) -->
      <div class="mobile-cards-list">
        <div 
          *ngFor="let member of filteredMembers(); let i = index" 
          class="mobile-card animate-slide-up"
          [style.animation-delay.ms]="i * 40"
        >
          <!-- Top Row: Avatar + Name + Enrolled count -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-800 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                {{ member.fullName.charAt(0) }}
              </div>
              <div class="min-w-0">
                <a [routerLink]="['/members', member.id]" class="font-black text-sm text-slate-800 hover:text-emerald-700 block truncate">
                  {{ member.fullName }}
                </a>
                <div *ngIf="member.notes" class="text-[10px] text-slate-400 truncate">
                  {{ member.notes }}
                </div>
              </div>
            </div>

            <span class="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-extrabold border border-blue-100">
              {{ member.enrolledFundsCount }} جمعيات
            </span>
          </div>

          <!-- Phone Number Pill if exists -->
          <div *ngIf="member.phoneNumber" class="flex items-center gap-2">
            <a 
              [href]="'tel:' + member.phoneNumber" 
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-mono transition-colors"
            >
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{{ member.phoneNumber }}</span>
            </a>
          </div>

          <!-- Stats 2-column box -->
          <div class="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-center">
              <div class="text-[9px] text-slate-400">إجمالي ما دفعه</div>
              <div class="text-sm font-black text-emerald-700">
                {{ member.totalPaidAllFunds | number }} <span class="text-[9px] font-normal text-slate-500">ج.م</span>
              </div>
            </div>
            <div class="text-center border-r border-slate-200">
              <div class="text-[9px] text-slate-400">عدد الدفعات</div>
              <div class="text-sm font-bold text-slate-700">
                {{ member.paymentsCount }} دفعة
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-1.5 pt-1 border-t border-slate-100">
            <button
              (click)="openQuickPay(member)"
              class="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>تسجيل دفعة</span>
            </button>

            <a
              [routerLink]="['/members', member.id]"
              class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>الملف</span>
            </a>

            <button
              (click)="openEditModal(member)"
              title="تعديل العضو"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              (click)="deleteMember(member)"
              title="حذف العضو"
              class="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div *ngIf="filteredMembers().length === 0" class="text-center py-12 glass-panel rounded-2xl p-6 text-slate-400 text-xs">
          <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div class="font-bold text-sm text-slate-600">لا توجد نتائج تطابق بحثك</div>
          <p class="text-xs text-slate-400 mt-1">تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح</p>
        </div>
      </div>

    </div>

    <!-- Modals -->
    <app-member-modal
      *ngIf="showModal()"
      [member]="selectedMemberForEdit()"
      (saved)="onMemberSaved()"
      (closed)="showModal.set(false)"
    ></app-member-modal>

    <app-payment-modal
      *ngIf="showPaymentModal()"
      [initialMemberId]="quickPayMemberId()"
      (saved)="onPaymentSaved()"
      (closed)="showPaymentModal.set(false)"
    ></app-payment-modal>

    <!-- Delete Member Confirmation Modal -->
    <app-confirm-modal
      *ngIf="showDeleteConfirm() && memberToDelete() as m"
      title="تأكيد حذف فرد من العائلة"
      message="هل أنت متأكد من حذف هذا العضو من سجل عائلة بيت حسين نهائياً؟"
      confirmText="نعم، تأكيد حذف العضو"
      warningNote="سيتم حذف جميع الدفعات وسجلات المشاركة المسجلة باسم هذا العضو نهائياً"
      [details]="deleteMemberDetails()"
      (confirm)="executeDeleteMember()"
      (cancel)="cancelDeleteMember()"
    ></app-confirm-modal>
  `
})
export class MembersComponent implements OnInit {
  private api = inject(ApiService);

  members = signal<FamilyMember[]>([]);
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  showPaymentModal = signal<boolean>(false);
  selectedMemberForEdit = signal<FamilyMember | undefined>(undefined);
  quickPayMemberId = signal<number | undefined>(undefined);

  showDeleteConfirm = signal<boolean>(false);
  memberToDelete = signal<FamilyMember | null>(null);

  deleteMemberDetails = computed<ConfirmDetailItem[]>(() => {
    const m = this.memberToDelete();
    if (!m) return [];
    return [
      { label: 'الاسم بالكامل', value: m.fullName },
      { label: 'رقم الهاتف', value: m.phoneNumber || 'غير مسجل' },
      { label: 'الرقم القومي', value: m.nationalId || 'غير مسجل' },
      { label: 'إجمالي ما دفعه', value: (m.totalPaidAllFunds || 0).toLocaleString() + ' ج.م' },
      { label: 'عدد الدفعات المسجلة', value: m.paymentsCount + ' دفعة' }
    ];
  });

  totalPaidSum = computed(() => 
    this.members().reduce((acc, m) => acc + (m.totalPaidAllFunds || 0), 0)
  );

  filteredMembers = computed(() => {
    const list = this.members();
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return list;
    return list.filter(m =>
      m.fullName.toLowerCase().includes(q) || (m.phoneNumber && m.phoneNumber.includes(q))
    );
  });

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.api.getFamilyMembers().subscribe(members => {
      this.members.set(members);
    });
  }

  openCreateModal() {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.selectedMemberForEdit.set(undefined);
    this.showModal.set(true);
  }

  openEditModal(member: FamilyMember) {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.selectedMemberForEdit.set(member);
    this.showModal.set(true);
  }

  openQuickPay(member: FamilyMember) {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.quickPayMemberId.set(member.id);
    this.showPaymentModal.set(true);
  }

  deleteMember(member: FamilyMember) {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.memberToDelete.set(member);
    this.showDeleteConfirm.set(true);
  }

  executeDeleteMember() {
    const m = this.memberToDelete();
    if (!m) return;

    this.api.deleteMember(m.id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.memberToDelete.set(null);
        this.loadMembers();
      },
      error: (err) => {
        this.showDeleteConfirm.set(false);
        alert(err.error?.message || 'حدث خطأ أثناء حذف العضو');
      }
    });
  }

  cancelDeleteMember() {
    this.showDeleteConfirm.set(false);
    this.memberToDelete.set(null);
  }

  onMemberSaved() {
    this.showModal.set(false);
    this.loadMembers();
  }

  onPaymentSaved() {
    this.showPaymentModal.set(false);
    this.loadMembers();
  }
}
