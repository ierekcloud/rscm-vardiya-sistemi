import { DEFAULT_DEPARTMENTS, generateMonthSchedule, getRotatedStaff, calculateTargetWorkingDays } from './src/utils/shiftLogic';

const noc = DEFAULT_DEPARTMENTS[0]; 
let runningBalances = {};

for (let year = 2026; year <= 2027; year++) {
  let startMonth = year === 2026 ? 8 : 0; // Sept 2026 to Dec 2027
  for (let month = startMonth; month < 12; month++) {
    const rotatedStaff = getRotatedStaff(noc.staff, year, month);
    const summary = generateMonthSchedule(year, month, undefined, rotatedStaff, {}, runningBalances, undefined, true);
    
    console.log(`\n--- ${year}-${month + 1} ---`);
    console.log(`Target Working Days: ${calculateTargetWorkingDays(year, month)}`);
    rotatedStaff.forEach(st => {
      const stat = summary.staffStats[st.id];
      console.log(`${st.name.padEnd(20)} Group: ${st.groupId} | Net Balance: ${stat.netBalanceDays}`);
      runningBalances[st.id] = stat.netBalanceDays;
    });
  }
}
