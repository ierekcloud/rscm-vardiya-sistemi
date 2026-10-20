export type GroupId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | string;

export type ShiftModelType = 'STANDARD_7P' | 'MEETING_6P' | 'INDIVIDUAL_6P' | 'STANDARD_3G';

export interface GroupConfig {
  id: GroupId;
  name: string;
  badgeColor: string;
  badgeBg: string;
  borderBg: string;
  capacity: number; // A:2, B:2, C:2, D:1, P1..P6:1
}

export const GROUPS_CONFIG: Record<string, GroupConfig> = {
  A: {
    id: 'A',
    name: '1. Grup (Grup A)',
    badgeColor: 'text-indigo-700 dark:text-indigo-300',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    borderBg: 'bg-indigo-600 text-white',
    capacity: 2,
  },
  B: {
    id: 'B',
    name: '2. Grup (Grup B)',
    badgeColor: 'text-emerald-700 dark:text-emerald-300',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    borderBg: 'bg-emerald-600 text-white',
    capacity: 2,
  },
  C: {
    id: 'C',
    name: '3. Grup (Grup C)',
    badgeColor: 'text-sky-700 dark:text-sky-300',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
    borderBg: 'bg-sky-600 text-white',
    capacity: 2,
  },
  D: {
    id: 'D',
    name: '4. Grup (Grup D)',
    badgeColor: 'text-violet-800 dark:text-violet-300',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/60 border-violet-300 dark:border-violet-800',
    borderBg: 'bg-violet-600 text-white',
    capacity: 2,
  },
  E: {
    id: 'E',
    name: '5. Grup (Grup E)',
    badgeColor: 'text-amber-800 dark:text-amber-300',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
    borderBg: 'bg-amber-600 text-white',
    capacity: 1,
  },
  F: {
    id: 'F',
    name: '6. Grup (Grup F)',
    badgeColor: 'text-rose-800 dark:text-rose-300',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800',
    borderBg: 'bg-rose-600 text-white',
    capacity: 1,
  },
  P1: {
    id: 'P1',
    name: '1. Personel',
    badgeColor: 'text-indigo-700 dark:text-indigo-300',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    borderBg: 'bg-indigo-600 text-white',
    capacity: 1,
  },
  P2: {
    id: 'P2',
    name: '2. Personel',
    badgeColor: 'text-emerald-700 dark:text-emerald-300',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    borderBg: 'bg-emerald-600 text-white',
    capacity: 1,
  },
  P3: {
    id: 'P3',
    name: '3. Personel',
    badgeColor: 'text-sky-700 dark:text-sky-300',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
    borderBg: 'bg-sky-600 text-white',
    capacity: 1,
  },
  P4: {
    id: 'P4',
    name: '4. Personel',
    badgeColor: 'text-amber-700 dark:text-amber-300',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    borderBg: 'bg-amber-600 text-white',
    capacity: 1,
  },
  P5: {
    id: 'P5',
    name: '5. Personel',
    badgeColor: 'text-purple-700 dark:text-purple-300',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    borderBg: 'bg-purple-600 text-white',
    capacity: 1,
  },
  P6: {
    id: 'P6',
    name: '6. Personel',
    badgeColor: 'text-rose-700 dark:text-rose-300',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    borderBg: 'bg-rose-600 text-white',
    capacity: 1,
  },
};

export function getGroupConfig(groupId: string): GroupConfig {
  if (GROUPS_CONFIG[groupId]) {
    return GROUPS_CONFIG[groupId];
  }
  // Safe default
  return {
    id: groupId as GroupId,
    name: `${groupId}. Sıra`,
    badgeColor: 'text-slate-700 dark:text-slate-300',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    borderBg: 'bg-slate-600 text-white',
    capacity: 1,
  };
}

export interface StaffMember {
  id: string;
  name: string;
  groupId: GroupId;
  orderInGroup: number;
  roleNote?: string; // Örn: "Hafta İçi & Cumartesi", "Hafta İçi & Pazar"
}

export interface Department {
  id: string;
  name: string;
  staff: StaffMember[];
  shiftModel?: ShiftModelType;
  modelDescription?: string;
}

export interface StaffLeave {
  id: string;
  staffId: string;
  startDay: number; // Örn: 2 (2 Ekim)
  endDay: number;   // Örn: 12 (12 Ekim)
  type?: 'ANNUAL' | 'REPORT' | 'EXCUSE' | 'OTHER'; // Yıllık İzin, Rapor, Mazeret vb.
  reason?: string;  // Açıklama
}

