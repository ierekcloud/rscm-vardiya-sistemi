import { generateMonthSchedule, DEFAULT_DEPARTMENTS, getRotatedStaff, calculateTargetWorkingDays } from './utils/shiftLogic';

const nocDept = DEFAULT_DEPARTMENTS.find(d => d.id === 'dep-noc-6p')!;

let runningBalances: Record<string, number> = {};
nocDept.staff.forEach(s => { runningBalances[s.id] = 0; });

for (let y = 2026; y <= 2027; y++) {
  const startM = (y === 2026 ? 9 : 0);
  const endM = (y === 2027 ? 11 : 11);
  for (let m = startM; m <= endM; m++) {
    const rotated = getRotatedStaff(nocDept.staff, y, m, nocDept.shiftModel);
    const inputBalances: Record<string, number> = {};
    rotated.forEach(s => { inputBalances[s.id] = runningBalances[s.id] || 0; });
    const summary = generateMonthSchedule(y, m, undefined, rotated, {}, inputBalances);
    Object.keys(summary.staffStats).forEach(id => {
      runningBalances[id] = summary.staffStats[id].netBalanceDays;
    });
  }
}

console.log('NOC 6P Net Balances at end of 2027:');
nocDept.staff.forEach(s => {
  console.log(`${s.name}: ${runningBalances[s.id]}`);
});
