export interface FamilyMember {
  id: number;
  fullName: string;
  phoneNumber?: string;
  nationalId?: string;
  notes?: string;
  createdAt: string;
  totalPaidAllFunds: number;
  enrolledFundsCount: number;
  paymentsCount: number;
}

export interface MemberFundParticipation {
  fundMemberId: number;
  fundId: number;
  fundName: string;
  fundStatus: string;
  targetAmount: number;
  totalPaid: number;
  remainingBalance: number;
  extraAmount: number;
  paymentsCount: number;
  status: 'لم يدفع' | 'دفع جزئي' | 'مكتمل' | 'دفع بزيادة' | string;
  joinedAt: string;
}

export interface MemberProfile {
  id: number;
  fullName: string;
  phoneNumber?: string;
  nationalId?: string;
  notes?: string;
  createdAt: string;
  totalPaidAcrossAllFunds: number;
  totalTargetAcrossAllFunds: number;
  participations: MemberFundParticipation[];
  paymentHistory: PaymentDetail[];
}

export interface FundSummary {
  id: number;
  name: string;
  description?: string;
  overallTargetAmount?: number;
  defaultTargetPerMember: number;
  status: 'نشطة' | 'مكتملة' | string;
  createdAt: string;
  totalCollected: number;
  totalRequiredTarget: number;
  remainingToGoal: number;
  progressPercentage: number;
  totalMembersCount: number;
  fullyPaidCount: number;
  partiallyPaidCount: number;
  unpaidCount: number;
  overpaidCount: number;
  totalPaymentsCount: number;
}

export interface FundMemberContribution {
  fundMemberId: number;
  fundId: number;
  fundName: string;
  memberId: number;
  memberName: string;
  memberPhone?: string;
  targetAmount: number;
  totalPaid: number;
  paymentsCount: number;
  remainingBalance: number;
  extraAmount: number;
  status: 'لم يدفع' | 'دفع جزئي' | 'مكتمل' | 'دفع بزيادة' | string;
  lastPaymentDate?: string;
  joinedAt: string;
  notes?: string;
}

export interface PaymentDetail {
  id: number;
  fundId: number;
  fundName: string;
  familyMemberId: number;
  memberName: string;
  memberPhone?: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  recordedBy?: string;
  notes?: string;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface DashboardOverview {
  totalFunds: number;
  activeFunds: number;
  totalFamilyMembers: number;
  totalCollectedAllTime: number;
  totalPaymentsCount: number;
  funds: FundSummary[];
  recentPayments: PaymentDetail[];
}

export interface CreatePaymentRequest {
  fundId: number;
  familyMemberId: number;
  amount: number;
  paymentDate?: string;
  paymentMethod?: string;
  recordedBy?: string;
  notes?: string;
}

export interface CreateFundRequest {
  name: string;
  description?: string;
  overallTargetAmount?: number;
  defaultTargetPerMember: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateMemberRequest {
  fullName: string;
  phoneNumber?: string;
  nationalId?: string;
  notes?: string;
}

// Authentication Models
export interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export interface UserDetail {
  id: number;
  username: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  fullName: string;
  role?: string;
  password?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Audit Logs Models
export interface AuditLog {
  id: number;
  entityName: string;
  entityId: number;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

// Trash / Soft Delete Models
export interface TrashItem {
  id: number;
  type: 'payment' | 'member' | 'fund' | string;
  typeName: string;
  title: string;
  subtitle: string;
  amount?: number;
  deletedAt: string;
  deletedBy: string;
}

export interface TrashSummary {
  deletedPayments: TrashItem[];
  deletedMembers: TrashItem[];
  deletedFunds: TrashItem[];
  totalDeletedCount: number;
}

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime?: string;
  size?: number;
  sizeFormatted: string;
  webViewLink?: string;
}

export interface BackupResult {
  success: boolean;
  message: string;
  fileId?: string;
  fileName?: string;
  fileSizeFormatted?: string;
  timestamp: string;
  triggerType: string;
}

export interface BackupStatus {
  configured: boolean;
  folderId: string;
  folderLink: string;
  intervalHours: number;
  maxBackupsToKeep: number;
  serviceAccountEmail: string;
}

