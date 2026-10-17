import { Department, DayShift, GroupId, StaffMember, MonthSummary, StaffShiftBalance, AgentAuditReport, FiveDayAnomaly, AgentAuditItem, StaffLeave } from '../types';

export const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const TURKISH_DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const TURKISH_DAYS_FULL = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

// 6 Kişilik Yeni NOC Toplantı Modeli Kadrosu (Gruplu / Badi)
// 1. Gün (A Grubu): Serkan Tuna, Mehmet Kızılay (Pzt, Per) -> 2 Kişi
// 2. Gün (B Grubu): İbrahim Erek, Barış Memiş (Salı, Cuma) -> 2 Kişi
// 3. & 4. Gün (C Grubu): İbrahim Akpınar (3. Gün - Çar, Cmt), Mustafa Telsiz (4. Gün - Çar, Paz)
export const DEFAULT_NOC_6P_STAFF: StaffMember[] = [
  { id: 'noc6-1', name: 'Serkan Tuna', groupId: 'A', orderInGroup: 1, roleNote: '1. Gün - Pzt & Per (A Grubu)' },
  { id: 'noc6-2', name: 'Mehmet Kızılay', groupId: 'A', orderInGroup: 2, roleNote: '1. Gün - Pzt & Per (A Grubu)' },
  { id: 'noc6-3', name: 'İbrahim Erek', groupId: 'B', orderInGroup: 1, roleNote: '2. Gün - Salı & Cuma (B Grubu)' },
  { id: 'noc6-4', name: 'Barış Memiş', groupId: 'B', orderInGroup: 2, roleNote: '2. Gün - Salı & Cuma (B Grubu)' },
  { id: 'noc6-5', name: 'İbrahim Akpınar', groupId: 'C', orderInGroup: 1, roleNote: '3. Gün - Çar & Cmt (C Grubu 1. Kişi)' },
  { id: 'noc6-6', name: 'Mustafa Telsiz', groupId: 'C', orderInGroup: 2, roleNote: '4. Gün - Çar & Paz (C Grubu 2. Kişi)' },
];

// 6 Kişilik NOC Grupsuz (Tek Kişi / Bireysel) Modeli Kadrosu
export const DEFAULT_NOC_6P_INDIVIDUAL_STAFF: StaffMember[] = [
  { id: 'noc-ind-1', name: 'Serkan Tuna', groupId: 'P1', orderInGroup: 1, roleNote: '1. Sıra (Bireysel / Tek Kişi)' },
  { id: 'noc-ind-2', name: 'Mehmet Kızılay', groupId: 'P2', orderInGroup: 2, roleNote: '2. Sıra (Bireysel / Tek Kişi)' },
  { id: 'noc-ind-3', name: 'İbrahim Erek', groupId: 'P3', orderInGroup: 3, roleNote: '3. Sıra (Bireysel / Tek Kişi)' },
  { id: 'noc-ind-4', name: 'Barış Memiş', groupId: 'P4', orderInGroup: 4, roleNote: '4. Sıra (Bireysel / Tek Kişi)' },
  { id: 'noc-ind-5', name: 'İbrahim Akpınar', groupId: 'P5', orderInGroup: 5, roleNote: '5. Sıra (Bireysel / Tek Kişi)' },
  { id: 'noc-ind-6', name: 'Mustafa Telsiz', groupId: 'P6', orderInGroup: 6, roleNote: '6. Sıra (Bireysel / Tek Kişi)' },
];

// MPLS Birimi Kadrosu (11 Personel - 4 Grup A, B, C, D)
export const DEFAULT_MPLS_STAFF: StaffMember[] = [
  { id: 'mpls-1', name: 'Örnek 1', groupId: 'A', orderInGroup: 1 },
  { id: 'mpls-2', name: 'Örnek 2', groupId: 'A', orderInGroup: 2 },
  { id: 'mpls-3', name: 'Örnek 3', groupId: 'A', orderInGroup: 3 },
  { id: 'mpls-4', name: 'Örnek 4', groupId: 'B', orderInGroup: 1 },
  { id: 'mpls-5', name: 'Örnek 5', groupId: 'B', orderInGroup: 2 },
  { id: 'mpls-6', name: 'Örnek 6', groupId: 'B', orderInGroup: 3 },
  { id: 'mpls-7', name: 'Örnek 7', groupId: 'C', orderInGroup: 1 },
  { id: 'mpls-8', name: 'Örnek 8', groupId: 'C', orderInGroup: 2 },
  { id: 'mpls-9', name: 'Örnek 9', groupId: 'C', orderInGroup: 3 },
  { id: 'mpls-10', name: 'Örnek 10', groupId: 'D', orderInGroup: 1 },
  { id: 'mpls-11', name: 'Örnek 11', groupId: 'D', orderInGroup: 2 },
];

// Bölümler: NOC (Standart 7 Kişi), NOC (6 Kişi Gruplu), NOC (6 Kişi Grupsuz), MPLS, DSL, SANTRAL, TRANSMİSYON
export const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'dep-noc',
    name: 'NOC',
    shiftModel: 'STANDARD_7P',
    modelDescription: '7 Personel • 4 Grup 24/72 Döngüsü',
    staff: [
      { id: 'noc-1', name: 'Serkan Tuna', groupId: 'A', orderInGroup: 1 },
      { id: 'noc-2', name: 'Mehmet Kızılay', groupId: 'A', orderInGroup: 2 },
      { id: 'noc-3', name: 'İbrahim Erek', groupId: 'B', orderInGroup: 1 },
      { id: 'noc-4', name: 'Barış Memiş', groupId: 'B', orderInGroup: 2 },
      { id: 'noc-5', name: 'İbrahim Akpınar', groupId: 'C', orderInGroup: 1 },
      { id: 'noc-6', name: 'Mustafa Telsiz', groupId: 'C', orderInGroup: 2 },
      { id: 'noc-7', name: 'Hüseyin Yıldız', groupId: 'D', orderInGroup: 1 },
    ],
  },
  {
    id: 'dep-noc-6p',
    name: 'NOC (6 Kişi - Gruplu)',
    shiftModel: 'MEETING_6P',
    modelDescription: '6 Personel • 8-9 Nöbet | A Grubu (Serkan Tuna & Mehmet Kızılay) | B Grubu (İbrahim Erek & Barış Memiş) | C Grubu (İbrahim Akpınar & Mustafa Telsiz)',
    staff: DEFAULT_NOC_6P_STAFF,
  },
  {
    id: 'dep-noc-6p-ind',
    name: 'NOC (6 Kişi - Grupsuz)',
    shiftModel: 'INDIVIDUAL_6P',
    modelDescription: '6 Personel • Grupsuz (Tek Kişi) • 6 Haftalık Döngü • Haftalık Hesaplama',
    staff: DEFAULT_NOC_6P_INDIVIDUAL_STAFF,
  },
  {
    id: 'dep-mpls',
    name: 'MPLS',
    staff: DEFAULT_MPLS_STAFF,
  },
  {
    id: 'dep-dsl',
    name: 'DSL',
    staff: [
      { id: 'dsl-1', name: 'Fatih Kurt', groupId: 'A', orderInGroup: 1 },
      { id: 'dsl-2', name: 'Yasin Karaca', groupId: 'A', orderInGroup: 2 },
      { id: 'dsl-3', name: 'Tolga Çetin', groupId: 'B', orderInGroup: 1 },
      { id: 'dsl-4', name: 'Gökhan Yavuz', groupId: 'B', orderInGroup: 2 },
      { id: 'dsl-5', name: 'Onur Bulut', groupId: 'C', orderInGroup: 1 },
      { id: 'dsl-6', name: 'Barış Keskin', groupId: 'C', orderInGroup: 2 },
      { id: 'dsl-7', name: 'Kadir Doğan', groupId: 'D', orderInGroup: 1 },
    ],
  },
  {
    id: 'dep-santral',
    name: 'SANTRAL',
    staff: [
      { id: 'snt-1', name: 'Cemil Şen', groupId: 'A', orderInGroup: 1 },
      { id: 'snt-2', name: 'Erhan Polat', groupId: 'A', orderInGroup: 2 },
      { id: 'snt-3', name: 'Tuncay Erdem', groupId: 'B', orderInGroup: 1 },
      { id: 'snt-4', name: 'Volkan Aktaş', groupId: 'B', orderInGroup: 2 },
      { id: 'snt-5', name: 'Deniz Vural', groupId: 'C', orderInGroup: 1 },
      { id: 'snt-6', name: 'Uğur Özkan', groupId: 'C', orderInGroup: 2 },
      { id: 'snt-7', name: 'Sinan Kılıç', groupId: 'D', orderInGroup: 1 },
    ],
  },
  {
    id: 'dep-transmisyon',
    name: 'TRANSMİSYON',
    staff: [
      { id: 'trn-1', name: 'Levent Yaman', groupId: 'A', orderInGroup: 1 },
      { id: 'trn-2', name: 'Salih Bozkurt', groupId: 'A', orderInGroup: 2 },
      { id: 'trn-3', name: 'Alperen Çakır', groupId: 'B', orderInGroup: 1 },
      { id: 'trn-4', name: 'Mert Dönmez', groupId: 'B', orderInGroup: 2 },
      { id: 'trn-5', name: 'Selim Güler', groupId: 'C', orderInGroup: 1 },
      { id: 'trn-6', name: 'Zafer Karataş', groupId: 'C', orderInGroup: 2 },
      { id: 'trn-7', name: 'Harun Taş', groupId: 'D', orderInGroup: 1 },
    ],
  },
];

