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
    
    if (year === 2027 && month === 2) { // 2027-3 (March is index 2)
       console.log("March 2027 Shifts:");
       summary.shifts.forEach(sh => {
         const isHuseyinDuty = sh.dutyStaff.some(s => s.name.includes("Hüseyin"));
         const isHuseyinSupport = sh.supportStaff?.some(s => s.name.includes("Hüseyin"));
         if (isHuseyinDuty || isHuseyinSupport) {
            console.log(`Day ${sh.dayNumber} (${sh.dayName}) - Duty: ${isHuseyinDuty}, Support: ${isHuseyinSupport}`);
         }
       });
       const huseyin = summary.staffStats[rotatedStaff.find(s => s.name.includes("Hüseyin")).id];
       console.log("Huseyin Stats in March:", JSON.stringify(huseyin, null, 2));
    }
  }
}
