export type GroupId = 'A' | 'B' | 'C' | 'D';

export interface GroupConfig {
  id: GroupId;
  name: string;
  badgeColor: string;
  badgeBg: string;
  borderBg: string;
  capacity: number; // A:2, B:2, C:2, D:1
}

export const GROUPS_CONFIG: Record<GroupId, GroupConfig> = {
  A: {
    id: 'A',
    name: '1. Grup (Grup A)',
    badgeColor: 'text-indigo-700',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    borderBg: 'bg-indigo-600 text-white',
    capacity: 2,
  },
  B: {
    id: 'B',
    name: '2. Grup (Grup B)',
    badgeColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    borderBg: 'bg-emerald-600 text-white',
    capacity: 2,
  },
  C: {
    id: 'C',
    name: '3. Grup (Grup C)',
    badgeColor: 'text-sky-700',
    badgeBg: 'bg-sky-50 border-sky-200',
    borderBg: 'bg-sky-600 text-white',
    capacity: 2,
  },
  D: {
    id: 'D',
    name: '4. Grup (Grup D)',
    badgeColor: 'text-violet-800',
    badgeBg: 'bg-violet-50 border-violet-300',
    borderBg: 'bg-violet-600 text-white',
    capacity: 2,
  },
};

export interface StaffMember {
  id: string;
  name: string;
  groupId: GroupId;
  orderInGroup: number;
}

export interface Department {
  id: string;
  name: string;
  staff: StaffMember[];
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
  targetWorkDays: number;     // Hedef: 26 Gün (Pazarlar hariç 6 gün çalışma esası)
  previousCarryoverDays: number; // Önceki aydan devreden bakiye
  currentMonthDifference: number; // Bu ayki fark: (totalDuties * 3) - 26 gün
  netBalanceDays: number;     // Toplam kümülatif bakiye: previousCarryoverDays + currentMonthDifference
  status: 'DEBTOR' | 'CREDITOR' | 'BALANCED'; // Borçlu / Alacaklı / Denk
}

export interface MonthSummary {
  year: number;
  month: number; // 0-11
  totalDays: number;
  targetWorkingDays: number; // Varsayılan 26 veya 27 gün
  shifts: DayShift[];
  staffStats: Record<string, StaffShiftBalance>;
  staffList: StaffMember[]; // Eklenen alan, o aya özel kaydırılmış personeli tutar
  autoCompensated?: boolean; // Araya sıkıştırma / otomatik denkleştirme aktif mi?
  compensatedShiftsCount?: number; // Kaç nöbet araya sıkıştırıldı?
  validationWarnings?: string[]; // Otomatik kural denetimi hataları
}

// Departman bazlı aylık bakiye geçmişi (Aylar arası devir için)
export interface MonthlyDepartmentHistory {
  [deptId: string]: {
    [yearMonthKey: string]: { // Örn: "2026-08", "2026-09"
      balances: Record<string, number>; // staffId -> netBalanceDays
    };
  };
}
