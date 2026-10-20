import { generateMonthSchedule, DEFAULT_DEPARTMENTS, getRotatedStaff } from './utils/shiftLogic';

const noc6p = DEFAULT_DEPARTMENTS.find(d => d.id === 'dep-noc-6p')!;

let anyClash = false;
for (let y = 2026; y <= 2028; y++) {
  const startM = (y === 2026 ? 9 : 0);
  const endM = (y === 2028 ? 11 : 11);
  for (let m = startM; m <= endM; m++) {
    const nextY = m === 11 ? y + 1 : y;
    const nextM = m === 11 ? 0 : m + 1;

    const s1 = getRotatedStaff(noc6p.staff, y, m, noc6p.shiftModel);
    const s2 = getRotatedStaff(noc6p.staff, nextY, nextM, noc6p.shiftModel);

    const sched1 = generateMonthSchedule(y, m, undefined, s1);
    const sched2 = generateMonthSchedule(nextY, nextM, undefined, s2);

    const lastDay = sched1.shifts[sched1.shifts.length - 1];
    const firstDay = sched2.shifts[0];

    const lastStaff = lastDay.dutyStaff.map(s => s.name);
    const firstStaff = firstDay.dutyStaff.map(s => s.name);
    const clash = lastStaff.filter(n => firstStaff.includes(n));

    if (clash.length > 0) {
      anyClash = true;
      console.log(`NOC 6P CLASH at ${y}-${m+1} (${lastDay.dayName} ${lastDay.dayNumber}) -> ${nextY}-${nextM+1} (${firstDay.dayName} ${firstDay.dayNumber}): ${clash.join(',')}`);
    }
  }
}

console.log('Any clash in NOC 6P?:', anyClash ? 'YES' : 'NO CLASHES!');
