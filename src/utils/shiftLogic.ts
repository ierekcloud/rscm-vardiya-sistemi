import { Department, DayShift, GroupId, StaffMember, MonthSummary, StaffShiftBalance } from '../types';

export const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const TURKISH_DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const TURKISH_DAYS_FULL = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

// 5 Bölüm: NOC, MPLS, DSL, SANTRAL, TRANSMİSYON
export const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'dep-noc',
    name: 'NOC',
    staff: [
      { id: 'noc-1', name: 'Ahmet Yılmaz', groupId: 'A', orderInGroup: 1 },
      { id: 'noc-2', name: 'Mehmet Demir', groupId: 'A', orderInGroup: 2 },
      { id: 'noc-3', name: 'Mustafa Kaya', groupId: 'B', orderInGroup: 1 },
      { id: 'noc-4', name: 'Ali Şahin', groupId: 'B', orderInGroup: 2 },
      { id: 'noc-5', name: 'Hasan Çelik', groupId: 'C', orderInGroup: 1 },
      { id: 'noc-6', name: 'Hüseyin Yıldız', groupId: 'C', orderInGroup: 2 },
      { id: 'noc-7', name: 'İbrahim Erek', groupId: 'D', orderInGroup: 1 },
    ],
  },
  {
    id: 'dep-mpls',
    name: 'MPLS',
    staff: [
      { id: 'mpls-1', name: 'Burak Koç', groupId: 'A', orderInGroup: 1 },
      { id: 'mpls-2', name: 'Emre Öztürk', groupId: 'A', orderInGroup: 2 },
      { id: 'mpls-3', name: 'Alp Tuna', groupId: 'A', orderInGroup: 3 },
      { id: 'mpls-4', name: 'Serkan Aydın', groupId: 'B', orderInGroup: 1 },
      { id: 'mpls-5', name: 'Oğuzhan Tekin', groupId: 'B', orderInGroup: 2 },
      { id: 'mpls-6', name: 'Melih Özdemir', groupId: 'B', orderInGroup: 3 },
      { id: 'mpls-7', name: 'Murat Arslan', groupId: 'C', orderInGroup: 1 },
      { id: 'mpls-8', name: 'Kemal Aksoy', groupId: 'C', orderInGroup: 2 },
      { id: 'mpls-9', name: 'Onur Şengül', groupId: 'C', orderInGroup: 3 },
      { id: 'mpls-10', name: 'Caner Güneş', groupId: 'D', orderInGroup: 1 },
      { id: 'mpls-11', name: 'Gökhan Sönmez', groupId: 'D', orderInGroup: 2 },
    ],
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
  
  // Count exact number of non-Sunday days between anchor and target
  let nonSundayCount = 0;
  
  if (targetDate >= anchorDate) {
    let d = new Date(anchorDate);
    while (d < targetDate) {
      if (d.getDay() !== 0) {
        nonSundayCount++;
      }
      d.setDate(d.getDate() + 1);
    }
  } else {
    let d = new Date(targetDate);
    while (d < anchorDate) {
      if (d.getDay() !== 0) {
        nonSundayCount--;
      }
      d.setDate(d.getDate() + 1);
    }
  }

  const anchorIdx = availableGroups.indexOf(anchorStartGroup);
  const baseIdx = anchorIdx === -1 ? 0 : anchorIdx;
  const targetIdx = ((baseIdx + nonSundayCount) % availableGroups.length + availableGroups.length) % availableGroups.length;

  return availableGroups[targetIdx];
}

/**
 * Her ay personelin adaletli bir şekilde 4 grup (A, B, C, D) arasında yer değiştirmesini sağlar.
 * D grubu da dahil olmak üzere tüm personeller her ay adil ve sistematik olarak sırayla döner.
 */
