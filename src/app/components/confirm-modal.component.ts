import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmDetailItem {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-7 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        
        <!-- Header Ribbon Accent -->
        <div class="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500"></div>

        <div class="flex items-start gap-4 pt-2">
          <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
            🗑️
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-slate-800">{{ title }}</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ message }}</p>

            <div *ngIf="details && details.length > 0" class="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
              <div *ngFor="let item of details" class="flex items-center justify-between">
                <span class="text-slate-400 font-medium">{{ item.label }}:</span>
                <span class="font-bold text-slate-700">{{ item.value }}</span>
              </div>
            </div>

            <div *ngIf="warningNote" class="mt-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/60 text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{{ warningNote }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            (click)="cancel.emit()"
            class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            إلغاء التراجع
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            (click)="confirm.emit()"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🗑️</span>
            <span>{{ confirmText || 'نعم، تأكيد الحذف' }}</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  @Input() title = 'تأكيد الحذف';
  @Input() message = 'هل أنت متأكد من إتمام عملية الحذف؟';
  @Input() confirmText = 'نعم، تأكيد الحذف';
  @Input() warningNote?: string;
  @Input() details?: ConfirmDetailItem[];

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
