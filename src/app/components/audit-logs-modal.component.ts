import { Component, OnInit, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuditLog, TrashSummary, TrashItem } from '../models/gam3ya.models';

@Component({
  selector: 'app-audit-logs-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      <div class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shadow-inner">
              📋
            </span>
            <div>
              <h2 class="text-xl font-black">سجل العمليات والتعديلات والـ Logs</h2>
              <p class="text-xs text-slate-400 mt-0.5">
                تتبع تفصيلي لكل عمليات الإضافة، التعديل، والحذف (Soft Delete) مع إمكانية استرجاع المحذوفات
              </p>
            </div>
          </div>

          <button
            (click)="closed.emit()"
            class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Tabs & Filters Bar -->
        <div class="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="tab-logs-btn"
              (click)="activeTab.set('logs')"
              [ngClass]="activeTab() === 'logs' ? 'bg-emerald-700 text-white font-bold shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
              class="px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📑</span>
              <span>سجل العمليات (Logs)</span>
              <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-black">
                {{ logs().length }}
              </span>
            </button>

            <button
              id="tab-trash-btn"
              (click)="activeTab.set('trash')"
              [ngClass]="activeTab() === 'trash' ? 'bg-rose-700 text-white font-bold shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
              class="px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🗑️</span>
              <span>سلة المحذوفات (Soft Delete)</span>
              <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-black">
                {{ totalTrashCount() }}
              </span>
            </button>
          </div>

          <!-- Search in current tab -->
          <div class="relative w-full sm:w-72">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="ابحث في السجلات أو بالاسم..."
              class="w-full px-3.5 py-2 pr-9 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:border-emerald-500 outline-none"
            />
            <span class="absolute right-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-6 overflow-y-auto space-y-3 flex-1">
          
          <!-- TAB 1: AUDIT LOGS -->
          <div *ngIf="activeTab() === 'logs'" class="space-y-3">
            <div *ngIf="loadingLogs()" class="text-center py-12 text-slate-400 text-xs">
              <span class="animate-spin text-lg inline-block mb-2">⏳</span>
              <p>جاري تحميل سجل العمليات...</p>
            </div>

            <div *ngIf="!loadingLogs() && filteredLogs().length === 0" class="text-center py-12 text-slate-400 text-xs">
              لا توجد عمليات مسجلة تطابق بحثك حالياً.
            </div>

            <div
              *ngFor="let log of filteredLogs()"
              class="p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-all shadow-sm flex items-start justify-between gap-4"
            >
              <div class="flex items-start gap-3">
                <span [ngClass]="getActionBadgeClass(log.action)" class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0">
                  {{ getActionIcon(log.action) }}
                </span>
                <div>
                  <div class="flex items-center gap-2">
                    <span [ngClass]="getActionBadgeClass(log.action)" class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border">
                      {{ log.action }}
                    </span>
                    <span class="text-xs font-bold text-slate-700">
                      {{ log.entityName }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-800 font-medium mt-1 leading-relaxed">
                    {{ log.details }}
                  </p>
                  <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                    <span class="text-emerald-700 font-bold">بواسطة: {{ log.performedBy }}</span>
                    <span>•</span>
                    <span>{{ log.timestamp | date:'yyyy/MM/dd - hh:mm a' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: TRASH (SOFT DELETED) -->
          <div *ngIf="activeTab() === 'trash'" class="space-y-3">
            
            <div *ngIf="totalTrashCount() === 0" class="text-center py-14 text-slate-400 text-xs">
              <span class="text-4xl block mb-2">🎉</span>
              <p class="font-bold text-slate-600">سلة المحذوفات فارغة تماماً</p>
              <p class="text-slate-400 text-[11px] mt-1">لا توجد سجلات دفعات أو أفراد أو جمعيات محذوفة حالياً.</p>
            </div>

            <!-- Deleted Payments -->
            <div *ngIf="trash().deletedPayments.length > 0" class="space-y-2">
              <h3 class="text-xs font-black text-rose-700 flex items-center gap-1.5">
                <span>💳</span> الدفعات المحذوفة مؤقتاً ({{ trash().deletedPayments.length }})
              </h3>
              <div
                *ngFor="let item of trash().deletedPayments"
                class="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 transition-all flex items-center justify-between gap-4"
              >
                <div>
                  <span class="text-xs font-black text-slate-800">{{ item.title }}</span>
                  <p class="text-xs text-slate-500 mt-0.5">{{ item.subtitle }}</p>
                  <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                    <span class="text-rose-600">حُذفت بواسطة: {{ item.deletedBy }}</span>
                    <span>•</span>
                    <span>{{ item.deletedAt | date:'yyyy/MM/dd - hh:mm a' }}</span>
                  </div>
                </div>

                <button
                  [id]="'restore-btn-' + item.id"
                  (click)="restore(item)"
                  [disabled]="restoringId() === item.id"
                  class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>🔄</span>
                  <span>{{ restoringId() === item.id ? 'جاري الاسترجاع...' : 'استرجاع الدفعة' }}</span>
                </button>
              </div>
            </div>

            <!-- Deleted Members -->
            <div *ngIf="trash().deletedMembers.length > 0" class="space-y-2 pt-4">
              <h3 class="text-xs font-black text-rose-700 flex items-center gap-1.5">
                <span>👥</span> أفراد العائلة المحذوفين مؤقتاً ({{ trash().deletedMembers.length }})
              </h3>
              <div
                *ngFor="let item of trash().deletedMembers"
                class="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 transition-all flex items-center justify-between gap-4"
              >
                <div>
                  <span class="text-xs font-black text-slate-800">{{ item.title }}</span>
                  <p class="text-xs text-slate-500 mt-0.5">{{ item.subtitle }}</p>
                  <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                    <span class="text-rose-600">حُذف بواسطة: {{ item.deletedBy }}</span>
                    <span>•</span>
                    <span>{{ item.deletedAt | date:'yyyy/MM/dd - hh:mm a' }}</span>
                  </div>
                </div>

                <button
                  [id]="'restore-btn-' + item.id"
                  (click)="restore(item)"
                  [disabled]="restoringId() === item.id"
                  class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>🔄</span>
                  <span>{{ restoringId() === item.id ? 'جاري الاسترجاع...' : 'استرجاع العضو' }}</span>
                </button>
              </div>
            </div>

            <!-- Deleted Funds -->
            <div *ngIf="trash().deletedFunds.length > 0" class="space-y-2 pt-4">
              <h3 class="text-xs font-black text-rose-700 flex items-center gap-1.5">
                <span>🏛️</span> الجمعيات المحذوفة مؤقتاً ({{ trash().deletedFunds.length }})
              </h3>
              <div
                *ngFor="let item of trash().deletedFunds"
                class="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 transition-all flex items-center justify-between gap-4"
              >
                <div>
                  <span class="text-xs font-black text-slate-800">{{ item.title }}</span>
                  <p class="text-xs text-slate-500 mt-0.5">{{ item.subtitle }}</p>
                  <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
                    <span class="text-rose-600">حُذفت بواسطة: {{ item.deletedBy }}</span>
                    <span>•</span>
                    <span>{{ item.deletedAt | date:'yyyy/MM/dd - hh:mm a' }}</span>
                  </div>
                </div>

                <button
                  [id]="'restore-btn-' + item.id"
                  (click)="restore(item)"
                  [disabled]="restoringId() === item.id"
                  class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>🔄</span>
                  <span>{{ restoringId() === item.id ? 'جاري الاسترجاع...' : 'استرجاع الجمعية' }}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span class="text-xs text-slate-400">
            يتم تحديث السجلات تلقائياً مع كل إجراء
          </span>

          <button
            id="close-logs-modal-btn"
            (click)="closed.emit()"
            class="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>

    </div>
  `
})
export class AuditLogsModalComponent implements OnInit {
  private api = inject(ApiService);

  @Output() closed = new EventEmitter<void>();

  activeTab = signal<'logs' | 'trash'>('logs');
  searchQuery = '';
  loadingLogs = signal<boolean>(false);
  logs = signal<AuditLog[]>([]);
  restoringId = signal<number | null>(null);

  trash = this.api.trashSummary;
  totalTrashCount = computed(() => this.trash()?.totalDeletedCount || 0);

  filteredLogs = computed(() => {
    const list = this.logs();
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(l =>
      l.details.toLowerCase().includes(q) ||
      l.performedBy.toLowerCase().includes(q) ||
      l.entityName.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.loadLogs();
    this.api.refreshTrashSummary();
  }

  loadLogs() {
    this.loadingLogs.set(true);
    this.api.getAuditLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.loadingLogs.set(false);
      },
      error: () => this.loadingLogs.set(false)
    });
  }

  restore(item: TrashItem) {
    if (!this.api.isLoggedIn()) {
      alert('يجب تسجيل الدخول كمشرف لإتمام استرجاع العناصر');
      this.api.promptLogin();
      return;
    }

    this.restoringId.set(item.id);
    this.api.restoreItem(item.type, item.id).subscribe({
      next: () => {
        this.restoringId.set(null);
        this.loadLogs();
        this.api.refreshTrashSummary();
      },
      error: (err) => {
        this.restoringId.set(null);
        alert(err.error?.message || 'تعذر استرجاع العنصر');
      }
    });
  }

  getActionBadgeClass(action: string): string {
    if (action.includes('إضافة')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (action.includes('تعديل')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (action.includes('حذف')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (action.includes('استرجاع')) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-purple-50 text-purple-800 border-purple-200';
  }

  getActionIcon(action: string): string {
    if (action.includes('إضافة')) return '➕';
    if (action.includes('تعديل')) return '✏️';
    if (action.includes('حذف')) return '🗑️';
    if (action.includes('استرجاع')) return '🔄';
    return '🔐';
  }
}