export interface DayShift {
  dayNumber: number;
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayName: string; // Pazartesi, Salı...
  isWeekend: boolean;
  dutyGroupId: GroupId;
  dutyStaff: StaffMember[];
  supportGroupId?: GroupId; // Denkleştirme / Araya Sıkıştırılan Ek Nöbetçi Grup
  supportStaff?: StaffMember[]; // Araya sıkıştırılan personeller
  leaves?: { staff: StaffMember; reason?: string }[]; // İzinli personeller
  isCompensated?: boolean; // Bu günde ek denkleştirme nöbeti var mı?
  shiftHours: string; // "07:30 - Ertesi Gün 07:30 (24 Saat)"
  isOverridden?: boolean;
  note?: string;
}

export interface StaffShiftBalance {
  staff: StaffMember;
  totalDuties: number;        // Örn: 7 nöbet
  totalHours: number;         // Örn: 168 saat (7 * 24)
  equivalentWorkDays: number; // 1 Nöbet = 3 Gün -> 7 * 3 = 21 Gün
  targetWorkDays: number;     // Hedef: 26 Gün (İzin varsa izin düşülmüş net hedef)
  baseTargetWorkDays?: number; // İzin öncesi genel hedef (26 gün)
  leaveDays?: number;         // Bu ay kullanılan izin iş günü sayısı
  previousCarryoverDays: number; // Önceki aydan devreden bakiye
  currentMonthDifference: number; // Bu ayki fark: (totalDuties * 3) - targetWorkDays
  netBalanceDays: number;     // Toplam kümülatif bakiye: previousCarryoverDays + currentMonthDifference
  status: 'DEBTOR' | 'CREDITOR' | 'BALANCED'; // Borçlu / Alacaklı / Denk
}

export interface FiveDayAnomaly {
  dayName: string;
  dayOfWeek: number;
  dates: number[];
  affectedStaff: {
    staffId: string;
    staffName: string;
    groupId: GroupId;
    dutyDates: number[];
    shiftsOnThisDayCount: number;
    totalMonthDuties: number;
    currentMonthDifference: number;
    netBalanceDays: number;
    insight: string;
  }[];
}

export interface AgentAuditItem {
  id: string;
  category: 'CALENDAR_ANOMALY' | 'OVERTIME_CREDIT' | 'DEBT_CARRYOVER' | 'FAIR_DISTRIBUTION' | 'REST_INTEGRITY';
  severity: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  affectedStaffName?: string;
  actionTaken: string;
}

export interface AgentAuditReport {
  analyzedAt: string;
  monthName: string;
  year: number;
  fiveDaysAnomalies: FiveDayAnomaly[];
  auditItems: AgentAuditItem[];
  totalOvertimeStaffCount: number;
  totalDebtorStaffCount: number;
  executiveSummary: string;
  nextMonthOffsetPlan: string;
}

export interface StaffWeeklyDutyDetail {
  dutiesCount: number;
  dutyDays: number[];
  totalHours: number;
  equivalentDays: number;
  isDoubleDutyWeek: boolean; // 2 nöbet tuttuğu hafta (48 saat)
}

export interface StaffWeeklyStat {
  weekNumber: number; // 1, 2, 3, 4, 5, 6
  weekLabel: string; // "1. Hafta (1 - 7 Ekim)"
  startDay: number;
  endDay: number;
  startDateStr: string;
  endDateStr: string;
  staffWeeklyDuties: Record<string, StaffWeeklyDutyDetail>;
}

export interface MonthSummary {
  year: number;
  month: number; // 0-11
  totalDays: number;
  targetWorkingDays: number; // Varsayılan 26 veya 27 gün
  shifts: DayShift[];
  staffStats: Record<string, StaffShiftBalance>;
  staffList: StaffMember[]; // Eklenen alan, o aya özel kaydırılmış personeli tutar
  weeklyStats?: StaffWeeklyStat[]; // 📅 Haftalık Hesaplama ve Hafta Hafta Nöbet Dökümü
  cycleInfo?: {
    cycleLengthWeeks: number; // 6 hafta
    cycleTotalDays: number; // 42 gün
    shiftsPerPersonInCycle: number; // 7 nöbet
    hoursPerPersonInCycle: number; // 168 saat
    cycleCompletionRate: number; // % tamamlama
  };
  autoCompensated?: boolean; // Araya sıkıştırma / otomatik denkleştirme aktif mi?
  compensatedShiftsCount?: number; // Kaç nöbet araya sıkıştırıldı?
  validationWarnings?: string[]; // Otomatik kural denetimi hataları
  auditReport?: AgentAuditReport; // 📋 RSMC Yönetici Denetim Raporu
  leaves?: StaffLeave[]; // Ay içindeki personel izinleri
}

// Departman bazlı aylık bakiye geçmişi (Aylar arası devir için)
export interface MonthlyDepartmentHistory {
  [deptId: string]: {
    [yearMonthKey: string]: { // Örn: "2026-08", "2026-09"
      balances: Record<string, number>; // staffId -> netBalanceDays
    };
  };
}