export function getRotatedStaff(staffList: StaffMember[], year: number, month: number): StaffMember[] {
  if (!staffList || staffList.length === 0) return [];

  // Personeli hiyerarşik grup ve sıra düzenine göre sırala
  const sortedStaff = [...staffList].sort((a, b) => {
    const groupOrder = ['A', 'B', 'C', 'D'];
    if (a.groupId !== b.groupId) {
      return groupOrder.indexOf(a.groupId) - groupOrder.indexOf(b.groupId);
    }
    return (a.orderInGroup || 0) - (b.orderInGroup || 0);
  });

  // Orijinal slot yapılarını (hangi index'te hangi grup ve sıra var) kaydet
  const slotLayout = sortedStaff.map(s => ({ groupId: s.groupId, orderInGroup: s.orderInGroup }));

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

  // Kaydırılmış personellere ilgili slotun grup ve sıra özelliklerini ata
  return shifted.map((staff, index) => ({
    ...staff,
    groupId: slotLayout[index].groupId,
    orderInGroup: slotLayout[index].orderInGroup,
  }));
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
    if (new Date(year, month, d).getDay() === 0) sundays++;
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

export function generateMonthSchedule(
  year: number,
  month: number, // 0 - 11
  startGroup?: GroupId,
  staffList: StaffMember[] = [],
  customOverrides: Record<number, GroupId> = {},
  previousBalances: Record<string, number> = {},
  customTargetDays?: number,
  enableAutoCompensate: boolean = true
): MonthSummary {
  const totalDays = new Date(year, month + 1, 0).getDate();
  const shifts: DayShift[] = [];

  // Ayın iş günü hedefi
  const targetWorkingDays = customTargetDays || calculateTargetWorkingDays(year, month);

  // Personel listesindeki mevcut grupları alfabetik sırayla belirle
  const availableGroupIds = staffList.map(s => s.groupId).filter((value, index, self) => self.indexOf(value) === index);
  const hasGroupD = availableGroupIds.includes('D');

  // D Grubu her zaman Çarşamba ve Pazar çalışır. A,B,C grupları diğer günleri döndürür.
  // Bu nedenle D grubunu normal döngüden (rotatingGroups) çıkarıyoruz.
  const baseOrder: GroupId[] = ['A', 'B', 'C'];
  let rotatingGroups = baseOrder.filter((g) => availableGroupIds.includes(g));
  if (rotatingGroups.length === 0) {
    rotatingGroups = ['A', 'B', 'C'];
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
        let cNonSun = 0;
        let cDGroup = 0;
        const candidateDuties: Record<string, number> = {};
        staffList.forEach(s => { candidateDuties[s.id] = 0; });
        
        for (let d = 1; d <= totalDays; d++) {
          const dDate = new Date(year, month, d);
          const dow = dDate.getDay();
          
          if (customOverrides[d]) {
            const oG = customOverrides[d];
            staffList.filter(s => s.groupId === oG).forEach(s => { candidateDuties[s.id]++; });
            if (dow !== 0 || !hasGroupD) cNonSun++;
          } else if (dow === 0 && hasGroupD) {
            const dStaff = staffList.filter(s => s.groupId === 'D');
            if (dStaff.length > 0) {
              candidateDuties[dStaff[cDGroup % dStaff.length].id]++;
              cDGroup++;
            }
          } else {
            const gIdx = (cStartIndex + cNonSun) % rotatingGroups.length;
            const regG = rotatingGroups[gIdx];
            staffList.filter(s => s.groupId === regG).forEach(s => { candidateDuties[s.id]++; });
            cNonSun++;
            if (dow === 3 && hasGroupD) {
              const dStaff = staffList.filter(s => s.groupId === 'D');
              if (dStaff.length > 0) {
                candidateDuties[dStaff[cDGroup % dStaff.length].id]++;
                cDGroup++;
              }
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
  let nonSundayCount = 0;
  let dGroupCount = 0; // D Grubu personelleri için sırayla nöbet tutturma sayacı
  
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Pazar, 6 = Cumartesi
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // SADECE Pazar olmayan günlerde (D grubunun tek başına olduğu günler hariç) sayaç ilerler
    const groupIndex = (startIndex + nonSundayCount) % rotatingGroups.length;
    const regularDutyGroupId: GroupId = rotatingGroups[groupIndex];

    let dutyGroupId: GroupId = regularDutyGroupId;
    let dutyStaff: StaffMember[] = [];
    let isOverridden = false;

    // Yönetici manuel bir değişim yapmışsa
    if (customOverrides[day]) {
      dutyGroupId = customOverrides[day];
      dutyStaff = staffList.filter((s) => s.groupId === dutyGroupId);
      isOverridden = true;
      if (dayOfWeek !== 0 || !hasGroupD) {
        nonSundayCount++;
      }
    } else {
      if (dayOfWeek === 0 && hasGroupD) { // PAZAR
        // Pazar günü rotasyon sayacı İLERLEMEZ (nonSundayCount artmaz).
        // Böylece Pazar gününü atlayan grubun nöbeti Pazartesiye kayar ve 5 günlük doğal boşluklar ENGELLENİR.
        dutyGroupId = 'D';
        const dStaffAll = staffList.filter((s) => s.groupId === 'D');
        dutyStaff = [dStaffAll[dGroupCount % dStaffAll.length]];
        dGroupCount++;
      } else {
        // Pazar değilse normal rotasyon
        dutyGroupId = regularDutyGroupId;
        dutyStaff = staffList.filter((s) => s.groupId === dutyGroupId);
        nonSundayCount++;
        
        // ÇARŞAMBA: Normal rotasyonun yanına D grubu da eklenir
        if (dayOfWeek === 3 && hasGroupD) {
          const dStaffAll = staffList.filter((s) => s.groupId === 'D');
          const groupDStaff = [dStaffAll[dGroupCount % dStaffAll.length]];
          dutyStaff = [...dutyStaff, ...groupDStaff];
          dGroupCount++;
        }
      }
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateString = `${year}-${pad(month + 1)}-${pad(day)}`;

    shifts.push({
      dayNumber: day,
      date,
      dateString,
      dayName: TURKISH_DAYS_FULL[dayOfWeek],
      isWeekend,
      dutyGroupId,
      dutyStaff,
      shiftHours: '24 Saat ABC Nöbeti (07:30 - Ertesi Sabah 07:30)',
      isOverridden,
    });
  }

  // 2. AŞAMA: BİREYSEL OTOMATİK DENKLEŞTİRME (İsim/ID Bazlı Takip)
  let compensatedShiftsCount = 0;

  // NOC Pilot Birimi Kontrolü
  const isNoc = staffList.some((s) => s.id.startsWith('noc-'));

  if (enableAutoCompensate && isNoc) {
    // NOC Pilot Birimi: Nöbet Devri & Denkleştirme (Shift Exchange)
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

          // Borçlunun d-1, d ve d+1 günlerinde çalışmıyor olması gerekir (en az 24 saat kesintisiz istirahat)
          const debtorDays = currentStaffDays[debtor.id] || [];
          const debtorWorksPrev = (d > 1) && debtorDays.includes(d - 1);
          const debtorWorksCurr = debtorDays.includes(d);
          const debtorWorksNext = (d < totalDays) && debtorDays.includes(d + 1);

          if (!debtorWorksPrev && !debtorWorksCurr && !debtorWorksNext) {
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
  } else if (enableAutoCompensate && !isNoc) {
    const staffDutyDays: Record<string, number[]> = {};
    staffList.forEach(st => { staffDutyDays[st.id] = []; });
    
    shifts.forEach(shift => {
      shift.dutyStaff.forEach(st => {
        if (staffDutyDays[st.id]) staffDutyDays[st.id].push(shift.dayNumber);
      });
      shift.supportStaff?.forEach(st => {
        if (staffDutyDays[st.id]) staffDutyDays[st.id].push(shift.dayNumber);
      });
    });

    const sortedStaff = [...staffList].sort((a, b) => {
      return (previousBalances[a.id] || 0) - (previousBalances[b.id] || 0);
    });

    sortedStaff.forEach(st => {
      const currentDays = staffDutyDays[st.id] || [];
      let dutiesCount = currentDays.length;
      
      const prevDebt = previousBalances[st.id] || 0;
      let targetDuties = Math.round(targetWorkingDays / 3);

      if (isNoc) {
        // NOC Pilot Birimi: Kişi bazlı matematiksel denkleştirme
        // Devreden borç veya alacak yapay olarak asla silinmez; gerçek nöbet matematiğiyle dengelenir.
        const baselineDuties = Math.round(targetWorkingDays / 3);
        if (prevDebt <= -2) {
          targetDuties = baselineDuties + 1; // 2 gün veya üzeri borcu olan personele telafi için +1 nöbet
        } else if (prevDebt >= 2) {
          targetDuties = baselineDuties - 1; // 2 gün veya üzeri alacağı olan personele alacağını eritmesi için -1 nöbet
        } else {
          targetDuties = baselineDuties;
        }
      } else {
        const neededDays = targetWorkingDays - prevDebt;
        targetDuties = Math.round(neededDays / 3);
        if (prevDebt < 0) {
          targetDuties = Math.ceil(neededDays / 3);
        } else if (prevDebt > 0) {
          targetDuties = Math.floor(neededDays / 3);
        }
      }

      const absoluteMaxDuties = Math.ceil(totalDays / 3);
      if (targetDuties > absoluteMaxDuties) targetDuties = absoluteMaxDuties;
      
      const minAllowedDuties = Math.floor(targetWorkingDays / 3) - 2; 
      if (targetDuties < minAllowedDuties) targetDuties = minAllowedDuties;

      // EKSİK ÇALIŞANLARA (BORÇLULARA) VARDİYA EKLEME
      // D Grubu personeli SADECE Pazar ve Çarşamba günleri nöbet tutar; kesinlikle başka günlere destek yazılamaz.
      while (dutiesCount < targetDuties && st.groupId !== 'D') {
        let bestDay = null;
        let bestScore = -9999;
        
        for (let candidateDay = 1; candidateDay <= totalDays; candidateDay++) {
          if (currentDays.includes(candidateDay)) continue;
          
          const date = new Date(year, month, candidateDay);
          if (date.getDay() === 0) continue; // Pazar günlerine ekleme yapılmaz
          
          const prevDay = [...currentDays].filter((d) => d < candidateDay).sort((a, b) => b - a)[0];
          const nextDay = [...currentDays].filter((d) => d > candidateDay).sort((a, b) => a - b)[0];
          
          const restBefore = prevDay !== undefined ? candidateDay - prevDay - 1 : 99;
          const restAfter = nextDay !== undefined ? nextDay - candidateDay - 1 : 99;
          
          // En az 2 gün kesintisiz istirahat kuralı
          if (restBefore < 2 || restAfter < 2) continue;
          
          let score = 10;
          if (restBefore >= 2) score += 40;
          if (restAfter >= 2) score += 40;
          if (restBefore >= 3) score += 20;
          if (restAfter >= 3) score += 20;
          
          const shift = shifts[candidateDay - 1];
          if (!shift.supportStaff || shift.supportStaff.length === 0) {
            score += 30;
          } else {
            score -= 30;
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestDay = candidateDay;
          }
        }
        
        if (bestDay !== null) {
          const targetShift = shifts[bestDay - 1];
          targetShift.supportStaff = [...(targetShift.supportStaff || []), st];
          targetShift.isCompensated = true;
          currentDays.push(bestDay);
          currentDays.sort((a, b) => a - b);
          dutiesCount++;
          compensatedShiftsCount++;
        } else {
          break;
        }
      }

      // FAZLA ÇALIŞANLARA (ALACAKLILARA) VARDİYA EKSİLTME
      while (dutiesCount > targetDuties && st.groupId !== 'D') {
        let bestDayToRemove = null;
        let worstGapScore = -9999;
        
        for (const candidateDay of currentDays) {
           const sh = shifts[candidateDay - 1];
           if (sh.date.getDay() === 0) continue; // Pazar günleri tek gruptur, çıkartılamaz!
           
           const isDutyStaff = sh.dutyStaff.some(s => s.id === st.id);
           if (isDutyStaff && sh.dutyStaff.length <= 1 && (!sh.supportStaff || sh.supportStaff.length === 0)) {
               continue; // Vardiya boş kalır, silinemez
           }
           
           let score = 10;
           if (!sh.isWeekend) score += 50; 
           
           if (score > worstGapScore) {
               worstGapScore = score;
               bestDayToRemove = candidateDay;
           }
        }
        
        if (bestDayToRemove !== null) {
            const targetShift = shifts[bestDayToRemove - 1];
            targetShift.dutyStaff = targetShift.dutyStaff.filter(s => s.id !== st.id);
            if (targetShift.supportStaff) {
                targetShift.supportStaff = targetShift.supportStaff.filter(s => s.id !== st.id);
            }
            
            currentDays.splice(currentDays.indexOf(bestDayToRemove), 1);
            dutiesCount--;
        } else {
            break;
        }
      }
    });
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
    const currentMonthDifference = equivalentWorkDays - targetWorkingDays;
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
      targetWorkDays: targetWorkingDays,
      previousCarryoverDays: prevCarryover,
      currentMonthDifference,
      netBalanceDays,
      status,
    };
  });

  const validationWarnings = validateMonthSchedule(shifts, staffStats, staffList, hasGroupD);

  return {
    year,
    month,
    totalDays,
    targetWorkingDays,
    shifts,
    staffStats,
    staffList, 
    autoCompensated: enableAutoCompensate,
    compensatedShiftsCount,
    validationWarnings,
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

    const rotatedStaff = getRotatedStaff(department.staff, currentYear, currentMonthIndex);
    
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
