const fs = require('fs');
let code = fs.readFileSync('src/utils/shiftLogic.ts', 'utf-8');

const regex = /\/\/ 2\. AŞAMA: OTOMATİK DENKLEŞTİRME VE BORÇ TELAFİSİ[\s\S]*?\/\/ 3\. AŞAMA: KESİNTİSİZ İSTİRAHAT KONTROLÜ/;

const newLogic = `// 2. AŞAMA: BİREYSEL OTOMATİK DENKLEŞTİRME (İsim/ID Bazlı Takip)
  let compensatedShiftsCount = 0;

  if (enableAutoCompensate) {
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
      const neededDays = targetWorkingDays - prevDebt;
      
      let targetDuties = Math.round(neededDays / 3);
      
      if (prevDebt < 0) {
        targetDuties = Math.ceil(neededDays / 3);
      } else if (prevDebt > 0) {
        targetDuties = Math.floor(neededDays / 3);
      }

      const absoluteMaxDuties = Math.ceil(totalDays / 3);
      if (targetDuties > absoluteMaxDuties) targetDuties = absoluteMaxDuties;
      
      const minAllowedDuties = Math.floor(targetWorkingDays / 3) - 2; 
      if (targetDuties < minAllowedDuties) targetDuties = minAllowedDuties;

      // EKSİK ÇALIŞANLARA (BORÇLULARA) VARDİYA EKLEME
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
          
          if (restBefore < 1 || restAfter < 1) continue;
          
          let score = 10;
          if (restBefore >= 2) score += 80;
          if (restAfter >= 2) score += 80;
          
          const shift = shifts[candidateDay - 1];
          if (!shift.supportStaff || shift.supportStaff.length === 0) {
            score += 30;
          } else {
            score -= 20;
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
      while (dutiesCount > targetDuties) {
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

  // 3. AŞAMA: KESİNTİSİZ İSTİRAHAT KONTROLÜ`;

code = code.replace(regex, newLogic);
fs.writeFileSync('src/utils/shiftLogic.ts', code);
