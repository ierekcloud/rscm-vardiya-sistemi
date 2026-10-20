import { generateMonthSchedule, DEFAULT_MPLS_STAFF } from './utils/shiftLogic';

function rotateStrategyA(y: number, m: number, staff: any[]) {
  const diff = (y - 2026) * 12 + (m - 9);
  const len = staff.length;
  const shiftAmount = (((diff * 4) % len + len) % len);
  const shifted = [...staff.slice(len - shiftAmount), ...staff.slice(0, len - shiftAmount)];
  const slotLayout = staff.map((s: any) => ({ groupId: s.groupId, orderInGroup: s.orderInGroup, roleNote: s.roleNote }));
  return shifted.map((s: any, idx: number) => ({ ...s, groupId: slotLayout[idx].groupId, orderInGroup: slotLayout[idx].orderInGroup, roleNote: slotLayout[idx].roleNote }));
}

let anyClash = false;
for (let y = 2026; y <= 2028; y++) {
  const startM = (y === 2026 ? 9 : 0);
  const endM = (y === 2028 ? 11 : 11);
  for (let m = startM; m <= endM; m++) {
    const nextY = m === 11 ? y + 1 : y;
    const nextM = m === 11 ? 0 : m + 1;

    const s1 = rotateStrategyA(y, m, DEFAULT_MPLS_STAFF);
    const s2 = rotateStrategyA(nextY, nextM, DEFAULT_MPLS_STAFF);

    const sched1 = generateMonthSchedule(y, m, undefined, s1);
    const sched2 = generateMonthSchedule(nextY, nextM, undefined, s2);

    const lastDay = sched1.shifts[sched1.shifts.length - 1];
    const firstDay = sched2.shifts[0];

    const lastStaff = lastDay.dutyStaff.map(s => s.name);
    const firstStaff = firstDay.dutyStaff.map(s => s.name);
    const clash = lastStaff.filter(n => firstStaff.includes(n));

    if (clash.length > 0) {
      anyClash = true;
      console.log(`CLASH at ${y}-${m+1} -> ${nextY}-${nextM+1}: ${clash.join(',')}`);
    }
  }
}

console.log('Any clash over 27 months in Strategy A?:', anyClash ? 'YES' : 'NO CLASHES! 100% CLEAN');