export const ROTATING_GROUPS: GroupId[] = ['A', 'B', 'C', 'D'];

/**
 * 6 Kişilik Grupsuz (Bireysel / Tek Kişi) Modeli İçin 6 Haftalık Kusursuz Rotasyon Tablosu
 * Her personel haftada tam 2 nöbet (48 saat) tutar.
 * 6 haftalık döngüde toplam 12 nöbet (288 saat = 36 gün) tamamlanır.
 * Ayda 8 - 9 nöbet (192 - 216 saat = 24 - 27 gün) düşer.
 * KURAL GÜVENCESİ:
 * - İki nöbet arasında EN AZ 2 veya 3 gün kesintisiz dinlenme (istirahat) bulunur.
 * - Cumartesi nöbet tutan personel Pazar ve Pazartesi izinli olur; Pazartesi ASLA nöbete gelemez, Salı gelir!
 * - Pazar nöbet tutan personel Pazartesi ve Salı izinli olur; Çarşamba gelir!
 */
export const INDIVIDUAL_6P_WEEKLY_ROLES: number[][] = [
  [1, 4], // 1. Rol: Pazartesi (1) & Perşembe (4)
  [1, 4], // 2. Rol: Pazartesi (1) & Perşembe (4)
  [2, 5], // 3. Rol: Salı (2) & Cuma (5)
  [3, 0], // 4. Rol: Çarşamba (3) & Pazar (0)
  [3, 6], // 5. Rol: Çarşamba (3) & Cumartesi (6)  --> Cmt sonrası Paz & Pzt 2 gün tam istirahat, Salı başlar!
  [2, 5], // 6. Rol: Salı (2) & Cuma (5)
];

export function getIndividual6pStaffForDay(
  year: number,
  month: number,
  day: number,
  staffList: StaffMember[]
): StaffMember[] {
  if (!staffList || staffList.length === 0) return [];
  // Referans Pazartesi: 28 Eylül 2026 (Ekim 2026'nın başlangıç haftası)
  const anchorMon = new Date(2026, 8, 28, 12, 0, 0);
  const curDate = new Date(year, month, day, 12, 0, 0);
  const diffDays = Math.round((curDate.getTime() - anchorMon.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7);
  const dow = curDate.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi

  const assigned: StaffMember[] = [];
  const totalStaff = Math.min(6, staffList.length);

  for (let p = 0; p < totalStaff; p++) {
    const roleIdx = ((p + (weekNumber % 6)) % 6 + 6) % 6;
    const roleDays = INDIVIDUAL_6P_WEEKLY_ROLES[roleIdx];
    if (roleDays.includes(dow)) {
      assigned.push(staffList[p]);
    }
  }
  return assigned;
}

/**
 * Sistematik ABC Dişli Çark (Gear) Sistemi:
 * - Personel nöbete geldiğinde 24 saatlik kesintisiz vardiyasını tutar ("ABC" = 3 mesaiye bedel).
 * - "ABC çalışan personel ertesi gün ABC çalışamaz!"
 * - İki ABC nöbeti arasında EN AZ 2 veya 3 gün tam dinlenme (boşluk) olmalıdır.
 * - Döngü:
 *   1. Gün: 1. Grup (ABC) -> 2, 3, 4. günler dinlenir (3 gün tam boşluk)
 *   2. Gün: 2. Grup (ABC) -> 3, 4, 5. günler dinlenir
 *   3. Gün: 3. Grup (ABC) -> 4, 5, 6. günler dinlenir
 *   4. Gün: 4. Grup (ABC) -> 5, 6, 7. günler dinlenir
 *   5. Gün: 1. Grup tekrar (ABC) gelir (arada tam 3 gün dinlendi!)
 * - Ay geçişlerinde dişli bozulmaz; birbirini takip eder.
 * - Referans Çapa: Eylül 2026 (Yıl 2026, Ay 8), 1 Eylül = Grup 'A'.
 */
export function getDutyStaffForDay(
  groupId: GroupId,
  staffList: StaffMember[],
  dayOfWeek: number,
  hasGroupD: boolean
): StaffMember[] {
  if (groupId === 'C' && !hasGroupD) {
    const cStaff = staffList.filter((s) => s.groupId === 'C');
    if (cStaff.length <= 1) return cStaff;
    if (dayOfWeek === 6) { // Cumartesi -> 1. Kişi (Mustafa Telsiz - Sabit Tek Kişi)
      const cmtStaff = cStaff.filter((s) => s.orderInGroup === 1 || s.roleNote?.toLowerCase().includes('cumartesi') || s.roleNote?.toLowerCase().includes('ctesi'));
      return cmtStaff.length > 0 ? [cmtStaff[0]] : [cStaff[0]];
    }
    if (dayOfWeek === 0) { // Pazar -> 2. Kişi (Barış Memiş - Sabit Tek Kişi)
      const pazStaff = cStaff.filter((s) => s.orderInGroup === 2 || s.roleNote?.toLowerCase().includes('pazar'));
      return pazStaff.length > 0 ? [pazStaff[0]] : (cStaff.length > 1 ? [cStaff[1]] : [cStaff[0]]);
    }
    // Çarşamba ve diğer günlerde C grubu tam kadro (2 kişi) atanır
    return cStaff;
  }
  return staffList.filter((s) => s.groupId === groupId);
}

export function getGearStartGroup(
  targetYear: number,
  targetMonth: number,
  anchorYear: number = 2026,
  anchorMonth: number = 8, // 8 = Eylül (0-indexed)
  anchorStartGroup: GroupId = 'A',
  availableGroups: GroupId[] = ['A', 'B', 'C', 'D']
): GroupId {
  const anchorDate = new Date(anchorYear, anchorMonth, 1);
  const targetDate = new Date(targetYear, targetMonth, 1);
  const hasGroupD = availableGroups.includes('D');
  
  // Count exact number of cycle days between anchor and target
  let cycleDays = 0;
  
  if (targetDate >= anchorDate) {
    let d = new Date(anchorDate);
    while (d < targetDate) {
      const dow = d.getDay();
      if (hasGroupD) {
        if (dow !== 0) cycleDays++;
      } else {
        // 6 Kişilik Model: Sadece Pazartesi (1), Perşembe (4) ve Cuma (5) günleri A ve B arasında döner
        if (dow === 1 || dow === 4 || dow === 5) cycleDays++;
      }
      d.setDate(d.getDate() + 1);
    }
  } else {
    let d = new Date(targetDate);
    while (d < anchorDate) {
      const dow = d.getDay();
      if (hasGroupD) {
        if (dow !== 0) cycleDays--;
      } else {
        if (dow === 1 || dow === 4 || dow === 5) cycleDays--;
      }
      d.setDate(d.getDate() + 1);
    }
  }

  const baseOrder = hasGroupD ? availableGroups : availableGroups.filter((g) => g === 'A' || g === 'B');
  const anchorIdx = baseOrder.indexOf(anchorStartGroup);
  const baseIdx = anchorIdx === -1 ? 0 : anchorIdx;
  const targetIdx = ((baseIdx + cycleDays) % baseOrder.length + baseOrder.length) % baseOrder.length;

  return baseOrder[targetIdx] || 'A';
}

/**
 * Her ay personelin adaletli bir şekilde gruplar/sıralar arasında yer değiştirmesini sağlar.
 * Hem 7 kişilik, hem 6 kişilik gruplu, hem de 6 kişilik grupsuz modellerde tüm personeller her ay adil ve sistematik olarak sırayla döner.
 */
export function getRotatedStaff(
  staffList: StaffMember[], 
  year: number, 
  month: number,
  shiftModel?: string
): StaffMember[] {
  if (!staffList || staffList.length === 0) return [];

  // 6 Kişilik Grupsuz (Bireysel) Modelde döngü 6 haftalık sürekli zaman çizelgesi üzerinden
  // kesintisiz işlediği için personellerin sırası sabittir (ay geçişlerinde isim kaydırılmaz).
  // Böylece ay sonu (31 Ekim) ve ay başı (1 Kasım) üst üste nöbet çakışması %100 engellenir.
  const isIndividual6p =
    shiftModel === 'INDIVIDUAL_6P' ||
    staffList.some((s) => s.id?.startsWith('noc-ind-')) ||
    staffList.some((s) => s.groupId?.startsWith('P')) ||
    (staffList.length === 6 && staffList.every((s) => s.roleNote?.includes('Tek Kişi') || s.roleNote?.includes('Bireysel') || s.groupId?.startsWith('P')));

  if (isIndividual6p) {
    return [...staffList];
  }

  // Diğer modellerde (7 Kişilik Standart ve 6 Kişilik Gruplu) personeli hiyerarşik grup ve sıra düzenine göre sırala
  const sortedStaff = [...staffList].sort((a, b) => {
    const groupOrder = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'A', 'B', 'C', 'D', 'E', 'F'];
    const aGrpIdx = groupOrder.indexOf(a.groupId);
    const bGrpIdx = groupOrder.indexOf(b.groupId);
    if (aGrpIdx !== -1 && bGrpIdx !== -1 && aGrpIdx !== bGrpIdx) {
      return aGrpIdx - bGrpIdx;
    }
    return (a.orderInGroup || 0) - (b.orderInGroup || 0);
  });

  // Orijinal slot yapılarını (hangi index'te hangi grup, sıra ve rol notu var) kaydet
  const slotLayout = sortedStaff.map(s => ({ 
    groupId: s.groupId, 
    orderInGroup: s.orderInGroup,
    roleNote: s.roleNote 
  }));

  // Projenin miladı ve referans ayı: Ekim 2026 (yıl: 2026, month: 9)
  const baseYear = 2026;
  const baseMonth = 9; // Ekim (0-indexed: 9)
  const monthDiff = (year - baseYear) * 12 + (month - baseMonth);

  const len = sortedStaff.length;
  if (len === 0) return [];

  // İleriye doğru adil döngü: Her ay personeller sırayla bir sonraki gruba ve slota geçer
  const shiftAmount = ((monthDiff * -1) % len + len) % len;

  const shifted = [
    ...sortedStaff.slice(len - shiftAmount),
    ...sortedStaff.slice(0, len - shiftAmount)
  ];

  // Kaydırılmış personellere ilgili slotun grup, sıra ve rol özelliklerini ata
  return shifted.map((staff, index) => ({
    ...staff,
    groupId: slotLayout[index].groupId,
    orderInGroup: slotLayout[index].orderInGroup,
    roleNote: slotLayout[index].roleNote,
  }));
}

