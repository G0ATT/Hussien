import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, map, tap } from 'rxjs';
import {
  FamilyMember,
  MemberProfile,
  FundSummary,
  FundMemberContribution,
  PaymentDetail,
  DashboardOverview,
  CreatePaymentRequest,
  CreateFundRequest,
  CreateMemberRequest,
  User,
  UserDetail,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  LoginResponse,
  AuditLog,
  TrashSummary,
  TrashItem,
  DriveBackupFile,
  BackupResult,
  BackupStatus
} from '../models/gam3ya.models';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  funds = signal<FundSummary[]>([]);
  members = signal<FamilyMember[]>([]);
  users = signal<UserDetail[]>([]);

  // Authentication State
  token = signal<string | null>(this.getStoredToken());
  currentUser = signal<User | null>(this.getStoredUser());
  isLoggedIn = computed(() => !!this.currentUser());

  // Global Modals State
  showLoginModal = signal<boolean>(false);
  showLogsModal = signal<boolean>(false);
  showUsersModal = signal<boolean>(false);
  showBackupModal = signal<boolean>(false);

  // Trash State
  trashSummary = signal<TrashSummary>({
    deletedPayments: [],
    deletedMembers: [],
    deletedFunds: [],
    totalDeletedCount: 0
  });

  constructor() {
    // Immediately pre-fetch funds, members, and trash summary
    this.getFunds().subscribe();
    this.getFamilyMembers().subscribe();
    this.refreshTrashSummary();
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('gam3ya_token');
    } catch {
      return null;
    }
  }

  private getStoredUser(): User | null {
    try {
      const data = localStorage.getItem('gam3ya_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  getAuthHeaders(): { headers?: { [header: string]: string } } {
    const t = this.token();
    return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        if (res?.token) {
          localStorage.setItem('gam3ya_token', res.token);
          localStorage.setItem('gam3ya_user', JSON.stringify(res.user));
          this.token.set(res.token);
          this.currentUser.set(res.user);
          this.showLoginModal.set(false);
          this.refreshTrashSummary();
        }
      })
    );
  }

  logout() {
    try {
      localStorage.removeItem('gam3ya_token');
      localStorage.removeItem('gam3ya_user');
    } catch {}
    this.token.set(null);
    this.currentUser.set(null);
  }

  promptLogin() {
    this.showLoginModal.set(true);
  }

  // ==========================================
  // USERS MANAGEMENT
  // ==========================================
  openUsersModal() {
    if (!this.isLoggedIn()) {
      this.promptLogin();
      return;
    }
    this.showUsersModal.set(true);
  }

  getUsers(): Observable<UserDetail[]> {
    return this.http.get<UserDetail[]>(`${this.apiUrl}/users`, this.getAuthHeaders()).pipe(
      tap(list => this.users.set(list)),
      catchError(err => {
        console.warn('API error fetching users:', err);
        return of([]);
      })
    );
  }

  createUser(req: CreateUserRequest): Observable<UserDetail> {
    return this.http.post<UserDetail>(`${this.apiUrl}/users`, req, this.getAuthHeaders()).pipe(
      tap(() => this.getUsers().subscribe())
    );
  }

  updateUser(id: number, req: UpdateUserRequest): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.apiUrl}/users/${id}`, req, this.getAuthHeaders()).pipe(
      tap(() => this.getUsers().subscribe())
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, this.getAuthHeaders()).pipe(
      tap(() => this.getUsers().subscribe())
    );
  }

  // ==========================================
  // AUDIT LOGS & TRASH (SOFT DELETE)
  // ==========================================
  getAuditLogs(limit: number = 100): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/auditlogs?limit=${limit}`).pipe(
      catchError(err => {
        console.warn('API error fetching audit logs:', err);
        return of([]);
      })
    );
  }

  getTrashSummary(): Observable<TrashSummary> {
    return this.http.get<TrashSummary>(`${this.apiUrl}/auditlogs/trash`).pipe(
      tap(summary => this.trashSummary.set(summary)),
      catchError(err => {
        console.warn('API error fetching trash summary:', err);
        return of({ deletedPayments: [], deletedMembers: [], deletedFunds: [], totalDeletedCount: 0 });
      })
    );
  }

  refreshTrashSummary() {
    this.getTrashSummary().subscribe();
  }

  restoreItem(entityType: string, id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/auditlogs/restore/${entityType}/${id}`, {}, this.getAuthHeaders()).pipe(
      tap(() => {
        this.refreshTrashSummary();
        this.getFunds().subscribe();
        this.getFamilyMembers().subscribe();
      })
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================
  getDashboardOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.apiUrl}/dashboard/overview`).pipe(
      catchError(err => {
        console.warn('API error fetching dashboard overview, using fallback:', err);
        return of(this.getMockDashboardOverview());
      })
    );
  }

  // ==========================================
  // FUNDS / CAMPAIGNS
  // ==========================================
  getFunds(): Observable<FundSummary[]> {
    return this.http.get<FundSummary[]>(`${this.apiUrl}/funds`).pipe(
      tap(funds => this.funds.set(funds)),
      catchError(err => {
        console.warn('API error fetching funds, using fallback:', err);
        const mock = this.getMockFunds();
        this.funds.set(mock);
        return of(mock);
      })
    );
  }

  getFundById(id: number): Observable<FundSummary> {
    return this.http.get<FundSummary>(`${this.apiUrl}/funds/${id}`).pipe(
      catchError(err => {
        console.warn(`API error fetching fund #${id}, using fallback:`, err);
        const fund = this.getMockFunds().find(f => f.id === id) || this.getMockFunds()[0];
        return of(fund);
      })
    );
  }

  createFund(data: CreateFundRequest): Observable<FundSummary> {
    return this.http.post<FundSummary>(`${this.apiUrl}/funds`, data, this.getAuthHeaders()).pipe(
      tap(() => this.getFunds().subscribe())
    );
  }

  updateFund(id: number, data: CreateFundRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/funds/${id}`, data, this.getAuthHeaders()).pipe(
      tap(() => this.getFunds().subscribe())
    );
  }

  deleteFund(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/funds/${id}`, this.getAuthHeaders()).pipe(
      tap(() => {
        this.funds.update(list => list.filter(f => f.id !== id));
        this.refreshTrashSummary();
      })
    );
  }

  // ==========================================
  // FUND CONTRIBUTIONS (TRACKING PER MEMBER)
  // ==========================================
  getFundContributions(fundId: number): Observable<FundMemberContribution[]> {
    return this.http.get<FundMemberContribution[]>(`${this.apiUrl}/funds/${fundId}/contributions`).pipe(
      catchError(err => {
        console.warn(`API error fetching contributions for fund #${fundId}, using fallback:`, err);
        return of(this.getMockContributions(fundId));
      })
    );
  }

  assignMemberToFund(fundId: number, memberId: number, customTargetAmount?: number, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/funds/${fundId}/members`, {
      fundId,
      familyMemberId: memberId,
      customTargetAmount,
      notes
    }, this.getAuthHeaders());
  }

  updateMemberTarget(fundId: number, memberId: number, targetAmount: number, notes?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/funds/${fundId}/members/${memberId}/target`, {
      targetAmount,
      notes
    }, this.getAuthHeaders());
  }

  removeMemberFromFund(fundId: number, memberId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/funds/${fundId}/members/${memberId}`, this.getAuthHeaders());
  }

  // ==========================================
  // FAMILY MEMBERS
  // ==========================================
  getFamilyMembers(): Observable<FamilyMember[]> {
    return this.http.get<FamilyMember[]>(`${this.apiUrl}/familymembers`).pipe(
      tap(members => this.members.set(members)),
      catchError(err => {
        console.warn('API error fetching family members, using fallback:', err);
        const mock = this.getMockMembers();
        this.members.set(mock);
        return of(mock);
      })
    );
  }

  getMemberProfile(id: number): Observable<MemberProfile> {
    return this.http.get<MemberProfile>(`${this.apiUrl}/familymembers/${id}`).pipe(
      catchError(err => {
        console.warn(`API error fetching member profile #${id}, using fallback:`, err);
        return of(this.getMockMemberProfile(id));
      })
    );
  }

  createMember(data: CreateMemberRequest): Observable<FamilyMember> {
    return this.http.post<FamilyMember>(`${this.apiUrl}/familymembers`, data, this.getAuthHeaders()).pipe(
      tap(() => this.getFamilyMembers().subscribe())
    );
  }

  updateMember(id: number, data: CreateMemberRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/familymembers/${id}`, data, this.getAuthHeaders()).pipe(
      tap(() => this.getFamilyMembers().subscribe())
    );
  }

  deleteMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/familymembers/${id}`, this.getAuthHeaders()).pipe(
      tap(() => {
        this.members.update(list => list.filter(m => m.id !== id));
        this.refreshTrashSummary();
      })
    );
  }

  // ==========================================
  // PAYMENTS LOGGING & HISTORY
  // ==========================================
  getPayments(fundId?: number, memberId?: number, search?: string): Observable<PaymentDetail[]> {
    let params = new HttpParams();
    if (fundId) params = params.set('fundId', fundId.toString());
    if (memberId) params = params.set('memberId', memberId.toString());
    if (search) params = params.set('search', search);

    return this.http.get<PaymentDetail[]>(`${this.apiUrl}/payments`, { params }).pipe(
      catchError(err => {
        console.warn('API error fetching payments, using fallback:', err);
        let list = this.getMockPayments();
        if (fundId) list = list.filter(p => p.fundId === fundId);
        if (memberId) list = list.filter(p => p.familyMemberId === memberId);
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(p => p.memberName.toLowerCase().includes(s) || p.fundName.toLowerCase().includes(s));
        }
        return of(list);
      })
    );
  }

  createPayment(data: CreatePaymentRequest): Observable<PaymentDetail> {
    if (!data.recordedBy && this.currentUser()) {
      data.recordedBy = this.currentUser()!.fullName;
    }
    return this.http.post<PaymentDetail>(`${this.apiUrl}/payments`, data, this.getAuthHeaders()).pipe(
      tap(() => this.refreshTrashSummary())
    );
  }

  getPaymentById(id: number): Observable<PaymentDetail> {
    return this.http.get<PaymentDetail>(`${this.apiUrl}/payments/${id}`).pipe(
      catchError(err => {
        console.warn(`API error fetching payment #${id}, using fallback:`, err);
        const p = this.getMockPayments().find(item => item.id === id) || this.getMockPayments()[0];
        return of(p);
      })
    );
  }

  updatePayment(id: number, data: {
    fundId?: number;
    familyMemberId?: number;
    amount: number;
    paymentDate: string;
    paymentMethod?: string;
    recordedBy?: string;
    notes?: string;
  }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/payments/${id}`, data, this.getAuthHeaders());
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/payments/${id}`, this.getAuthHeaders()).pipe(
      tap(() => this.refreshTrashSummary())
    );
  }

  // ==========================================
  // FALLBACK MOCK DATA (High quality mirror of DB seed)
  // ==========================================
  private getMockFunds(): FundSummary[] {
    return [
      {
        id: 1,
        name: 'تجديد المندرة',
        description: 'مشروع صيانة وتجديد المندرة الكبيرة للعائلة، تغيير الأرضيات وتجديد الفرش وشاشات العرض والتكييفات لتليق باجتماعات ومناسبات عائلة بيت حسين.',
        overallTargetAmount: 60000,
        defaultTargetPerMember: 6000,
        status: 'نشطة',
        createdAt: new Date().toISOString(),
        totalCollected: 35500,
        totalRequiredTarget: 60000,
        remainingToGoal: 24500,
        progressPercentage: 59.2,
        totalMembersCount: 10,
        fullyPaidCount: 3,
        partiallyPaidCount: 4,
        unpaidCount: 2,
        overpaidCount: 1,
        totalPaymentsCount: 11
      },
      {
        id: 2,
        name: 'صندوق تكافل العائلة الشهري',
        description: 'مساهمات دورية من أبناء العائلة لدعم الحالات الطارئة ومساعدة الأقارب ورعاية كبار السن والمستلزمات الطبية.',
        overallTargetAmount: 15000,
        defaultTargetPerMember: 1500,
        status: 'نشطة',
        createdAt: new Date().toISOString(),
        totalCollected: 4500,
        totalRequiredTarget: 15000,
        remainingToGoal: 10500,
        progressPercentage: 30.0,
        totalMembersCount: 6,
        fullyPaidCount: 3,
        partiallyPaidCount: 0,
        unpaidCount: 3,
        overpaidCount: 0,
        totalPaymentsCount: 3
      },
      {
        id: 3,
        name: 'مساهمة تجهيز ساحة العيد',
        description: 'فرش وتجهيز ساحة صلاة العيد وتوزيع الهدايا والحلويات على أطفال العائلة والجيران.',
        overallTargetAmount: 5000,
        defaultTargetPerMember: 500,
        status: 'مكتملة',
        createdAt: new Date().toISOString(),
        totalCollected: 5000,
        totalRequiredTarget: 5000,
        remainingToGoal: 0,
        progressPercentage: 100.0,
        totalMembersCount: 8,
        fullyPaidCount: 8,
        partiallyPaidCount: 0,
        unpaidCount: 0,
        overpaidCount: 0,
        totalPaymentsCount: 8
      }
    ];
  }

  private getMockMembers(): FamilyMember[] {
    return [
      { id: 1, fullName: 'الحاج حسين أحمد حسين', phoneNumber: '01012345678', notes: 'كبير العائلة', createdAt: '2026-08-01', totalPaidAllFunds: 7500, enrolledFundsCount: 2, paymentsCount: 3 },
      { id: 2, fullName: 'د. محمود حسين أحمد', phoneNumber: '01123456789', notes: 'طبيب جراحة', createdAt: '2026-08-01', totalPaidAllFunds: 8500, enrolledFundsCount: 2, paymentsCount: 3 },
      { id: 3, fullName: 'م. طارق حسين أحمد', phoneNumber: '01234567890', notes: 'مهندس مدني', createdAt: '2026-08-01', totalPaidAllFunds: 5500, enrolledFundsCount: 2, paymentsCount: 3 },
      { id: 4, fullName: 'أ. عبد الرحمن حسين', phoneNumber: '01512345678', notes: 'محاسب قانوني', createdAt: '2026-08-01', totalPaidAllFunds: 2000, enrolledFundsCount: 1, paymentsCount: 1 },
      { id: 5, fullName: 'إبراهيم حسين أحمد', phoneNumber: '01098765432', notes: 'أعمال حرة', createdAt: '2026-08-01', totalPaidAllFunds: 6000, enrolledFundsCount: 1, paymentsCount: 1 },
      { id: 6, fullName: 'سامح حسين أحمد', phoneNumber: '01187654321', notes: 'مدير مبيعات', createdAt: '2026-08-01', totalPaidAllFunds: 1500, enrolledFundsCount: 1, paymentsCount: 1 },
      { id: 7, fullName: 'علي حسين أحمد', phoneNumber: '01276543210', notes: 'معلم لغة عربية', createdAt: '2026-08-01', totalPaidAllFunds: 0, enrolledFundsCount: 1, paymentsCount: 0 },
      { id: 8, fullName: 'حسن حسين أحمد', phoneNumber: '01576543210', notes: 'صيدلي', createdAt: '2026-08-01', totalPaidAllFunds: 0, enrolledFundsCount: 1, paymentsCount: 0 },
      { id: 9, fullName: 'مصطفى حسين أحمد', phoneNumber: '01033445566', notes: 'مهندس برمجيات', createdAt: '2026-08-01', totalPaidAllFunds: 6000, enrolledFundsCount: 1, paymentsCount: 1 },
      { id: 10, fullName: 'أحمد حسين محمد', phoneNumber: '01144556677', notes: 'طالب جامعي', createdAt: '2026-08-01', totalPaidAllFunds: 3000, enrolledFundsCount: 1, paymentsCount: 1 }
    ];
  }

  private getMockContributions(fundId: number): FundMemberContribution[] {
    return [
      { fundMemberId: 1, fundId: 1, fundName: 'تجديد المندرة', memberId: 1, memberName: 'الحاج حسين أحمد حسين', memberPhone: '01012345678', targetAmount: 6000, totalPaid: 6000, paymentsCount: 2, remainingBalance: 0, extraAmount: 0, status: 'مكتمل', lastPaymentDate: '2026-09-30', joinedAt: '2026-08-20' },
      { fundMemberId: 2, fundId: 1, fundName: 'تجديد المندرة', memberId: 2, memberName: 'د. محمود حسين أحمد', memberPhone: '01123456789', targetAmount: 6000, totalPaid: 7000, paymentsCount: 2, remainingBalance: 0, extraAmount: 1000, status: 'دفع بزيادة', lastPaymentDate: '2026-10-10', joinedAt: '2026-08-20' },
      { fundMemberId: 3, fundId: 1, fundName: 'تجديد المندرة', memberId: 3, memberName: 'م. طارق حسين أحمد', memberPhone: '01234567890', targetAmount: 6000, totalPaid: 4000, paymentsCount: 2, remainingBalance: 2000, extraAmount: 0, status: 'دفع جزئي', lastPaymentDate: '2026-10-08', joinedAt: '2026-08-20' },
      { fundMemberId: 4, fundId: 1, fundName: 'تجديد المندرة', memberId: 4, memberName: 'أ. عبد الرحمن حسين', memberPhone: '01512345678', targetAmount: 6000, totalPaid: 2000, paymentsCount: 1, remainingBalance: 4000, extraAmount: 0, status: 'دفع جزئي', lastPaymentDate: '2026-10-05', joinedAt: '2026-08-20' },
      { fundMemberId: 5, fundId: 1, fundName: 'تجديد المندرة', memberId: 5, memberName: 'إبراهيم حسين أحمد', memberPhone: '01098765432', targetAmount: 6000, totalPaid: 6000, paymentsCount: 1, remainingBalance: 0, extraAmount: 0, status: 'مكتمل', lastPaymentDate: '2026-10-12', joinedAt: '2026-08-20' },
      { fundMemberId: 6, fundId: 1, fundName: 'تجديد المندرة', memberId: 6, memberName: 'سامح حسين أحمد', memberPhone: '01187654321', targetAmount: 6000, totalPaid: 1500, paymentsCount: 1, remainingBalance: 4500, extraAmount: 0, status: 'دفع جزئي', lastPaymentDate: '2026-10-15', joinedAt: '2026-08-20' },
      { fundMemberId: 7, fundId: 1, fundName: 'تجديد المندرة', memberId: 7, memberName: 'علي حسين أحمد', memberPhone: '01276543210', targetAmount: 6000, totalPaid: 0, paymentsCount: 0, remainingBalance: 6000, extraAmount: 0, status: 'لم يدفع', joinedAt: '2026-08-20' },
      { fundMemberId: 8, fundId: 1, fundName: 'تجديد المندرة', memberId: 8, memberName: 'حسن حسين أحمد', memberPhone: '01576543210', targetAmount: 6000, totalPaid: 0, paymentsCount: 0, remainingBalance: 6000, extraAmount: 0, status: 'لم يدفع', joinedAt: '2026-08-20' },
      { fundMemberId: 9, fundId: 1, fundName: 'تجديد المندرة', memberId: 9, memberName: 'مصطفى حسين أحمد', memberPhone: '01033445566', targetAmount: 6000, totalPaid: 6000, paymentsCount: 1, remainingBalance: 0, extraAmount: 0, status: 'مكتمل', lastPaymentDate: '2026-10-17', joinedAt: '2026-08-20' },
      { fundMemberId: 10, fundId: 1, fundName: 'تجديد المندرة', memberId: 10, memberName: 'أحمد حسين محمد', memberPhone: '01144556677', targetAmount: 6000, totalPaid: 3000, paymentsCount: 1, remainingBalance: 3000, extraAmount: 0, status: 'دفع جزئي', lastPaymentDate: '2026-10-19', joinedAt: '2026-08-20' }
    ];
  }

  private getMockPayments(): PaymentDetail[] {
    return [
      { id: 11, fundId: 1, fundName: 'تجديد المندرة', familyMemberId: 10, memberName: 'أحمد حسين محمد', memberPhone: '01144556677', amount: 3000, paymentDate: '2026-10-19', paymentMethod: 'إنستاباي InstaPay', notes: 'نصف المبلغ المستهدف', createdAt: '2026-10-19' },
      { id: 10, fundId: 1, fundName: 'تجديد المندرة', familyMemberId: 9, memberName: 'مصطفى حسين أحمد', memberPhone: '01033445566', amount: 6000, paymentDate: '2026-10-17', paymentMethod: 'تحويل بنكي', notes: 'سداد المساهمة بالكامل', createdAt: '2026-10-17' },
      { id: 9, fundId: 1, fundName: 'تجديد المندرة', familyMemberId: 6, memberName: 'سامح حسين أحمد', memberPhone: '01187654321', amount: 1500, paymentDate: '2026-10-15', paymentMethod: 'فودافون كاش', notes: 'دفعة أولى 1500 ج.م', createdAt: '2026-10-15' },
      { id: 8, fundId: 1, fundName: 'تجديد المندرة', familyMemberId: 5, memberName: 'إبراهيم حسين أحمد', memberPhone: '01098765432', amount: 6000, paymentDate: '2026-10-12', paymentMethod: 'إنستاباي InstaPay', notes: 'سداد المبلغ المستهدف بالكامل دفعة واحدة', createdAt: '2026-10-12' },
      { id: 4, fundId: 1, fundName: 'تجديد المندرة', familyMemberId: 2, memberName: 'د. محمود حسين أحمد', memberPhone: '01123456789', amount: 3000, paymentDate: '2026-10-10', paymentMethod: 'إنستاباي InstaPay', notes: 'دفعة إضافية مع تبرع 1000 ج.م زيادة لمستلزمات الإنارة', createdAt: '2026-10-10' },
      { id: 6, fundId: 1, fundName: 'تجديد المندرة', familyMemberId: 3, memberName: 'م. طارق حسين أحمد', memberPhone: '01234567890', amount: 1500, paymentDate: '2026-10-08', paymentMethod: 'فودافون كاش', notes: 'تحويل فودافون كاش - دفعة ثانية', createdAt: '2026-10-08' },
      { id: 7, fundId: 1, fundName: 'تجديد المندرة', familyMemberId: 4, memberName: 'أ. عبد الرحمن حسين', memberPhone: '01512345678', amount: 2000, paymentDate: '2026-10-05', paymentMethod: 'نقدي', notes: 'دفعة تحت الحساب', createdAt: '2026-10-05' },
      { id: 1, fundId: 1, fundName: 'تجديد المندرة', familyMemberId: 1, memberName: 'الحاج حسين أحمد حسين', memberPhone: '01012345678', amount: 3000, paymentDate: '2026-09-30', paymentMethod: 'نقدي', notes: 'الدفعة الثانية واستكمال المطلوب', createdAt: '2026-09-30' },
      { id: 2, fundId: 1, fundName: 'تجديد المندرة', familyMemberId: 1, memberName: 'الحاج حسين أحمد حسين', memberPhone: '01012345678', amount: 3000, paymentDate: '2026-09-10', paymentMethod: 'نقدي', notes: 'الدفعة الأولى كاش بالمندرة', createdAt: '2026-09-10' }
    ];
  }

  private getMockDashboardOverview(): DashboardOverview {
    return {
      totalFunds: 3,
      activeFunds: 2,
      totalFamilyMembers: 10,
      totalCollectedAllTime: 45000,
      totalPaymentsCount: 22,
      funds: this.getMockFunds(),
      recentPayments: this.getMockPayments()
    };
  }

  private getMockMemberProfile(id: number): MemberProfile {
    const member = this.getMockMembers().find(m => m.id === id) || this.getMockMembers()[0];
    const payments = this.getMockPayments().filter(p => p.familyMemberId === id);
    const contributions = this.getMockContributions(1).filter(c => c.memberId === id);

    return {
      id: member.id,
      fullName: member.fullName,
      phoneNumber: member.phoneNumber,
      nationalId: member.nationalId,
      notes: member.notes,
      createdAt: member.createdAt,
      totalPaidAcrossAllFunds: member.totalPaidAllFunds,
      totalTargetAcrossAllFunds: 6000,
      participations: contributions.map(c => ({
        fundMemberId: c.fundMemberId,
        fundId: c.fundId,
        fundName: c.fundName,
        fundStatus: 'نشطة',
        targetAmount: c.targetAmount,
        totalPaid: c.totalPaid,
        remainingBalance: c.remainingBalance,
        extraAmount: c.extraAmount,
        paymentsCount: c.paymentsCount,
        status: c.status,
        joinedAt: c.joinedAt
      })),
      paymentHistory: payments
    };
  }

  // ==========================================
  // BACKUP & GOOGLE DRIVE
  // ==========================================
  openBackupModal() {
    if (!this.isLoggedIn()) {
      this.promptLogin();
      return;
    }
    this.showBackupModal.set(true);
  }

  getBackupStatus(): Observable<BackupStatus> {
    return this.http.get<BackupStatus>(`${this.apiUrl}/backup/status`, this.getAuthHeaders());
  }

  uploadBackupToDrive(): Observable<BackupResult> {
    return this.http.post<BackupResult>(`${this.apiUrl}/backup/upload-now`, {}, this.getAuthHeaders());
  }

  getDriveBackups(): Observable<DriveBackupFile[]> {
    return this.http.get<DriveBackupFile[]>(`${this.apiUrl}/backup/drive-list`, this.getAuthHeaders()).pipe(
      catchError(err => {
        console.warn('Error fetching drive backups:', err);
        return of([]);
      })
    );
  }

  downloadBackupFile(): Observable<Blob> {
    const t = this.token();
    return this.http.get(`${this.apiUrl}/backup/download`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      responseType: 'blob'
    });
  }
}

