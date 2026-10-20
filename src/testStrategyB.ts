import { generateMonthSchedule, DEFAULT_MPLS_STAFF, calculateTargetWorkingDays } from './utils/shiftLogic';

function testRotationStrategy(fn: (y: number, m: number, staff: any[]) => any[]) {
  let runningBalances: Record<string, number> = {};
  DEFAULT_MPLS_STAFF.forEach(s => { runningBalances[s.id] = 0; });

  for (let y = 2026; y <= 2027; y++) {
    const startM = (y === 2026 ? 9 : 0);
    const endM = (y === 2027 ? 11 : 11);
    for (let m = startM; m <= endM; m++) {
      const rotated = fn(y, m, DEFAULT_MPLS_STAFF);
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
  return { min, max, range, runningBalances };
}

// Strategy A: shift by 4 forward
console.log('Strategy A (shift 4 forward):', testRotationStrategy((y, m, staff) => {
  const diff = (y - 2026) * 12 + (m - 9);
  const len = staff.length;
  const shiftAmount = (((diff * 4) % len + len) % len);
  const shifted = [...staff.slice(len - shiftAmount), ...staff.slice(0, len - shiftAmount)];
  const slotLayout = staff.map((s: any) => ({ groupId: s.groupId, orderInGroup: s.orderInGroup, roleNote: s.roleNote }));
  return shifted.map((s: any, idx: number) => ({ ...s, groupId: slotLayout[idx].groupId, orderInGroup: slotLayout[idx].orderInGroup, roleNote: slotLayout[idx].roleNote }));
}));

// Strategy B: shift by 4 forward + in Group C, alternate Saturday and Sunday every month so orderInGroup swaps
console.log('Strategy B (shift 4 forward + alternate Sat/Sun):', testRotationStrategy((y, m, staff) => {
  const diff = (y - 2026) * 12 + (m - 9);
  const len = staff.length;
  const shiftAmount = (((diff * 4) % len + len) % len);
  const shifted = [...staff.slice(len - shiftAmount), ...staff.slice(0, len - shiftAmount)];
  const slotLayout = staff.map((s: any) => ({ groupId: s.groupId, orderInGroup: s.orderInGroup, roleNote: s.roleNote }));
  
  // If diff is odd, swap slots 8,9 with slots 10,11 in slotLayout so Team 1 and Team 2 alternate weekend days
  const effectiveLayout = [...slotLayout];
  if (diff % 2 === 1) {
    const t1_0 = effectiveLayout[8];
    const t1_1 = effectiveLayout[9];
    effectiveLayout[8] = effectiveLayout[10];
    effectiveLayout[9] = effectiveLayout[11];
    effectiveLayout[10] = t1_0;
    effectiveLayout[11] = t1_1;
  }

  return shifted.map((s: any, idx: number) => ({ ...s, groupId: effectiveLayout[idx].groupId, orderInGroup: effectiveLayout[idx].orderInGroup, roleNote: effectiveLayout[idx].roleNote }));
}));
