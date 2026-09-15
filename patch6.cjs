const fs = require('fs');
let code = fs.readFileSync('src/utils/shiftLogic.ts', 'utf-8');

const safeValidationCode = `
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
       if (days[i+2] - days[i] < 7) {
          warnings.push(s.name + ' (Grup ' + s.groupId + '), 7 günlük periyotta 3 nöbet tutmuş (Haftalık çalışma sınırı aşıldı).');
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
            if (sh && sh.date.getDay() !== 0 && sh.date.getDay() !== 3) {
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
`;

code = code.replace(/function validateMonthSchedule[\s\S]*?return warnings;\n\}/, safeValidationCode.trim());

fs.writeFileSync('src/utils/shiftLogic.ts', code);
