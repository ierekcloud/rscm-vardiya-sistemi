import { generateMonthSchedule, DEFAULT_MPLS_STAFF, calculateTargetWorkingDays } from './utils/shiftLogic';

function getRotatedStaffTest(staffList: any[], year: number, month: number, step: number) {
  const baseYear = 2026;
  const baseMonth = 9;
  const monthDiff = (year - baseYear) * 12 + (month - baseMonth);
  const len = staffList.length;
  const shiftAmount = (((monthDiff * step) % len + len) % len);
  const shifted = [
    ...staffList.slice(len - shiftAmount),
    ...staffList.slice(0, len - shiftAmount)
  ];
  const slotLayout = staffList.map((s: any) => ({ groupId: s.groupId, orderInGroup: s.orderInGroup, roleNote: s.roleNote }));
  return shifted.map((s: any, idx: number) => ({
    ...s,
    groupId: slotLayout[idx].groupId,
    orderInGroup: slotLayout[idx].orderInGroup,
    roleNote: slotLayout[idx].roleNote
  }));
}

for (const step of [4, -4, 1, -1, 2, -2, 3, -3]) {
  let runningBalances: Record<string, number> = {};
  DEFAULT_MPLS_STAFF.forEach(s => { runningBalances[s.id] = 0; });

  for (let y = 2026; y <= 2027; y++) {
    const startM = (y === 2026 ? 9 : 0);
    const endM = (y === 2027 ? 11 : 11);
    for (let m = startM; m <= endM; m++) {
      const rotated = getRotatedStaffTest(DEFAULT_MPLS_STAFF, y, m, step);
      const inputBalances: Record<string, number> = {};
      rotated.forEach(s => { inputBalances[s.id] = runningBalances[s.id] || 0; });
      const summary = generateMonthSchedule(y, m, undefined, rotated, {}, inputBalances);
      Object.keys(summary.staffStats).forEach(id => {
        runningBalances[id] = summary.staffStats[id].netBalanceDays;
      });
    }
  }

  const values = Object.values(runningBalances);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  console.log(`Step ${step}: Min=${min}, Max=${max}, Range=${range}, Balances:`, runningBalances);
}