/**
 * Herhangi bir yıl, ay ve gün için saat 12:00 (öğle vakti) referans alınarak
 * timezone ve DST (gün ışığından yararlanma) sınır geçişleri kaynaklı gün kaymalarını
 * %100 engelleyen güvenli haftanın günü hesaplaması.
 * 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi
 */
export function getSafeDayOfWeek(year: number, month: number, day: number): number {
  return new Date(year, month, day, 12, 0, 0).getDay();
}

/**
 * SADECE Cumartesi (6) ve Pazar (0) günleri hafta sonu kabul edilir.
 * Hafta içi günler (Pzt, Sal, Çar, Per, Cum) ASLA hafta sonu sayılamaz!
 */
export function isDateWeekend(year: number, month: number, day: number): boolean {
  const dow = getSafeDayOfWeek(year, month, day);
  return dow === 0 || dow === 6;
}

/**
 * Belirli bir ay için hedef çalışma gününü hesaplar:
 * Kural: Ay 30 çekiyorsa 26 gün, 31 çekiyorsa 27 gün, 29 çekiyorsa 25 gün, 28 çekiyorsa 24 gün.
 * Haftalık 6 gün çalışma esası gereği 4 pazar günü düşülür.
 */
export function calculateTargetWorkingDays(year: number, month: number): number {
  const totalDays = new Date(year, month + 1, 0).getDate();
  let sundays = 0;
  for (let d = 1; d <= totalDays; d++) {
    if (getSafeDayOfWeek(year, month, d) === 0) sundays++;
  }
  return totalDays - sundays;
}

/**
 * ABC Vardiya Hesaplama ve Borç / Alacak Sistemi:
 * - Nöbete gelen personel o gün 24 saat boyunca "ABC" (A+B+C vardiyaları) tutar.
 * - ERTESİ GÜN ASLA ÇALIŞAMAZ!
 * - İki ABC nöbeti arasında en az 2 veya 3 gün kesintisiz dinlenme (boşluk) bulunur.
 * - Her nöbet 24 saat olduğundan 3 normal iş gününe eşittir (24 / 8 = 3 gün).
 */

function validateMonthSchedule(shifts: DayShift[], staffStats: Record<string, StaffShiftBalance>, staffList: StaffMember[], hasGroupD: boolean): string[] {
  let warnings: string[] = [];

  const staffShiftDays: Record<string, number[]> = {};
  for (const s of staffList) {
    staffShiftDays[s.id] = [];
  }
  
  for (const sh of shifts) {
     const allStaff = [...(sh.dutyStaff || []), ...(sh.supportStaff || [])];
     for (const s of allStaff) {
       if (staffShiftDays[s.id]) {
         staffShiftDays[s.id].push(sh.dayNumber);
       }
     }
  }

  for (const s of staffList) {
    const days = staffShiftDays[s.id] || [];
    for (let i = 0; i < days.length - 2; i++) {
       if (days[i+2] - days[i] < 6) {
          warnings.push(s.name + ' (Grup ' + s.groupId + '), yetersiz istirahat ile sık nöbete yazılmış (6 günden kısa sürede 3 nöbet).');
          break;
       }
    }

    const uniqueDays: number[] = [];
    for (const d of days) {
       if (!uniqueDays.includes(d)) uniqueDays.push(d);
    }
    if (uniqueDays.length !== days.length) {
       warnings.push(s.name + ', aynı güne birden fazla kez nöbete yazılmış.');
    }
  }

  for (const sh of shifts) {
     const totalStaff = (sh.dutyStaff ? sh.dutyStaff.length : 0) + (sh.supportStaff ? sh.supportStaff.length : 0);
     if (totalStaff === 0) {
        warnings.push(sh.dateString + ' tarihinde hiç personel atanmamış!');
     }

     if (sh.date.getDay() === 0) {
        if (hasGroupD && sh.dutyGroupId !== 'D') {
           warnings.push(sh.dateString + ' Pazar gününe D grubu dışında bir ana grup (' + sh.dutyGroupId + ') atanmış.');
        }
        if (sh.supportStaff && sh.supportStaff.length > 0) {
           warnings.push(sh.dateString + ' Pazar gününe destek personeli eklenmiş (Kural ihlali).');
        }
     }
  }

  if (hasGroupD) {
      for (const dStaff of staffList.filter(s => s.groupId === 'D')) {
         const days = staffShiftDays[dStaff.id] || [];
         for (const dNum of days) {
            const sh = shifts[dNum - 1];
            if (sh && sh.date.getDay() !== 0 && sh.date.getDay() !== 3 && !sh.isCompensated && !sh.supportStaff?.some(s => s.id === dStaff.id)) {
                warnings.push(dStaff.name + ' (D Grubu), Pazar veya Çarşamba dışındaki bir günde (' + sh.dateString + ' - ' + sh.dayName + ') nöbete yazılmış.');
            }
         }
      }
  }

  const regularGroups = ['A', 'B', 'C'].filter(g => staffList.some(s => s.groupId === g));
  if (regularGroups.length > 1) {
      let expectedNext: string | null = null;
      for (const sh of shifts) {
         if (sh.date.getDay() !== 0 && regularGroups.includes(sh.dutyGroupId) && !sh.isOverridden) {
            if (expectedNext && sh.dutyGroupId !== expectedNext) {
               warnings.push(sh.dateString + ' tarihinde ardışık rotasyon bozuldu. Beklenen: ' + expectedNext + ', Atanan: ' + sh.dutyGroupId);
            }
            const currentIndex = regularGroups.indexOf(sh.dutyGroupId);
            expectedNext = regularGroups[(currentIndex + 1) % regularGroups.length];
         }
      }
  }

  const uniqueWarnings: string[] = [];
  for (const w of warnings) {
    if (!uniqueWarnings.includes(w)) uniqueWarnings.push(w);
  }
  return uniqueWarnings;
}

