import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { DashboardOverview, FundSummary, FundMemberContribution } from '../models/gam3ya.models';
import { PaymentModalComponent } from '../components/payment-modal.component';
import { MemberModalComponent } from '../components/member-modal.component';
import { FundModalComponent } from '../components/fund-modal.component';
import { AssignMemberModalComponent } from '../components/assign-member-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PaymentModalComponent,
    MemberModalComponent,
    FundModalComponent,
    AssignMemberModalComponent
  ],
  template: `
    <div class="page-container">
      
      <!-- Top Hero Welcome Card -->
      <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-5 sm:p-8 text-white shadow-xl shadow-emerald-950/20">
        <div class="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none"></div>
        <div class="absolute -right-10 -top-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div class="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400/20 to-transparent hidden md:block"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] sm:text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              صندوق التكافل العائلي المبارك
            </div>
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              نظام إدارة صندوق ومساهمات عائلة بيت حسين
            </h1>
            <p class="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              منصة ذكية وشاملة لمتابعة مساهمات أفراد العائلة، إدارة الجمعيات وحملات التجديد، وتسجيل الدفعات بشفافية ودقة تامة.
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              (click)="openPaymentModal()"
              class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>تسجيل دفعة سريعة</span>
            </button>

            <button
              (click)="showFundModal.set(true)"
              class="px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>إنشاء جمعية</span>
            </button>
          </div>
        </div>

        <!-- Overall System Stats Grid -->
        <div class="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-emerald-700/50">
          <div class="p-3 sm:p-0 rounded-xl sm:rounded-none bg-emerald-800/30 sm:bg-transparent">
            <div class="text-emerald-200/70 text-[10px] sm:text-xs">إجمالي المحصل في كل الصناديق</div>
            <div class="text-lg sm:text-xl lg:text-2xl font-black text-amber-300 mt-1 animate-count">
              {{ overview()?.totalCollectedAllTime || 0 | number }} <span class="text-[10px] sm:text-xs font-normal text-white">ج.م</span>
            </div>
          </div>
          <div class="p-3 sm:p-0 rounded-xl sm:rounded-none bg-emerald-800/30 sm:bg-transparent">
            <div class="text-emerald-200/70 text-[10px] sm:text-xs">أفراد العائلة المسجلين</div>
            <div class="text-lg sm:text-xl lg:text-2xl font-black text-white mt-1 animate-count">
              {{ overview()?.totalFamilyMembers || 0 }} <span class="text-[10px] sm:text-xs font-normal text-emerald-200">فرد</span>
            </div>
          </div>
          <div class="p-3 sm:p-0 rounded-xl sm:rounded-none bg-emerald-800/30 sm:bg-transparent">
            <div class="text-emerald-200/70 text-[10px] sm:text-xs">الجمعيات النشطة</div>
            <div class="text-lg sm:text-xl lg:text-2xl font-black text-emerald-300 mt-1 animate-count">
              {{ overview()?.activeFunds || 0 }} <span class="text-[10px] sm:text-xs font-normal text-emerald-200">جمعيات</span>
            </div>
          </div>
          <div class="p-3 sm:p-0 rounded-xl sm:rounded-none bg-emerald-800/30 sm:bg-transparent">
            <div class="text-emerald-200/70 text-[10px] sm:text-xs">إجمالي عدد الإيصالات</div>
            <div class="text-lg sm:text-xl lg:text-2xl font-black text-white mt-1 animate-count">
              {{ overview()?.totalPaymentsCount || 0 }} <span class="text-[10px] sm:text-xs font-normal text-emerald-200">دفعة</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Fund Selection Navigation Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 class="section-heading">
            <svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            الجمعية المحددة للعرض والمتابعة
          </h2>
          <p class="section-subheading">
            اختر الجمعية أو الحملة لمراجعة إحصائياتها ودفعات أفرادها
          </p>
        </div>

        <!-- Fund Switcher Pills -->
        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-100/80 p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 overflow-x-auto">
          <button
            *ngFor="let fund of funds()"
            (click)="selectFund(fund)"
            [ngClass]="selectedFund()?.id === fund.id 
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 font-bold' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'"
            class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer"
          >
            <span>{{ fund.name }}</span>
            <span 
              [ngClass]="selectedFund()?.id === fund.id ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'"
              class="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px]"
            >
              {{ fund.status }}
            </span>
          </button>
        </div>
      </div>

      <!-- Summary Analytics Cards for Selected Fund -->
      <div *ngIf="selectedFund() as sf" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        <!-- Card 1: Total Collected -->
        <div class="stat-card group hover:border-emerald-500/50">
          <div class="flex items-center justify-between">
            <span class="text-[10px] sm:text-xs font-bold text-slate-500">إجمالي المحصل</span>
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-3 sm:mt-4">
            <div class="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-800">
              {{ sf.totalCollected | number }}
              <span class="text-[10px] sm:text-xs font-semibold text-slate-500">ج.م</span>
            </div>
            <div class="text-[10px] sm:text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <span>نسبة الإنجاز:</span>
              <strong class="font-bold">{{ sf.progressPercentage }}%</strong>
            </div>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 sm:h-2 mt-3 sm:mt-4 overflow-hidden">
            <div 
              class="bg-emerald-600 h-full rounded-full transition-all duration-500" 
              [style.width.%]="sf.progressPercentage > 100 ? 100 : sf.progressPercentage"
            ></div>
          </div>
        </div>

        <!-- Card 2: Remaining to Goal -->
        <div class="stat-card group hover:border-amber-500/50">
          <div class="flex items-center justify-between">
            <span class="text-[10px] sm:text-xs font-bold text-slate-500">المتبقي للهدف</span>
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div class="mt-3 sm:mt-4">
            <div class="text-xl sm:text-2xl lg:text-3xl font-black text-amber-700">
              {{ sf.remainingToGoal | number }}
              <span class="text-[10px] sm:text-xs font-semibold text-slate-500">ج.م</span>
            </div>
            <div class="text-[10px] sm:text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>الهدف:</span>
              <strong class="text-slate-700">{{ sf.totalRequiredTarget | number }} ج.م</strong>
            </div>
          </div>
          <div class="text-[10px] text-amber-600/80 mt-3 sm:mt-4 font-medium hidden sm:block">
            المطلوب من كل فرد: {{ sf.defaultTargetPerMember | number }} ج.م
          </div>
        </div>

        <!-- Card 3: Total Contributors -->
        <div class="stat-card group hover:border-blue-500/50">
          <div class="flex items-center justify-between">
            <span class="text-[10px] sm:text-xs font-bold text-slate-500">المشاركون</span>
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-3 sm:mt-4">
            <div class="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800">
              {{ sf.totalMembersCount }}
              <span class="text-[10px] sm:text-xs font-semibold text-slate-500">فرد</span>
            </div>
            <div class="text-[10px] sm:text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1 sm:gap-2">
              <span class="text-emerald-700 font-bold">{{ sf.fullyPaidCount }} مكتمل</span>
              <span class="hidden sm:inline">•</span>
              <span class="text-amber-700 font-bold">{{ sf.partiallyPaidCount }} جزئي</span>
            </div>
          </div>
          <div class="flex items-center gap-1 sm:gap-2 text-[10px] text-slate-500 mt-3 sm:mt-4">
            <span class="text-rose-600 font-semibold">{{ sf.unpaidCount }} لم يدفع</span>
            <span *ngIf="sf.overpaidCount > 0" class="text-emerald-600 font-bold">
              • {{ sf.overpaidCount }} بزيادة
            </span>
          </div>
        </div>

        <!-- Card 4: Fund Status & Quick Enroll -->
        <div class="stat-card group hover:border-purple-500/50 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] sm:text-xs font-bold text-slate-500">حالة الحملة</span>
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
            <div class="mt-3">
              <div class="text-xl sm:text-2xl font-black text-purple-900">
                {{ sf.totalPaymentsCount }} <span class="text-[10px] sm:text-xs font-semibold text-slate-500">دفعة</span>
              </div>
              <div class="text-[10px] sm:text-xs text-slate-500 mt-1 line-clamp-1">
                {{ sf.description || 'لا يوجد وصف مضاف' }}
              </div>
            </div>
          </div>

          <div class="mt-3 sm:mt-4">
            <button
              (click)="showAssignModal.set(true)"
              class="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>ربط عضو بالجمعية</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Main Contributions Tracking Section inside Fund -->
      <div *ngIf="selectedFund() as sf" class="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm">
        
        <!-- Controls Bar: Search & Status Filters -->
        <div class="flex flex-col gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-100">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>متابعة مساهمات "{{ sf.name }}"</span>
              </h3>
              <p class="section-subheading">
                جدول الدفعات والمبالغ المتبقية والزيادات لكل فرد
              </p>
            </div>
          </div>

          <!-- Status Filter Pills -->
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

        <!-- Search Input & Status Info -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
          <div class="relative w-full sm:w-80">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="ابحث باسم الفرد أو رقم الهاتف..."
              class="input-field pr-9"
            />
            <svg class="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div class="text-[10px] sm:text-xs text-slate-500 flex items-center gap-3">
            <span>عدد الأفراد: <strong class="text-slate-800">{{ filteredContributions().length }}</strong></span>
            <span *ngIf="loading()" class="text-emerald-600 flex items-center gap-1 font-semibold animate-pulse">
              جاري التحديث...
            </span>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="desktop-table-wrapper mt-4">
          <table class="desktop-table">
            <thead>
              <tr>
                <th>اسم العضو</th>
                <th>المبلغ المطلوب</th>
                <th>إجمالي المدفوع</th>
                <th>عدد الدفعات</th>
                <th>المتبقي عليه</th>
                <th>مساهمة إضافية</th>
                <th>حالة السداد</th>
                <th class="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filteredContributions()">
                <!-- Member Name & Phone -->
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

                <td class="font-semibold text-slate-700">
                  {{ item.targetAmount | number }} ج.م
                </td>

                <td class="font-bold text-emerald-700">
                  {{ item.totalPaid | number }} ج.م
                </td>

                <td class="text-slate-600">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium">
                    {{ item.paymentsCount }} مرات
                  </span>
                </td>

                <td>
                  <div *ngIf="item.remainingBalance > 0" class="font-bold text-rose-600">
                    {{ item.remainingBalance | number }} ج.م
                  </div>
                  <div *ngIf="item.remainingBalance === 0" class="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span>✓</span> 0 ج.م (خالص)
                  </div>
                </td>

                <td>
                  <div *ngIf="item.extraAmount > 0" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs shadow-sm">
                    <span>⭐ زيادة:</span>
                    <span>{{ item.extraAmount | number }} ج.م</span>
                  </div>
                  <div *ngIf="item.extraAmount === 0" class="text-slate-300 text-xs">—</div>
                </td>

                <td>
                  <span 
                    [ngClass]="getStatusBadgeClass(item.status)"
                    class="badge"
                  >
                    <span>{{ getStatusIcon(item.status) }}</span>
                    <span>{{ item.status }}</span>
                  </span>
                </td>

                <td class="text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      (click)="recordPaymentFor(item)"
                      title="تسجيل دفعة جديدة لهذا العضو"
                      class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <span>+ دفع</span>
                    </button>
                    <a
                      [routerLink]="['/members', item.memberId]"
                      title="عرض الملف الشخصي"
                      class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredContributions().length === 0">
                <td colspan="8" class="text-center py-12 text-slate-400">
                  <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div class="font-bold text-sm text-slate-600">لا يوجد أفراد يطابقون البحث أو التصفية</div>
                  <p class="text-xs text-slate-400 mt-1">يمكنك ربط أفراد جدد بالجمعية أو تغيير معايير البحث</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="mobile-cards-list mt-4">
          <div 
            *ngFor="let item of filteredContributions(); let i = index"
            class="mobile-card animate-slide-up"
            [style.animation-delay.ms]="i * 50"
          >
            <!-- Header: Name + Status -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                  {{ item.memberName.charAt(0) }}
                </span>
                <div>
                  <a [routerLink]="['/members', item.memberId]" class="font-bold text-sm text-slate-800 hover:text-emerald-700">
                    {{ item.memberName }}
                  </a>
                  <div *ngIf="item.memberPhone" class="text-[10px] text-slate-400">{{ item.memberPhone }}</div>
                </div>
              </div>
              <span 
                [ngClass]="getStatusBadgeClass(item.status)"
                class="badge text-[10px]"
              >
                {{ getStatusIcon(item.status) }} {{ item.status }}
              </span>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div class="text-center">
                <div class="text-[9px] text-slate-400">المطلوب</div>
                <div class="text-xs font-bold text-slate-700">{{ item.targetAmount | number }}</div>
              </div>
              <div class="text-center border-r border-l border-slate-200">
                <div class="text-[9px] text-slate-400">المدفوع</div>
                <div class="text-xs font-black text-emerald-700">{{ item.totalPaid | number }}</div>
              </div>
              <div class="text-center">
                <div class="text-[9px] text-slate-400">المتبقي</div>
                <div class="text-xs font-bold" [ngClass]="item.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'">
                  {{ item.remainingBalance > 0 ? (item.remainingBalance | number) : '✓ خالص' }}
                </div>
              </div>
            </div>

            <!-- Extra amount if exists -->
            <div *ngIf="item.extraAmount > 0" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              ⭐ مساهمة إضافية: {{ item.extraAmount | number }} ج.م
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 pt-1">
              <button
                (click)="recordPaymentFor(item)"
                class="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                تسجيل دفعة
              </button>
              <a
                [routerLink]="['/members', item.memberId]"
                class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                الملف
              </a>
            </div>
          </div>

          <div *ngIf="filteredContributions().length === 0" class="text-center py-10 text-slate-400 text-xs">
            <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            لا يوجد أفراد يطابقون البحث
          </div>
        </div>

      </div>

      <!-- Bottom Grid: Recent Payments Activity Feed -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        <!-- Recent Payments Feed (2 cols) -->
        <div class="lg:col-span-2 glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm">
          <div class="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
            <div>
              <h3 class="text-sm sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                أحدث الدفعات المسجلة
              </h3>
              <p class="section-subheading hidden sm:block">
                آخر الإيداعات التي تمت في مختلف الجمعيات
              </p>
            </div>
            <a routerLink="/payments" class="text-[10px] sm:text-xs text-emerald-700 hover:underline font-bold whitespace-nowrap">
              عرض الكل ←
            </a>
          </div>

          <div class="divide-y divide-slate-100 mt-3 sm:mt-4">
            <div 
              *ngFor="let payment of overview()?.recentPayments" 
              class="py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/60 px-2 rounded-xl sm:rounded-2xl transition-colors"
            >
              <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-xs sm:text-sm text-slate-800 truncate">
                    {{ payment.memberName }}
                  </div>
                  <div class="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                    <span class="text-emerald-700 font-semibold">{{ payment.fundName }}</span>
                    <span class="hidden sm:inline">•</span>
                    <span class="hidden sm:inline">{{ payment.paymentMethod || 'نقدي' }}</span>
                    <span class="text-[10px] text-slate-400">{{ payment.paymentDate | date:'yyyy/MM/dd' }}</span>
                  </div>
                  <div *ngIf="payment.notes" class="text-[10px] text-slate-400 italic mt-0.5 truncate hidden sm:block">
                    "{{ payment.notes }}"
                  </div>
                </div>
              </div>

              <div class="text-left font-black text-emerald-700 text-sm sm:text-base whitespace-nowrap shrink-0">
                +{{ payment.amount | number }} <span class="text-[10px] sm:text-xs font-normal text-slate-500">ج.م</span>
              </div>
            </div>

            <div *ngIf="!overview()?.recentPayments?.length" class="text-center py-8 text-slate-400 text-xs">
              لا توجد دفعات مسجلة بعد.
            </div>
          </div>
        </div>

        <!-- Quick Info & Instructions Widget -->
        <div class="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm space-y-3 sm:space-y-4">
          <div class="flex items-center gap-2 font-bold text-slate-800 text-sm sm:text-base pb-3 border-b border-slate-100">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            إرشادات صندوق العائلة
          </div>

          <div class="space-y-2.5 sm:space-y-3 text-xs text-slate-600 leading-relaxed">
            <div class="p-3 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <strong class="text-emerald-900 block font-bold mb-1 text-[11px]">حساب المتبقي والزيادة:</strong>
              <span class="text-[11px]">إذا سدد العضو مبلغا يتجاوز المطلوب، يظهر المتبقي كـ <strong>0 ج.م</strong> ويظهر الفرق كـ <strong>زيادة</strong>.</span>
            </div>

            <div class="p-3 rounded-xl sm:rounded-2xl bg-amber-50/70 border border-amber-100">
              <strong class="text-amber-900 block font-bold mb-1 text-[11px]">تعديل الهدف لكل فرد:</strong>
              <span class="text-[11px]">المبلغ الافتراضي 6000 ج.م، ويمكن للإدارة تخصيص هدف مستقل لأي عضو.</span>
            </div>

            <div class="p-3 rounded-xl sm:rounded-2xl bg-slate-100/70">
              <strong class="text-slate-800 block font-bold mb-1 text-[11px]">الطباعة والتقارير:</strong>
              <span class="text-[11px]">يمكن استعراض كشف حساب كامل لكل فرد من صفحة أفراد العائلة.</span>
            </div>
          </div>

          <div class="pt-1 sm:pt-2">
            <button
              (click)="showMemberModal.set(true)"
              class="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>إضافة فرد جديد للعائلة</span>
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- Modals -->
    <app-payment-modal
      *ngIf="showPaymentModal()"
      [initialFundId]="modalFundId()"
      [initialMemberId]="modalMemberId()"
      (saved)="onPaymentSaved()"
      (closed)="showPaymentModal.set(false)"
    ></app-payment-modal>

    <app-member-modal
      *ngIf="showMemberModal()"
      (saved)="onMemberSaved()"
      (closed)="showMemberModal.set(false)"
    ></app-member-modal>

    <app-fund-modal
      *ngIf="showFundModal()"
      (saved)="onFundSaved()"
      (closed)="showFundModal.set(false)"
    ></app-fund-modal>

    <app-assign-member-modal
      *ngIf="showAssignModal() && selectedFund() as sf"
      [fundId]="sf.id"
      [defaultTarget]="sf.defaultTargetPerMember"
      [existingMemberIds]="existingMemberIds()"
      (saved)="onMemberAssigned()"
      (closed)="showAssignModal.set(false)"
    ></app-assign-member-modal>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  // Core Data Signals
  overview = signal<DashboardOverview | null>(null);
  funds = signal<FundSummary[]>([]);
  selectedFund = signal<FundSummary | null>(null);
  contributions = signal<FundMemberContribution[]>([]);
  loading = signal<boolean>(true);

  // Filter & Search Signals
  statusFilters = ['الكل', 'مكتمل', 'دفع جزئي', 'لم يدفع', 'دفع بزيادة'];
  activeStatusFilter = signal<string>('الكل');
  searchQuery = signal<string>('');

  // Modals state signals
  showPaymentModal = signal<boolean>(false);
  showMemberModal = signal<boolean>(false);
  showFundModal = signal<boolean>(false);
  showAssignModal = signal<boolean>(false);
  modalFundId = signal<number | undefined>(undefined);
  modalMemberId = signal<number | undefined>(undefined);

  // Computed Signals (Automated reactivity with ZERO button presses)
  existingMemberIds = computed(() => this.contributions().map(c => c.memberId));

  filteredContributions = computed(() => {
    const list = this.contributions();
    const filter = this.activeStatusFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return list.filter(item => {
      // 1. Status Filter
      if (filter !== 'الكل' && item.status !== filter) {
        return false;
      }
      // 2. Search Query
      if (query) {
        const matchName = item.memberName.toLowerCase().includes(query);
        const matchPhone = item.memberPhone ? item.memberPhone.includes(query) : false;
        return matchName || matchPhone;
      }
      return true;
    });
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.api.getDashboardOverview().subscribe(overview => {
      this.overview.set(overview);
      this.funds.set(overview.funds);
      this.loading.set(false);

      if (!this.selectedFund() && overview.funds.length > 0) {
        this.selectFund(overview.funds[0]);
      } else if (this.selectedFund()) {
        const updated = overview.funds.find(f => f.id === this.selectedFund()!.id);
        if (updated) this.selectFund(updated);
      }
    });
  }

  selectFund(fund: FundSummary) {
    this.selectedFund.set(fund);
    this.api.getFundContributions(fund.id).subscribe(contributions => {
      this.contributions.set(contributions);
    });
  }

  getFilterCount(status: string): number {
    return this.contributions().filter(c => c.status === status).length;
  }

  openPaymentModal() {
    this.modalFundId.set(this.selectedFund()?.id);
    this.modalMemberId.set(undefined);
    this.showPaymentModal.set(true);
  }

  recordPaymentFor(item: FundMemberContribution) {
    this.modalFundId.set(item.fundId);
    this.modalMemberId.set(item.memberId);
    this.showPaymentModal.set(true);
  }

  onPaymentSaved() {
    this.showPaymentModal.set(false);
    this.loadData();
  }

  onMemberSaved() {
    this.showMemberModal.set(false);
    this.loadData();
  }

  onFundSaved() {
    this.showFundModal.set(false);
    this.loadData();
  }

  onMemberAssigned() {
    this.showAssignModal.set(false);
    this.loadData();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'مكتمل':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'دفع بزيادة':
        return 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-black';
      case 'دفع جزئي':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'لم يدفع':
      default:
        return 'bg-rose-100 text-rose-700 border border-rose-200';
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
