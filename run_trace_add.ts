import { DEFAULT_DEPARTMENTS, generateMonthSchedule, getRotatedStaff } from './src/utils/shiftLogic';

const noc = DEFAULT_DEPARTMENTS[0]; 
let runningBalances = {};

for (let year = 2026; year <= 2027; year++) {
  let startMonth = year === 2026 ? 8 : 0;
  for (let month = startMonth; month < 12; month++) {
    const rotatedStaff = getRotatedStaff(noc.staff, year, month);
    const summary = generateMonthSchedule(year, month, undefined, rotatedStaff, {}, runningBalances, undefined, true);
    
    rotatedStaff.forEach(st => {
      runningBalances[st.id] = summary.staffStats[st.id].netBalanceDays;
    });
    
    if (year === 2027 && month === 2) {
       console.log("March 2027 compensated shifts:");
       summary.shifts.forEach(sh => {
         if (sh.supportStaff && sh.supportStaff.length > 0) {
            console.log(`Day ${sh.dayNumber} Support:`, sh.supportStaff.map(s => s.name));
         }
       });
    }
  }
}