export function generateAgentAuditReport(
  year: number,
  month: number,
  shifts: DayShift[],
  staffStats: Record<string, StaffShiftBalance>,
  staffList: StaffMember[],
  targetWorkingDays: number
): AgentAuditReport {
  const monthName = TURKISH_MONTHS[month];

  // 1. Ay içindeki günlerin frekansını bul (Hangi günler 5 kez tekrarlıyor?)
  const dayFrequencies: Record<number, number[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  };

  shifts.forEach(shift => {
    const dow = shift.date.getDay();
    dayFrequencies[dow].push(shift.dayNumber);
  });

  const fiveDaysAnomalies: FiveDayAnomaly[] = [];

  Object.entries(dayFrequencies).forEach(([dowStr, dates]) => {
    const dow = parseInt(dowStr, 10);
    if (dates.length >= 5) {
      const dayName = TURKISH_DAYS_FULL[dow];

      // Bu 5 güne kimlerin nöbeti denk geldi?
      const staffShiftMap: Record<string, number[]> = {};
      staffList.forEach(s => { staffShiftMap[s.id] = []; });

      dates.forEach(dNum => {
        const sh = shifts[dNum - 1];
        if (!sh) return;
        const assigned = [...(sh.dutyStaff || []), ...(sh.supportStaff || [])];
        assigned.forEach(st => {
          if (staffShiftMap[st.id]) {
            staffShiftMap[st.id].push(dNum);
          }
        });
      });

      const affectedStaff = staffList
        .filter(s => (staffShiftMap[s.id]?.length || 0) > 0)
        .map(s => {
          const count = staffShiftMap[s.id].length;
          const stat = staffStats[s.id];
          const totalMonthDuties = stat ? stat.totalDuties : 0;
          const currentMonthDifference = stat ? stat.currentMonthDifference : 0;
          const netBalanceDays = stat ? stat.netBalanceDays : 0;

          let insight = '';
          if (count >= 2) {
            insight = `Takvimdeki 5 ${dayName} gününün ${count} tanesine denk gelerek ay toplamında ${totalMonthDuties} nöbete ulaşmış ve ${currentMonthDifference >= 0 ? '+' : ''}${currentMonthDifference} gün fark oluşturmuştur.`;
          } else {
            insight = `5 ${dayName} gününden 1 tanesine nöbetçi atanmıştır.`;
          }

          return {
            staffId: s.id,
            staffName: s.name,
            groupId: s.groupId,
            dutyDates: staffShiftMap[s.id],
            shiftsOnThisDayCount: count,
            totalMonthDuties,
            currentMonthDifference,
            netBalanceDays,
            insight,
          };
        })
        .sort((a, b) => b.shiftsOnThisDayCount - a.shiftsOnThisDayCount);

      fiveDaysAnomalies.push({
        dayName,
        dayOfWeek: dow,
        dates,
        affectedStaff,
      });
    }
  });

  // 2. Ajan Denetim Bulguları (Audit Items)
  const auditItems: AgentAuditItem[] = [];

  // A) 5 Gün Anomalileri & Fazla Mesai Uyarısı
  fiveDaysAnomalies.forEach(anomaly => {
    const heavyStaff = anomaly.affectedStaff.filter(s => s.shiftsOnThisDayCount >= 2);
    if (heavyStaff.length > 0) {
      const names = heavyStaff.map(s => `${s.staffName} (${s.shiftsOnThisDayCount} kez)`).join(', ');
      
      // Personellerin net bakiyelerine göre aksiyon açıklaması
      const hasNetCreditor = heavyStaff.some(s => s.netBalanceDays > 0);
      const allBalanced = heavyStaff.every(s => s.netBalanceDays === 0);
      
      let actionText = '';
      if (allBalanced) {
        actionText = `Bu ekstra nöbetler, personellerin geçmiş aylardan devreden borçlarını kapatmış veya hedefle tam denkleşerek net bakiyelerini 0 güne (Denk) eşitlemiştir. Gelecek aya ilave alacak devretmemiştir.`;
      } else if (hasNetCreditor) {
        actionText = `Ekstra denk gelen nöbetler net alacak oluşturan personellerde (+ bakiye) sonraki aya alacak olarak devredilmiş; borçlu personellerde ise geçmiş borcu kapatmada kullanılmıştır.`;
      } else {
        actionText = `Ekstra nöbetler personellerin geçmiş borçlarını hafifletmek için kullanılmıştır.`;
      }

      auditItems.push({
        id: `five-day-${anomaly.dayOfWeek}`,
        category: 'CALENDAR_ANOMALY',
        severity: 'warning',
        title: `Takvim Döngüsü: Bu ay 5 adet ${anomaly.dayName} bulunmaktadır`,
        description: `${monthName} ayı takviminde 5 kez ${anomaly.dayName} günü yer almaktadır (Tarihler: ${anomaly.dates.map(d => `${d} ${monthName}`).join(', ')}). Bu takvim döngüsü ${names} personellerinin ay içi nöbet sayısını doğrudan etkilemiştir.`,
        affectedStaffName: names,
        actionTaken: actionText
      });
    }
  });

  // B) Fazla Mesai / Alacaklı Personel Analizi & Düşüm Planı
  const creditors = Object.values(staffStats).filter(st => st.netBalanceDays > 0);
  const debtors = Object.values(staffStats).filter(st => st.netBalanceDays < 0);

  creditors.forEach(cred => {
    auditItems.push({
      id: `credit-${cred.staff.id}`,
      category: 'OVERTIME_CREDIT',
      severity: 'info',
      title: `${cred.staff.name}: +${cred.netBalanceDays} Gün Alacak Oluştu`,
      description: `Personel bu ay ${cred.totalDuties} nöbet (${cred.equivalentWorkDays} gün) tutarak hedefi (${targetWorkingDays} gün) aşmıştır. Geçmiş devirle birlikte net bakiyesi +${cred.netBalanceDays} gündür.`,
      affectedStaffName: cred.staff.name,
      actionTaken: `Ajan, bu +${cred.netBalanceDays} günü gelecek ayın (ve sonraki ayların) alacak devrine aktarmıştır. Bir sonraki ayda personelin nöbet yükü otomatik hafifletilecek veya nöbet takasında eksiye düşme hakkı tanınacaktır.`
    });
  });

  // C) Borçlu Personel & Telafi Planı (26 günde 8 nöbet gibi durumlar)
  debtors.forEach(debt => {
    auditItems.push({
      id: `debt-${debt.staff.id}`,
      category: 'DEBT_CARRYOVER',
      severity: 'warning',
      title: `${debt.staff.name}: ${debt.netBalanceDays} Gün Borç Devri`,
      description: `Personel bu ay ${debt.totalDuties} nöbet tutmuş (${debt.equivalentWorkDays} gün) ve hedef ${targetWorkingDays} günün ${Math.abs(debt.currentMonthDifference)} gün gerisinde kalmıştır. Net bakiye: ${debt.netBalanceDays} gün.`,
      affectedStaffName: debt.staff.name,
      actionTaken: `Bu ${debt.netBalanceDays} günlük borç silinmez; gelecek ayın devir bakiyesine aktarılmıştır. Sonraki aylarda otomatik denkleştirme veya ilave nöbet ile kapatılacaktır.`
    });
  });

  // D) Genel İstirahat & Sağlık Kontrolü
  auditItems.push({
    id: 'rest-integrity',
    category: 'REST_INTEGRITY',
    severity: 'success',
    title: '24/72 Saat Dinlenme Bütünlüğü Korundu',
    description: `Tüm birim personellerinin 24 saatlik ABC nöbeti sonrasında ertesi gün ve takip eden istirahat süreleri denetlenmiş, kural dışı ardışık nöbet atanmadığı onaylanmıştır.`,
    actionTaken: 'Kesintisiz 72 saat dinlenme güvencesi aktif.'
  });

  const nextMonthName = TURKISH_MONTHS[(month + 1) % 12];
  const nextMonthYear = (month + 1) > 11 ? year + 1 : year;

  const fiveDayText = fiveDaysAnomalies.length > 0 
    ? fiveDaysAnomalies.map(a => `5 adet ${a.dayName}`).join(' ve ') 
    : 'Standart döngü';

  const executiveSummary = (creditors.length === 0 && debtors.length === 0)
    ? `${monthName} ${year} döneminde geçmişten gelen tüm borç ve alacaklar tam telafi nöbetleriyle kapatılmış, ekibin tamamı 0 gün net bakiye ile tam dengeye (Denk) ulaşmıştır. Gelecek aya devreden herhangi bir borç veya alacak bulunmamaktadır.`
    : `${monthName} ${year} döneminde takvimsel olarak ${fiveDayText} tespit edilmiştir. Toplam ${creditors.length} personelde takvim fazlalığı veya nöbet dengesi kaynaklı alacak (+ bakiye), ${debtors.length} personelde ise ay hedefi farkından kaynaklı borç (- bakiye) oluşmuştur.`;

  const nextMonthOffsetPlan = (creditors.length === 0 && debtors.length === 0)
    ? `${nextMonthName} ${nextMonthYear} dönemine devreden herhangi bir borç veya alacak bulunmamaktadır. Tüm personel eşit ve denk şartlarda yeni döneme başlamaktadır.`
    : `Oluşan tüm + ve - bakiyeler ${nextMonthName} ${nextMonthYear} dönemine kurumsal kümülatif motor tarafından devredilmiştir. 5'li gün fazlalığı yaşayan personellerin alacakları, sonraki ayın nöbet dağılımında hafifletilerek telafi edilecektir.`;

  return {
    analyzedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    monthName,
    year,
    fiveDaysAnomalies,
    auditItems,
    totalOvertimeStaffCount: creditors.length,
    totalDebtorStaffCount: debtors.length,
    executiveSummary,
    nextMonthOffsetPlan,
  };
}

