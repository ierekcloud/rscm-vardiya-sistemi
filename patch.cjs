const fs = require('fs');
let code = fs.readFileSync('src/utils/shiftLogic.ts', 'utf-8');

const validationCode = `
function validateMonthSchedule(shifts: DayShift[], staffStats: Record<string, StaffShiftBalance>, staffList: StaffMember[], hasGroupD: boolean): string[] {
  const warnings: string[] = [];

  const staffShiftDays: Record<string, number[]> = {};
  staffList.forEach(s => staffShiftDays[s.id] = []);
  shifts.forEach(sh => {
     const allStaff = [...sh.dutyStaff, ...(sh.supportStaff || [])];
     allStaff.forEach(s => {
       if (staffShiftDays[s.id]) staffShiftDays[s.id].push(sh.dayNumber);
     });
  });

  staffList.forEach(s => {
    const days = staffShiftDays[s.id];
    // 1. Haftalık 6 gün sınırı (7 günlük periyotta 2'den fazla nöbet tutulamaz, 3 nöbet = 9 gün yapar)
    for (let i = 0; i < days.length - 2; i++) {
       if (days[i+2] - days[i] < 7) {
          warnings.push(\`\${s.name} (Grup \${s.groupId}), 7 günlük periyotta 3 nöbet tutmuş (Haftalık çalışma sınırı aşıldı).\`);
          break;
       }
    }

    // Bir personel aynı güne çift yazılmış mı?
    const uniqueDays = new Set(days);
    if (uniqueDays.size !== days.length) {
       warnings.push(\`\${s.name}, aynı güne birden fazla kez nöbete yazılmış.\`);
    }
  });

  shifts.forEach(sh => {
     // Eksik vardiya kontrolü
     const totalStaff = sh.dutyStaff.length + (sh.supportStaff ? sh.supportStaff.length : 0);
     if (totalStaff === 0) {
        warnings.push(\`\${sh.dateString} tarihinde hiç personel atanmamış!\`);
     }

     // Pazar günü özel kuralı
     if (sh.date.getDay() === 0) {
        if (hasGroupD && sh.dutyGroupId !== 'D') {
           warnings.push(\`\${sh.dateString} Pazar gününe D grubu dışında bir ana grup (\${sh.dutyGroupId}) atanmış.\`);
        }
        if (sh.supportStaff && sh.supportStaff.length > 0) {
           warnings.push(\`\${sh.dateString} Pazar gününe destek personeli eklenmiş (Kural ihlali).\`);
        }
     }
  });

  if (hasGroupD) {
      staffList.filter(s => s.groupId === 'D').forEach(dStaff => {
         const days = staffShiftDays[dStaff.id];
         days.forEach(dNum => {
            const sh = shifts[dNum - 1];
            if (sh.date.getDay() !== 0 && sh.date.getDay() !== 3) {
                warnings.push(\`\${dStaff.name} (D Grubu), Pazar veya Çarşamba dışındaki bir günde (\${sh.dateString} - \${sh.dayName}) nöbete yazılmış.\`);
            }
         });
      });
  }

  // ABC sırası kontrolü
  const regularGroups = ['A', 'B', 'C'].filter(g => staffList.some(s => s.groupId === g));
  if (regularGroups.length > 1) {
      let expectedNext: string | null = null;
      shifts.forEach(sh => {
         if (sh.date.getDay() !== 0 && regularGroups.includes(sh.dutyGroupId) && !sh.isOverridden) {
            if (expectedNext && sh.dutyGroupId !== expectedNext) {
               warnings.push(\`\${sh.dateString} tarihinde ardışık rotasyon bozuldu. Beklenen: \${expectedNext}, Atanan: \${sh.dutyGroupId}\`);
            }
            const currentIndex = regularGroups.indexOf(sh.dutyGroupId);
            expectedNext = regularGroups[(currentIndex + 1) % regularGroups.length];
         }
      });
  }

  return Array.from(new Set(warnings));
}
`;

// Insert the validation code before generateMonthSchedule
code = code.replace('export function generateMonthSchedule(', validationCode + '\nexport function generateMonthSchedule(');

// Add the call at the end of generateMonthSchedule
const returnStatement = `  return {
    year,
    month,
    totalDays,
    targetWorkingDays,
    shifts,
    staffStats,
    staffList, // Eklenen alan, rotasyonlu personelleri dışarı aktarır
    autoCompensated: enableAutoCompensate,
    compensatedShiftsCount,`;

const newReturnStatement = `  const validationWarnings = validateMonthSchedule(shifts, staffStats, staffList, hasGroupD);

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
    validationWarnings,`;

code = code.replace(returnStatement, newReturnStatement);

fs.writeFileSync('src/utils/shiftLogic.ts', code);
console.log('Patched shiftLogic.ts successfully.');
