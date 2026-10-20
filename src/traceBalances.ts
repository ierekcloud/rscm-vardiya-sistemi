import { generateMonthSchedule, DEFAULT_MPLS_STAFF, getRotatedStaff, calculateTargetWorkingDays } from './utils/shiftLogic';

const runningBalances: Record<string, number> = {};
DEFAULT_MPLS_STAFF.forEach(s => { runningBalances[s.id] = 0; });

for (let y = 2026; y <= 2027; y++) {
  const startM = (y === 2026 ? 9 : 0);
  const endM = (y === 2027 ? 11 : 11);
  for (let m = startM; m <= endM; m++) {
    const rotated = getRotatedStaff(DEFAULT_MPLS_STAFF, y, m, 'STANDARD_3G');
    const inputBalances: Record<string, number> = {};
    rotated.forEach(s => { inputBalances[s.id] = runningBalances[s.id] || 0; });

    const summary = generateMonthSchedule(y, m, undefined, rotated, {}, inputBalances);
    
    // update running balances
    Object.keys(summary.staffStats).forEach(id => {
      runningBalances[id] = summary.staffStats[id].netBalanceDays;
    });

    console.log(`\n=== Year: ${y} Month: ${m + 1} (Days in month: ${new Date(y, m + 1, 0).getDate()}) Target: ${calculateTargetWorkingDays(y, m)} ===`);
    DEFAULT_MPLS_STAFF.forEach(st => {
      const stat = summary.staffStats[st.id];
      const cur = rotated.find(r => r.id === st.id);
      console.log(`  ${st.name} [Grp in this month: ${cur?.groupId}, order: ${cur?.orderInGroup}]: Duties=${stat.totalDuties}, Equiv=${stat.equivalentWorkDays}, Target=${stat.targetWorkingDays}, Diff=${stat.currentMonthDifference}, Prev=${stat.previousCarryover}, Net=${stat.netBalanceDays}`);
    });
  }
}