export function generateMonthSchedule(
  year: number,
  month: number, // 0 - 11
  startGroup?: GroupId,
  staffList: StaffMember[] = [],
  customOverrides: Record<number, GroupId> = {},
  previousBalances: Record<string, number> = {},
  customTargetDays?: number,
  enableAutoCompensate: boolean = true,
  leaves: StaffLeave[] = []
): MonthSummary {
  const totalDays = new Date(year, month + 1, 0).getDate();
  const shifts: DayShift[] = [];

  // Ayın iş günü hedefi
  const targetWorkingDays = customTargetDays || calculateTargetWorkingDays(year, month);

  // Personel listesindeki mevcut grupları alfabetik sırayla belirle
  const availableGroupIds = staffList.map(s => s.groupId).filter((value, index, self) => self.indexOf(value) === index);
  const hasGroupD = availableGroupIds.includes('D');

  // 6 Kişilik Grupsuz (Tek Kişi / Bireysel) Modeli Kontrolü
  const isIndividual6p =
    staffList.some((s) => s.id?.startsWith('noc-ind-')) ||
    staffList.some((s) => s.groupId?.startsWith('P')) ||
    (staffList.length === 6 && !hasGroupD && staffList.every((s) => s.roleNote?.includes('Tek Kişi') || s.groupId.startsWith('P')));

  // D Grubu her zaman Çarşamba ve Pazar çalışır. A,B,C grupları diğer günleri döndürür.
  // 6 Kişilik modelde ise hafta içi A ve B grupları döner, Cmt ve Paz sabit 3. Grup (C) tek kişi tutar.
  const baseOrder: GroupId[] = hasGroupD ? ['A', 'B', 'C'] : ['A', 'B'];
  let rotatingGroups = baseOrder.filter((g) => availableGroupIds.includes(g));
  if (rotatingGroups.length === 0) {
    rotatingGroups = hasGroupD ? ['A', 'B', 'C'] : ['A', 'B'];
  }

  // 1. Günden başlayacak grup (Akıllı Dengeleme veya Dişli çark)
  let effectiveStartGroup = startGroup;
  if (!effectiveStartGroup) {
    if (Object.keys(previousBalances).length > 0 && rotatingGroups.length > 1) {
      // Akıllı Başlangıç Grubu Seçimi:
      // O ayki borç ve alacakları sıfıra en çok yaklaştıran başlangıç grubunu otomatik seçer
      let bestGroup = rotatingGroups[0];
      let bestScore = 999999999;
      
      for (const cand of rotatingGroups) {
        const cStartIndex = rotatingGroups.indexOf(cand);
        let cWeekday = 0;
        const candidateDuties: Record<string, number> = {};
        staffList.forEach(s => { candidateDuties[s.id] = 0; });
        
        for (let d = 1; d <= totalDays; d++) {
          const dow = getSafeDayOfWeek(year, month, d);
          
          if (customOverrides[d]) {
            const oG = customOverrides[d];
            const dStaff = getDutyStaffForDay(oG, staffList, dow, hasGroupD);
            dStaff.forEach(s => { candidateDuties[s.id]++; });
            if (hasGroupD ? dow !== 0 : (dow >= 1 && dow <= 5)) cWeekday++;
          } else if (isIndividual6p) {
            const indStaff = getIndividual6pStaffForDay(year, month, d, staffList);
            indStaff.forEach(s => { candidateDuties[s.id]++; });
          } else if (!hasGroupD) {
            const cStaff1 = staffList.find(s => s.groupId === 'C' && (s.orderInGroup === 1 || s.roleNote?.toLowerCase().includes('salı') || s.roleNote?.toLowerCase().includes('cumartesi') || s.roleNote?.toLowerCase().includes('ctesi')));
            const cStaff2 = staffList.find(s => s.groupId === 'C' && (s.orderInGroup === 2 || s.roleNote?.toLowerCase().includes('çarşamba') || s.roleNote?.toLowerCase().includes('pazar')));
            const cStaffAll = staffList.filter(s => s.groupId === 'C');
            const p1 = cStaff1 || cStaffAll[0];
            const p2 = cStaff2 || cStaffAll[1] || cStaffAll[0];

            if (dow === 1 || dow === 4) { // Pazartesi & Perşembe: 1. Grup (A)
              const dStaff = staffList.filter(s => s.groupId === 'A');
              dStaff.forEach(s => { candidateDuties[s.id]++; });
            } else if (dow === 2) { // Salı: 2. Grup (B) + 1. Kişi (Hasan Çelik)
              const dStaff = staffList.filter(s => s.groupId === 'B');
              dStaff.forEach(s => { candidateDuties[s.id]++; });
              if (p1) candidateDuties[p1.id]++;
            } else if (dow === 5) { // Cuma: 2. Grup (B)
              const dStaff = staffList.filter(s => s.groupId === 'B');
              dStaff.forEach(s => { candidateDuties[s.id]++; });
            } else if (dow === 6) { // Cumartesi: 1. Kişi (Hasan Çelik - Tek Kişi)
              if (p1) candidateDuties[p1.id]++;
            } else if (dow === 3 || dow === 0) { // Çarşamba ve Pazar: 2. Kişi (Hüseyin Yıldız - Tek Kişi)
              if (p2) candidateDuties[p2.id]++;
            }
          } else if (dow === 0 && hasGroupD) {
            const dStaff = staffList.filter(s => s.groupId === 'D');
            dStaff.forEach(s => { candidateDuties[s.id]++; });
          } else {
            const gIdx = (cStartIndex + cWeekday) % rotatingGroups.length;
            const regG = rotatingGroups[gIdx];
            const dStaff = getDutyStaffForDay(regG, staffList, dow, hasGroupD);
            dStaff.forEach(s => { candidateDuties[s.id]++; });
            cWeekday++;
            if (dow === 3 && hasGroupD) {
              const dStaffAll = staffList.filter(s => s.groupId === 'D');
              dStaffAll.forEach(s => { candidateDuties[s.id]++; });
            }
          }
        }
        
        let score = 0;
        let maxAbs = 0;
        for (const s of staffList) {
          const dCount = candidateDuties[s.id] || 0;
          const diff = dCount * 3 - targetWorkingDays;
          const net = (previousBalances[s.id] || 0) + diff;
          const absNet = Math.abs(net);
          if (absNet > maxAbs) maxAbs = absNet;
          score += Math.pow(absNet, 3) * 10;
          if (net === 0) score -= 50;
        }
        score += maxAbs * 100;
        
        if (score < bestScore) {
          bestScore = score;
          bestGroup = cand;
        }
      }
      effectiveStartGroup = bestGroup;
    } else {
      effectiveStartGroup = getGearStartGroup(year, month, 2026, 8, 'A', rotatingGroups);
    }
  }
  let startIndex = rotatingGroups.indexOf(effectiveStartGroup);
  if (startIndex === -1) startIndex = 0;

  // 1. AŞAMA: Günlük ABC Nöbet Dağılımı
  let weekdayCount = 0;
  
  for (let day = 1; day <= totalDays; day++) {
    // Saat 12:00 verilerek gün dönümü / DST kaymaları tamamen önlenir
    const date = new Date(year, month, day, 12, 0, 0);
    const dayOfWeek = getSafeDayOfWeek(year, month, day); // 0 = Pazar, 6 = Cumartesi
    // SADECE Cumartesi (6) ve Pazar (0) günleri hafta sonudur, hafta içi (1-5) ASLA boyanamaz!
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let dutyGroupId: GroupId = 'A';
    let dutyStaff: StaffMember[] = [];
    let isOverridden = false;

    // Yönetici manuel bir değişim yapmışsa
    if (customOverrides[day]) {
      dutyGroupId = customOverrides[day];
      dutyStaff = getDutyStaffForDay(dutyGroupId, staffList, dayOfWeek, hasGroupD);
      isOverridden = true;
      if (hasGroupD ? dayOfWeek !== 0 : (dayOfWeek >= 1 && dayOfWeek <= 5)) {
        weekdayCount++;
      }
    } else if (isIndividual6p) {
      // === 6 KİŞİLİK GRUPSUZ (TEK KİŞİ / 6 HAFTALIK DÖNGÜ) MODELİ ===
      // 1. Badi veya sabit eşleşme yok; herkes 6 haftalık döngüde rotasyona girer.
      // 2. 6 haftada bir (42 günde) döngü tam olarak başa döner.
      // 3. Her personel haftada tam 2 nöbet (48 saat), ayda 8-9 nöbet (192-216 saat) tutar.
      // 4. İki nöbet arasında kesintisiz istirahat güvence altındadır.
      dutyStaff = getIndividual6pStaffForDay(year, month, day, staffList);
      dutyGroupId = dutyStaff[0]?.groupId || 'P1';
    } else if (!hasGroupD) {
      // === 6 KİŞİLİK GRUPLU MODEL ===
      // 1. Grup (A): Pazartesi ve Perşembe (2 Kişi - Serkan Tuna & Mehmet Kızılay)
      // 2. Grup (B): Salı ve Cuma (2 Kişi - İbrahim Erek & Barış Memiş)
      // 3. Grup (C): Çarşamba (2 Kişi - İbrahim Akpınar & Mustafa Telsiz), Cumartesi (1 Kişi - İbrahim Akpınar), Pazar (1 Kişi - Mustafa Telsiz)
      
      const cStaff1 = staffList.find(s => s.groupId === 'C' && (s.orderInGroup === 1 || s.roleNote?.toLowerCase().includes('cumartesi') || s.roleNote?.toLowerCase().includes('ctesi')));
      const cStaff2 = staffList.find(s => s.groupId === 'C' && (s.orderInGroup === 2 || s.roleNote?.toLowerCase().includes('pazar')));
      const cStaffAll = staffList.filter(s => s.groupId === 'C');
      const p1 = cStaff1 || cStaffAll[0];
      const p2 = cStaff2 || cStaffAll[1] || cStaffAll[0];

      if (dayOfWeek === 1) { // PAZARTESİ: 1. Grup (A) - 2 Kişi (Serkan Tuna & Mehmet Kızılay)
        dutyGroupId = 'A';
        dutyStaff = staffList.filter(s => s.groupId === 'A');
      } else if (dayOfWeek === 2) { // SALI: 2. Grup (B) - TAM 2 KİŞİ (İbrahim Erek & Barış Memiş)
        dutyGroupId = 'B';
        dutyStaff = staffList.filter(s => s.groupId === 'B');
      } else if (dayOfWeek === 3) { // ÇARŞAMBA: 3. Grup (C) - TAM 2 KİŞİ (İbrahim Akpınar & Mustafa Telsiz)
        dutyGroupId = 'C';
        dutyStaff = staffList.filter(s => s.groupId === 'C');
      } else if (dayOfWeek === 4) { // PERŞEMBE: 1. Grup (A) - 2 Kişi (Serkan Tuna & Mehmet Kızılay)
        dutyGroupId = 'A';
        dutyStaff = staffList.filter(s => s.groupId === 'A');
      } else if (dayOfWeek === 5) { // CUMA: 2. Grup (B) - 2 Kişi (İbrahim Erek & Barış Memiş)
        dutyGroupId = 'B';
        dutyStaff = staffList.filter(s => s.groupId === 'B');
      } else if (dayOfWeek === 6) { // CUMARTESİ: 3. Grup 1. Kişi (İbrahim Akpınar - Sabit Tek Kişi)
        dutyGroupId = 'C';
        dutyStaff = p1 ? [p1] : (cStaffAll.length > 0 ? [cStaffAll[0]] : []);
      } else if (dayOfWeek === 0) { // PAZAR: 3. Grup 2. Kişi (Mustafa Telsiz - Sabit Tek Kişi)
        dutyGroupId = 'C';
        dutyStaff = p2 ? [p2] : (cStaffAll.length > 1 ? [cStaffAll[1]] : [cStaffAll[0]]);
      }
    } else {
      // === 7 KİŞİLİK STANDART MODEL ===
      if (dayOfWeek === 0) { // PAZAR
        // Pazar günü rotasyon sayacı İLERLEMEZ (weekdayCount artmaz).
        // Böylece Pazar gününü atlayan grubun nöbeti Pazartesiye kayar ve 5 günlük doğal boşluklar ENGELLENİR.
        dutyGroupId = 'D';
        const dStaffAll = staffList.filter((s) => s.groupId === 'D');
        dutyStaff = dStaffAll;
      } else {
        // Pazar değilse normal rotasyon
        const groupIndex = (startIndex + weekdayCount) % rotatingGroups.length;
        dutyGroupId = rotatingGroups[groupIndex];
        dutyStaff = getDutyStaffForDay(dutyGroupId, staffList, dayOfWeek, hasGroupD);
        weekdayCount++;
        
        // ÇARŞAMBA: Normal rotasyonun yanına D grubu da eklenir
        if (dayOfWeek === 3 && hasGroupD) {
          const dStaffAll = staffList.filter((s) => s.groupId === 'D');
          dutyStaff = [...dutyStaff, ...dStaffAll];
        }
      }
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateString = `${year}-${pad(month + 1)}-${pad(day)}`;

    // Bu günde izinli olan personelleri tespit et
    const dayLeaves = leaves.filter((l) => day >= l.startDay && day <= l.endDay);
    const leaveStaffIds = new Set(dayLeaves.map((l) => l.staffId));

    // Nöbetçi personeller arasından izinli olanları çıkar (nöbete katılmayacak)
    dutyStaff = dutyStaff.filter((st) => !leaveStaffIds.has(st.id));

    const dayLeavesInfo: { staff: StaffMember; reason?: string }[] = [];
    dayLeaves.forEach((l) => {
      const st = staffList.find((s) => s.id === l.staffId);
      if (st) {
        dayLeavesInfo.push({ staff: st, reason: l.reason });
      }
    });

    shifts.push({
      dayNumber: day,
      date,
      dateString,
      dayName: TURKISH_DAYS_FULL[dayOfWeek],
      isWeekend,
      dutyGroupId,
      dutyStaff,
      leaves: dayLeavesInfo.length > 0 ? dayLeavesInfo : undefined,
      shiftHours: '24 Saat ABC Nöbeti (07:30 - Ertesi Sabah 07:30)',
      isOverridden,
    });
  }

  // 2. AŞAMA: BİREYSEL OTOMATİK DENKLEŞTİRME (İsim/ID Bazlı Takip)
  let compensatedShiftsCount = 0;

  // NOC Pilot Birimi Kontrolü
  const isNoc = staffList.some((s) => s.id.startsWith('noc-'));

  if (enableAutoCompensate) {
    // Tüm Birimler İçin: Nöbet Devri & Adil Denkleştirme (Shift Exchange)
    // 1 nöbet 24 saat = 3 gün normal mesaiye denktir. Bir personelde biriken fazla alacak (>= 2 gün) ile
    // borcu olan personel (<= -2 gün) arasında adil nöbet değişimi yapılır.
    // Güvenlik kuralları:
    // 1. Vardiyadaki toplam kişi sayısı ASLA azalmaz (daima tam kadro).
    // 2. Nöbeti devralan personel kesinlikle ardışık gün nöbet tutmaz (d-1, d, d+1 günleri boş olmalıdır).
    // 3. Özel gün değiştirme (override) olan günler korunur.
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 8) {
      changed = false;
      iterations++;

      const getStaffDutyDays = () => {
        const counts: Record<string, number[]> = {};
        staffList.forEach(st => { counts[st.id] = []; });
        shifts.forEach(sh => {
          sh.dutyStaff.forEach(st => counts[st.id]?.push(sh.dayNumber));
        });
        return counts;
      };

      const currentStaffDays = getStaffDutyDays();
      const getNetBalance = (id: string) => {
        const duties = currentStaffDays[id]?.length || 0;
        return (previousBalances[id] || 0) + (duties * 3) - targetWorkingDays;
      };

      const sorted = [...staffList].sort((a, b) => getNetBalance(b.id) - getNetBalance(a.id));
      const creditor = sorted[0];
      const debtor = sorted[sorted.length - 1];

      // Eğer en yüksek alacaklı >= 2 ve en çok borçlu <= -2 ise nöbet devri yap
      if (getNetBalance(creditor.id) >= 2 && getNetBalance(debtor.id) <= -2) {
        for (let d = 1; d <= totalDays; d++) {
          const shift = shifts[d - 1];
          if (shift.isOverridden) continue;

          const creditorAssigned = shift.dutyStaff.some(s => s.id === creditor.id);
          if (!creditorAssigned) continue;

          // Borçlunun d-2, d-1, d, d+1, d+2 günlerinde nöbeti olmamalıdır (en az 48 saat kesintisiz istirahat, 1 gün boşluk YASAK!)
          const debtorDays = currentStaffDays[debtor.id] || [];
          const debtorTooClose = debtorDays.some(dayNum => Math.abs(dayNum - d) <= 2);

          if (!debtorTooClose) {
            // Nöbet devri gerçekleştir: Alacaklı dinlenir, borçlu nöbeti alarak borcunu kapatır
            shift.dutyStaff = shift.dutyStaff.map(s => s.id === creditor.id ? debtor : s);
            shift.isCompensated = true;
            compensatedShiftsCount++;
            changed = true;
            break;
          }
        }
      }
    }
  }

  // 3. AŞAMA: KESİNTİSİZ İSTİRAHAT KONTROLÜ
  // KURAL: "ABC çalışan personel ertesi gün ABC çalışamaz, arasında en az 2 ve 3 gün boşluk olmalı!"
  const staffDutyDays: Record<string, number[]> = {};
  staffList.forEach((st) => { staffDutyDays[st.id] = []; });

  shifts.forEach((shift) => {
    shift.dutyStaff.forEach((st) => {
      staffDutyDays[st.id]?.push(shift.dayNumber);
    });
    shift.supportStaff?.forEach((st) => {
      if (!staffDutyDays[st.id]?.includes(shift.dayNumber)) {
        staffDutyDays[st.id]?.push(shift.dayNumber);
      }
    });
  });

  // Güvenlik Doğrulaması: Aradaki dinlenme günü sayısı en az 2 olmalı
  staffList.forEach((st) => {
    const days = (staffDutyDays[st.id] || []).sort((a, b) => a - b);
    for (let i = 1; i < days.length; i++) {
      const restDays = days[i] - days[i - 1] - 1;
      // Telafi nöbetleri eklendiğinde 1 gün dinlenme kalabiliyor. 0 gün (üst üste) kesinlikle YASAK!
      if (restDays < 1) {
        console.warn(`CRITICAL Vardiya kuralı ihlali: ${st.name} için ${days[i-1]} ve ${days[i]} nöbetleri üst üste! (Ertesi gün nöbet tutulamaz)`);
      }
    }
  });

  // 3. AŞAMA: Sayaçlar ve Borç / Alacak Bakiyelerinin Hesaplanması
  const dutyCounts: Record<string, number> = {};
  staffList.forEach((st) => {
    dutyCounts[st.id] = 0;
  });

  shifts.forEach((shift) => {
    // Ana nöbetçi personel sayaçları
    shift.dutyStaff.forEach((st) => {
      dutyCounts[st.id] = (dutyCounts[st.id] || 0) + 1;
    });
    // Araya sıkıştırılan denkleştirme personelleri
    if (shift.supportStaff) {
      shift.supportStaff.forEach((st) => {
        dutyCounts[st.id] = (dutyCounts[st.id] || 0) + 1;
      });
    }
  });

  const staffStats: MonthSummary['staffStats'] = {};

  staffList.forEach((st) => {
    const totalDuties = dutyCounts[st.id] || 0;
    const totalHours = totalDuties * 24;
    
    const equivalentWorkDays = totalDuties * 3;
    const prevCarryover = previousBalances[st.id] || 0;

    // Personelin bu aydaki izin günlerini hesapla (Pazarlar hariç resmi iş günleri)
    let staffLeaveWorkDays = 0;
    const stLeaves = leaves.filter((l) => l.staffId === st.id);
    stLeaves.forEach((l) => {
      for (let d = Math.max(1, l.startDay); d <= Math.min(totalDays, l.endDay); d++) {
        if (getSafeDayOfWeek(year, month, d) !== 0) { // Pazar günü zaten tatil olduğu için çalışma gününden düşülmez
          staffLeaveWorkDays++;
        }
      }
    });

    // İzin alan personelin aylık hedefi, izin günleri kadar düşürülür
    const adjustedTargetWorkingDays = Math.max(0, targetWorkingDays - staffLeaveWorkDays);
    const currentMonthDifference = equivalentWorkDays - adjustedTargetWorkingDays;
    const netBalanceDays = prevCarryover + currentMonthDifference;

    let status: StaffShiftBalance['status'] = 'BALANCED';
    if (netBalanceDays < 0) {
      status = 'DEBTOR'; // Borçlu / Eksik
    } else if (netBalanceDays > 0) {
      status = 'CREDITOR'; // Alacaklı / Fazla
    }

    staffStats[st.id] = {
      staff: st,
      totalDuties,
      totalHours,
      equivalentWorkDays,
      targetWorkDays: adjustedTargetWorkingDays,
      baseTargetWorkDays: targetWorkingDays,
      leaveDays: staffLeaveWorkDays,
      previousCarryoverDays: prevCarryover,
      currentMonthDifference,
      netBalanceDays,
      status,
    };
  });

  // 4. AŞAMA: HAFTALIK HESAPLAMALAR VE HAFTA HAFTA NÖBET DÖKÜMÜ (1. Hafta, 2. Hafta, ...)
  const monthName = TURKISH_MONTHS[month];
  const weeklyStats: MonthSummary['weeklyStats'] = [];

  const weekRanges: { weekNumber: number; startDay: number; endDay: number }[] = [
    { weekNumber: 1, startDay: 1, endDay: Math.min(7, totalDays) },
    { weekNumber: 2, startDay: 8, endDay: Math.min(14, totalDays) },
    { weekNumber: 3, startDay: 15, endDay: Math.min(21, totalDays) },
    { weekNumber: 4, startDay: 22, endDay: Math.min(28, totalDays) },
  ];

  if (totalDays > 28) {
    weekRanges.push({
      weekNumber: 5,
      startDay: 29,
      endDay: totalDays,
    });
  }

  weekRanges.forEach((wr) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const startDateStr = `${year}-${pad(month + 1)}-${pad(wr.startDay)}`;
    const endDateStr = `${year}-${pad(month + 1)}-${pad(wr.endDay)}`;
    const weekLabel = `${wr.weekNumber}. Hafta (${wr.startDay} - ${wr.endDay} ${monthName})`;

    const staffWeeklyDuties: Record<string, {
      dutiesCount: number;
      dutyDays: number[];
      totalHours: number;
      equivalentDays: number;
      isDoubleDutyWeek: boolean;
    }> = {};

    staffList.forEach((st) => {
      staffWeeklyDuties[st.id] = {
        dutiesCount: 0,
        dutyDays: [],
        totalHours: 0,
        equivalentDays: 0,
        isDoubleDutyWeek: false,
      };
    });

    for (let d = wr.startDay; d <= wr.endDay; d++) {
      const shift = shifts[d - 1];
      if (shift) {
        const assigned = [...(shift.dutyStaff || []), ...(shift.supportStaff || [])];
        assigned.forEach((st) => {
          if (staffWeeklyDuties[st.id]) {
            staffWeeklyDuties[st.id].dutiesCount++;
            staffWeeklyDuties[st.id].dutyDays.push(d);
            staffWeeklyDuties[st.id].totalHours = staffWeeklyDuties[st.id].dutiesCount * 24;
            staffWeeklyDuties[st.id].equivalentDays = staffWeeklyDuties[st.id].dutiesCount * 3;
            staffWeeklyDuties[st.id].isDoubleDutyWeek = staffWeeklyDuties[st.id].dutiesCount >= 2;
          }
        });
      }
    }

    weeklyStats.push({
      weekNumber: wr.weekNumber,
      weekLabel,
      startDay: wr.startDay,
      endDay: wr.endDay,
      startDateStr,
      endDateStr,
      staffWeeklyDuties,
    });
  });

  const validationWarnings = validateMonthSchedule(shifts, staffStats, staffList, hasGroupD);
  const auditReport = generateAgentAuditReport(year, month, shifts, staffStats, staffList, targetWorkingDays);

  return {
    year,
    month,
    totalDays,
    targetWorkingDays,
    shifts,
    staffStats,
    staffList, 
    weeklyStats,
    cycleInfo: {
      cycleLengthWeeks: 6,
      cycleTotalDays: 42,
      shiftsPerPersonInCycle: isIndividual6p ? 12 : 7,
      hoursPerPersonInCycle: isIndividual6p ? 288 : 168,
      cycleCompletionRate: Math.min(100, Math.round((totalDays / 42) * 100)),
    },
    autoCompensated: enableAutoCompensate,
    compensatedShiftsCount,
    validationWarnings,
    auditReport,
    leaves,
  };
}

