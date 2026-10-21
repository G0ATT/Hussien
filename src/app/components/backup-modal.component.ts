import { Component, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { BackupStatus, DriveBackupFile, BackupResult } from '../models/gam3ya.models';

@Component({
  selector: 'app-backup-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      
      <div class="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100">
        
        <!-- Luxury Gradient Header Banner -->
        <div class="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <span class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm text-3xl mb-3 shadow-inner">
              ☁️
            </span>
            <h2 class="text-xl font-black">النسخ الاحتياطي و Google Drive</h2>
            <p class="text-xs text-emerald-100/80 mt-1">
              حماية بيانات الصندوق السحابية، الجدولة الآلية، والتصدير المباشر
            </p>
          </div>

          <button
            (click)="closeModal()"
            type="button"
            class="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="p-6 sm:p-8 space-y-6">

          <!-- Drive Sync Status Card -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/80 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-xl">
                  📁
                </div>
                <div>
                  <h3 class="text-sm font-black text-slate-800">مجلد النسخ السحابي في Google Drive</h3>
                  <p class="text-[11px] text-slate-500">يتم الرفع التلقائي للنسخ يومياً وحفظها بأمان</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>مجدول آلياً</span>
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-white rounded-xl border border-slate-100">
                <span class="text-slate-400 block text-[10px] mb-0.5 font-bold">معرّف المجلد السحابي:</span>
                <span class="font-mono text-slate-700 text-[11px] break-all select-all">1Ztt-aeCaQBfceF9czGTP1kckNlacwnpm</span>
              </div>
              <div class="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-slate-400 block text-[10px] mb-0.5 font-bold">التكرار الزمني:</span>
                  <span class="font-bold text-slate-800 text-xs">كل 24 ساعة (يومياً)</span>
                </div>
                <a
                  href="https://drive.google.com/drive/folders/1Ztt-aeCaQBfceF9czGTP1kckNlacwnpm"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <span>فتح المجلد</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Alert Notifications -->
          <div *ngIf="uploadSuccessMessage()" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
            <span class="text-base">✅</span>
            <div>
              <p class="font-bold">{{ uploadSuccessMessage() }}</p>
              <p *ngIf="lastUploadedFile()" class="text-[11px] text-emerald-700 mt-0.5 font-mono">
                {{ lastUploadedFile()?.fileName }} ({{ lastUploadedFile()?.fileSizeFormatted }})
              </p>
            </div>
          </div>

          <div *ngIf="uploadErrorMessage()" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <span class="text-base">⚠️</span>
            <div class="flex-1">
              <p class="font-bold">تنبيه أثناء الرفع:</p>
              <p class="text-[11px] text-rose-700 mt-1 leading-relaxed">{{ uploadErrorMessage() }}</p>
            </div>
          </div>

          <!-- Action Buttons Bar -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <!-- Upload to Drive Button -->
            <button
              id="backup-upload-drive-btn"
              (click)="onUploadToDrive()"
              [disabled]="uploading()"
              class="p-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-xs shadow-md shadow-emerald-900/15 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
            >
              <span *ngIf="uploading()" class="animate-spin text-base">⏳</span>
              <svg *ngIf="!uploading()" class="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>{{ uploading() ? 'جاري إنشاء النسخة ورفعها...' : 'رفع نسخة لـ Google Drive الآن' }}</span>
            </button>

            <!-- Download Direct JSON Button -->
            <button
              id="backup-download-btn"
              (click)="onDownloadDirect()"
              [disabled]="downloading()"
              class="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200/80 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
            >
              <span *ngIf="downloading()" class="animate-spin text-base">⏳</span>
              <svg *ngIf="!downloading()" class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{{ downloading() ? 'جاري تجهيز التحميل...' : 'تحميل نسخة كاملة على جهازك (JSON)' }}</span>
            </button>
          </div>

          <!-- Existing Backups on Drive -->
          <div class="space-y-3 pt-2">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-black text-slate-800 flex items-center gap-2">
                <span>سجل النسخ على Google Drive</span>
                <span *ngIf="driveFiles().length > 0" class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                  {{ driveFiles().length }} نسخة
                </span>
              </h3>
              <button
                (click)="loadDriveFiles()"
                class="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>تحديث القائمة</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <!-- List or Empty State -->
            <div *ngIf="loadingFiles()" class="text-center py-8 text-xs text-slate-400">
              <span class="inline-block animate-spin text-lg mb-1">⏳</span>
              <p>جاري فحص المجلد السحابي...</p>
            </div>

            <div *ngIf="!loadingFiles() && driveFiles().length === 0" class="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              <p class="font-bold text-slate-700">لم يتم رفع نسخ سابقة بعد أو القائمة فارغة</p>
              <p class="text-[11px] text-slate-400 mt-1">اضغط على زر "رفع نسخة لـ Google Drive الآن" لأخذ أول نسخة سحابية</p>
            </div>

            <div *ngIf="!loadingFiles() && driveFiles().length > 0" class="space-y-2 max-h-56 overflow-y-auto">
              <div
                *ngFor="let file of driveFiles()"
                class="p-3 rounded-xl bg-white border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all flex items-center justify-between text-xs"
              >
                <div class="flex items-center gap-2.5 truncate">
                  <span class="text-base shrink-0">📄</span>
                  <div class="truncate text-right">
                    <span class="font-bold text-slate-800 block truncate text-[11px]">{{ file.name }}</span>
                    <span class="text-[10px] text-slate-400 font-medium">
                      {{ file.createdTime | date:'yyyy/MM/dd - hh:mm a' }} • الحجم: {{ file.sizeFormatted }}
                    </span>
                  </div>
                </div>

                <a
                  *ngIf="file.webViewLink"
                  [href]="file.webViewLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 text-emerald-700 font-bold text-[10px] shrink-0 transition-colors"
                >
                  معاينة
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class BackupModalComponent implements OnInit {
  private api = inject(ApiService);

  @Output() closed = new EventEmitter<void>();

  status = signal<BackupStatus | null>(null);
  driveFiles = signal<DriveBackupFile[]>([]);
  loadingFiles = signal<boolean>(false);
  uploading = signal<boolean>(false);
  downloading = signal<boolean>(false);

  uploadSuccessMessage = signal<string | null>(null);
  uploadErrorMessage = signal<string | null>(null);
  lastUploadedFile = signal<BackupResult | null>(null);

  ngOnInit() {
    this.loadStatus();
    this.loadDriveFiles();
  }

  loadStatus() {
    this.api.getBackupStatus().subscribe({
      next: (res) => this.status.set(res),
      error: (err) => console.warn('Could not load backup status:', err)
    });
  }

  loadDriveFiles() {
    this.loadingFiles.set(true);
    this.api.getDriveBackups().subscribe({
      next: (list) => {
        this.driveFiles.set(list);
        this.loadingFiles.set(false);
      },
      error: () => {
        this.loadingFiles.set(false);
      }
    });
  }

  onUploadToDrive() {
    this.uploading.set(true);
    this.uploadSuccessMessage.set(null);
    this.uploadErrorMessage.set(null);

    this.api.uploadBackupToDrive().subscribe({
      next: (result) => {
        this.uploading.set(false);
        if (result.success) {
          this.uploadSuccessMessage.set(result.message);
          this.lastUploadedFile.set(result);
          this.loadDriveFiles();
        } else {
          this.uploadErrorMessage.set(result.message);
        }
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadErrorMessage.set(err.error?.message || 'حدث خطأ أثناء الاتصال بالخادم لرفع النسخة الاحتياطية.');
      }
    });
  }

  onDownloadDirect() {
    this.downloading.set(true);
    this.api.downloadBackupFile().subscribe({
      next: (blob) => {
        this.downloading.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        a.download = `Gam3ya_Backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.downloading.set(false);
        alert('تعذر تحميل النسخة الاحتياطية: ' + (err.error?.message || err.message));
      }
    });
  }

  closeModal() {
    this.closed.emit();
  }
}
