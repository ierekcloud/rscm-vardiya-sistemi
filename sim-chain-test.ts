import { generateMonthSchedule, DEFAULT_DEPARTMENTS } from './src/utils/shiftLogic';

const noc = DEFAULT_DEPARTMENTS.find(d => d.id === 'dep-noc').staff;

function rotateAll(staffList, year, month) {
  const sortedStaff = [...staffList].sort((a, b) => {
    const groupOrder = ['A', 'B', 'C', 'D'];
    if (a.groupId !== b.groupId) {
      return groupOrder.indexOf(a.groupId) - groupOrder.indexOf(b.groupId);
    }
    return (a.orderInGroup || 0) - (b.orderInGroup || 0);
  });
  const slotLayout = sortedStaff.map(s => ({ groupId: s.groupId, orderInGroup: s.orderInGroup }));
  const baseYear = 2026;
  const baseMonth = 9; // Ekim 2026
  const monthDiff = (year - baseYear) * 12 + (month - baseMonth);
  const len = sortedStaff.length;
  const shiftAmount = (monthDiff % len + len) % len;
  const shifted = [
    ...sortedStaff.slice(len - shiftAmount),
    ...sortedStaff.slice(0, len - shiftAmount)
  ];
  return shifted.map((s, idx) => ({
    ...s,
    groupId: slotLayout[idx].groupId,
    orderInGroup: slotLayout[idx].orderInGroup
  }));
}

// Emulate recursive chaining from base (Ekim 2026)
function computeBalancesFor(targetYear: number, targetMonth: number) {
  let balances: Record<string, number> = {};
  const baseYear = 2026;
  const baseMonth = 9;
  const totalMonths = (targetYear - baseYear) * 12 + (targetMonth - baseMonth);
  if (totalMonths <= 0) return {};

  for (let i = 0; i < totalMonths; i++) {
    const curMonth = (baseMonth + i) % 12;
    const curYear = baseYear + Math.floor((baseMonth + i) / 12);
    const rotated = rotateAll(noc, curYear, curMonth);
    const summary = generateMonthSchedule(curYear, curMonth, undefined, rotated, {}, balances, undefined, true);
    balances = {};
    Object.values(summary.staffStats).forEach(st => {
      balances[st.staff.id] = st.netBalanceDays;
    });
  }
  return balances;
}

for (let m = 9; m <= 11; m++) {
  const rotated = rotateAll(noc, 2026, m);
  const carry = computeBalancesFor(2026, m);
  const summary = generateMonthSchedule(2026, m, undefined, rotated, {}, carry, undefined, true);
  
  console.log(`\n=== Month ${m + 1} 2026 ===`);
  console.log(`Rotated staff:`, rotated.map(s => `${s.name}(${s.groupId}${s.orderInGroup})`).join(', '));
  Object.values(summary.staffStats).forEach(st => {
    console.log(`  ${st.staff.name} (${st.staff.groupId}): duties=${st.totalDuties}, equiv=${st.equivalentWorkDays}, target=${st.targetWorkDays}, prevCarry=${st.previousCarryoverDays}, net=${st.netBalanceDays}`);
  });
}
