import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PaymentModalComponent } from './components/payment-modal.component';
import { LoginModalComponent } from './components/login-modal.component';
import { AuditLogsModalComponent } from './components/audit-logs-modal.component';
import { UsersModalComponent } from './components/users-modal.component';
import { BackupModalComponent } from './components/backup-modal.component';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    PaymentModalComponent,
    LoginModalComponent,
    AuditLogsModalComponent,
    UsersModalComponent,
    BackupModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  api = inject(ApiService);

  mobileMenuOpen = signal(false);
  showGlobalPaymentModal = signal(false);

  currentUser = this.api.currentUser;
  isLoggedIn = this.api.isLoggedIn;
  isAdmin = computed(() => this.currentUser()?.role === 'مدير النظام');
  showLoginModal = this.api.showLoginModal;
  showLogsModal = this.api.showLogsModal;
  showUsersModal = this.api.showUsersModal;
  showBackupModal = this.api.showBackupModal;
  trashCount = computed(() => this.api.trashSummary()?.totalDeletedCount || 0);

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  openUsersModal() {
    this.showUsersModal.set(true);
    this.closeMobileMenu();
  }

  openBackupModal() {
    this.showBackupModal.set(true);
    this.closeMobileMenu();
  }

  openPaymentModal() {
    if (!this.api.isLoggedIn()) {
      this.api.promptLogin();
      return;
    }
    this.showGlobalPaymentModal.set(true);
    this.closeMobileMenu();
  }

  openLogin() {
    this.showLoginModal.set(true);
    this.closeMobileMenu();
  }

  openLogs() {
    this.showLogsModal.set(true);
    this.closeMobileMenu();
  }

  logout() {
    this.api.logout();
    this.closeMobileMenu();
  }

  onPaymentSaved() {
    this.showGlobalPaymentModal.set(false);
    this.api.getFunds().subscribe();
    this.api.getFamilyMembers().subscribe();
  }
}
