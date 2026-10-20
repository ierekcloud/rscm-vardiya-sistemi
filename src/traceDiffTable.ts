import { generateMonthSchedule, DEFAULT_MPLS_STAFF, getRotatedStaff, calculateTargetWorkingDays } from './utils/shiftLogic';

const monthsList: { y: number; m: number; name: string }[] = [];
for (let y = 2026; y <= 2027; y++) {
  const startM = (y === 2026 ? 9 : 0);
  const endM = (y === 2027 ? 11 : 11);
  for (let m = startM; m <= endM; m++) {
    monthsList.push({ y, m, name: `${y}-${m+1}` });
  }
}

let runningBalances: Record<string, number> = {};
DEFAULT_MPLS_STAFF.forEach(s => { runningBalances[s.id] = 0; });

console.log('Month\tTgt\t' + DEFAULT_MPLS_STAFF.map(s => s.name).join('\t'));

for (const { y, m, name } of monthsList) {
  const rotated = getRotatedStaff(DEFAULT_MPLS_STAFF, y, m, 'STANDARD_3G');
  const inputBalances: Record<string, number> = {};
  rotated.forEach(s => { inputBalances[s.id] = runningBalances[s.id] || 0; });
  const summary = generateMonthSchedule(y, m, undefined, rotated, {}, inputBalances);

  const diffs: string[] = [];
  DEFAULT_MPLS_STAFF.forEach(st => {
    const stat = summary.staffStats[st.id];
    runningBalances[st.id] = stat.netBalanceDays;
    const cur = rotated.find(r => r.id === st.id);
    diffs.push(`${stat.totalDuties}n(${stat.currentMonthDifference >= 0 ? '+' : ''}${stat.currentMonthDifference}|${cur?.groupId}${cur?.orderInGroup})`);
  });
  console.log(`${name}\t${calculateTargetWorkingDays(y, m)}\t` + diffs.join('\t'));
}

console.log('\nFinal Net Balances at end of 2027:');
DEFAULT_MPLS_STAFF.forEach(st => {
  console.log(`${st.name}: ${runningBalances[st.id]}`);
});