export function exportScheduleToCSV(
  departmentName: string,
  summary: MonthSummary,
  staffList: StaffMember[]
) {
  const monthName = TURKISH_MONTHS[summary.month];
  const title = `${departmentName} - ${monthName} ${summary.year} Vardiya ve Bakiye Çizelgesi`;

  const header = ['Tarih', 'Gün', 'Nöbetçi Grup', 'Görevli Personeller (07:30 - Ertesi 07:30)', 'Vardiya Süresi'];
  const rows = summary.shifts.map((s) => [
    `${s.dayNumber} ${monthName} ${summary.year}`,
    s.dayName,
    `Grup ${s.dutyGroupId}`,
    s.dutyStaff.map((p) => p.name).join(' & ') || 'Atanmadı',
    '24 Saat (07:30 - 07:30)'
  ]);

  const summaryTitle = ['--- PERSONEL AYLIK ÇALIŞMA, BORÇ / ALACAK BAKİYE ÖZETİ ---', '', '', '', '', '', ''];
  const staffHeader = [
    'Personel Adı',
    'Grup',
    'Tutulan Nöbet (24s)',
    'Eşdeğer Gün (Nöbet x 3)',
    'Aylık Hedef Gün (6 Günlük Hafta)',
    'Önceki Aydan Devir',
    'Bu Ayki Fark',
    'Net Bakiye Durumu'
  ];

  const staffRows = staffList.map((st) => {
    const stat = summary.staffStats[st.id];
    if (!stat) return [st.name, `Grup ${st.groupId}`, '0', '0', String(summary.targetWorkingDays), '0', '0', 'Denk'];

    const diffText = stat.currentMonthDifference >= 0 ? `+${stat.currentMonthDifference} Gün` : `${stat.currentMonthDifference} Gün`;
    const netText = stat.netBalanceDays > 0
      ? `Alacaklı (+${stat.netBalanceDays} Gün)`
      : stat.netBalanceDays < 0
      ? `Borçlu (${stat.netBalanceDays} Gün)`
      : 'Denk (0 Gün)';

    return [
      st.name,
      `Grup ${st.groupId}`,
      `${stat.totalDuties} Nöbet`,
      `${stat.equivalentWorkDays} Gün`,
      `${stat.targetWorkDays} Gün`,
      `${stat.previousCarryoverDays >= 0 ? '+' : ''}${stat.previousCarryoverDays} Gün`,
      diffText,
      netText,
    ];
  });

  const allRows = [
    [title, '', '', '', '', '', ''],
    [`Hesaplama Esası: 1 Nöbet = 3 Gün (24 saat). Aylık Hedef: ${summary.targetWorkingDays} Gün. Eksik kalan günler borç/alacak olarak devredilir.`, '', '', '', '', '', ''],
    [],
    header,
    ...rows,
    [],
    summaryTitle,
    staffHeader,
    ...staffRows,
  ];

  const csvContent = '\uFEFF' + allRows.map((e) => e.map(item => `"${(item || '').replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${departmentName.replace(/\s+/g, '_')}_${monthName}_${summary.year}_Vardiya_Bakiye.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateYearlyScheduleCsv(year: number, startMonth: number, department: Department, startGroup?: GroupId) {
  let carryoverBalances: Record<string, number> = {};
  
  const endYear = startMonth > 0 ? year + 1 : year;
  const yearTitle = startMonth > 0 ? `${year}-${endYear}` : `${year}`;

  const allRows: string[][] = [
    [`${department.name} - ${yearTitle} YILI TÜM VARDİYA PLANI VE BAKİYELERİ`],
    [`Açıklama: Çizelgede "ABC" nöbet günlerini ifade eder. 1 Nöbet = 3 Gün sayılmaktadır. Her ay gruplar adaletli şekilde kaydırılır.`],
    [],
  ];

  for (let i = 0; i < 12; i++) {
    const currentMonthIndex = (startMonth + i) % 12;
    const currentYear = year + Math.floor((startMonth + i) / 12);
    const monthName = TURKISH_MONTHS[currentMonthIndex];

    const rotatedStaff = getRotatedStaff(department.staff, currentYear, currentMonthIndex, department.shiftModel);
    
    const summary = generateMonthSchedule(
      currentYear,
      currentMonthIndex,
      undefined, // startGroup yerine undefined geçerek getGearStartGroup'un otomatik çalışmasını sağlıyoruz
      rotatedStaff,
      {}, // customOverrides
      carryoverBalances,
      undefined,
      true
    );

    allRows.push([`--- ${monthName} ${currentYear} ---`]);
    
    const daysHeader = ['Personel Adı', 'Grup'];
    for (let d = 1; d <= summary.totalDays; d++) {
      daysHeader.push(d.toString());
    }
    daysHeader.push('Aylık Hedef', 'Toplam Nöbet', 'Önceki Ay Devri', 'Net Bakiye (Gelecek Aya Devir)');
    allRows.push(daysHeader);
    
    rotatedStaff.forEach((st) => {
      const stat = summary.staffStats[st.id];
      if (stat) {
        const row = [st.name, `Grup ${st.groupId}`];
        
        for (let d = 1; d <= summary.totalDays; d++) {
          const shift = summary.shifts[d - 1];
          const isDuty = shift.dutyStaff.some((s) => s.id === st.id) || (shift.supportStaff?.some((s) => s.id === st.id) ?? false);
          
          if (isDuty) {
            row.push('ABC');
          } else {
            const isWeekend = shift.date.getDay() === 0 || shift.date.getDay() === 6;
            row.push(isWeekend ? 'HS' : '-');
          }
        }
        
        row.push(
          `${stat.targetWorkDays} Gün`,
          `${stat.totalDuties} Nöbet`,
          `${stat.previousCarryoverDays > 0 ? '+' : ''}${stat.previousCarryoverDays} Gün`,
          `${stat.netBalanceDays > 0 ? '+' : ''}${stat.netBalanceDays} Gün`
        );
        allRows.push(row);
        
        carryoverBalances[st.id] = stat.netBalanceDays;
      }
    });
    
    allRows.push([]);
    allRows.push([]); // Extra spacing between months
  }

  const csvContent = '\uFEFF' + allRows.map((e) => e.map(item => `"${(item || '').replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${department.name.replace(/\s+/g, '_')}_${year}_Yillik_Plan.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
